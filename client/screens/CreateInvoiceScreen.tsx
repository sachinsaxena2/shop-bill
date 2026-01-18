import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { View, StyleSheet, Pressable, Alert, Modal, ScrollView, TextInput } from "react-native";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InvoiceItemRow } from "@/components/InvoiceItemRow";
import { CustomerCard } from "@/components/CustomerCard";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, DefaultCategories, CategoryId } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { sendInvoiceViaWhatsApp } from "@/lib/whatsapp";
import { Customer, InvoiceItem, DiscountType, ShopSettings, CategoryData, Invoice } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateInvoiceRouteProp = RouteProp<RootStackParamList, "CreateInvoice">;

const generateItemId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptyItem = (): InvoiceItem => ({
  id: generateItemId(),
  category: "suit",
  description: "",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0,
});

export default function CreateInvoiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateInvoiceRouteProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isSavingRef = useRef(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([createEmptyItem()]);
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [notes, setNotes] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (e.g., after adding a customer)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      title: editingInvoice ? "Edit Invoice" : "Create Invoice",
    });
  }, [editingInvoice, navigation]);

  useEffect(() => {
    if (route.params?.customerId) {
      loadCustomerById(route.params.customerId);
    }
    if (route.params?.invoiceId) {
      loadInvoiceForEdit(route.params.invoiceId);
    }
  }, [route.params?.customerId, route.params?.invoiceId]);

  const loadData = async () => {
    const [customersData, settingsData, categoriesData, invoicesData] = await Promise.all([
      storage.getCustomers(),
      storage.getSettings(),
      storage.getCategories(),
      storage.getInvoices(),
    ]);
    setCustomers(customersData);
    setSettings(settingsData);
    setCategories(categoriesData.sort((a, b) => a.label.localeCompare(b.label)));
    setInvoices(invoicesData);
  };

  const loadInvoiceForEdit = async (invoiceId: string) => {
    const invoice = await storage.getInvoiceById(invoiceId);
    if (invoice) {
      setEditingInvoice(invoice);
      const customer = await storage.getCustomerById(invoice.customerId);
      if (customer) setSelectedCustomer(customer);
      setItems(invoice.items);
      setDiscountType(invoice.discountType);
      setDiscountValue(invoice.discountValue.toString());
      setNotes(invoice.notes || "");
    }
  };

  // Memoize customer totals - calculates ONCE when invoices change, not on every render
  const customerTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    invoices.forEach(inv => {
      totals[inv.customerId] = (totals[inv.customerId] || 0) + inv.total;
    });
    return totals;
  }, [invoices]);

  // Memoize filtered customers - only filters when search or customers change
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter((c) => 
      c.name.toLowerCase().includes(query) || 
      c.phone.includes(query)
    );
  }, [customers, searchQuery]);

  // Memoize customer card renderer to prevent recreating function on every render
  const renderCustomerItem = useCallback(({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      totalPurchases={customerTotals[item.id] || 0}
      onPress={() => handleSelectCustomer(item)}
    />
  ), [customerTotals]);

  const handleOpenCustomerPicker = () => {
    // Data is already fresh from useFocusEffect, just open the modal
    setShowCustomerPicker(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerPicker(false);
    setSearchQuery("");
  };

  const handleAddNewCustomer = () => {
    setShowCustomerPicker(false);
    setSearchQuery("");
    navigation.navigate("CreateCustomer");
  };

  const getCustomerTotalPurchases = (customerId: string): number => {
    return invoices
      .filter(inv => inv.customerId === customerId)
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const loadCustomerById = async (customerId: string) => {
    const customer = await storage.getCustomerById(customerId);
    if (customer) setSelectedCustomer(customer);
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = discountType === "percent"
    ? subtotal * (parseFloat(discountValue) || 0) / 100
    : parseFloat(discountValue) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleAddItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setItems(items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length === 1) {
      setItems([createEmptyItem()]);
    } else {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const handleSelectCategory = (itemId: string, category: CategoryId) => {
    handleUpdateItem(itemId, { category });
    setShowCategoryPicker(null);
  };

  const validateInvoice = (): boolean => {
    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return false;
    }

    const validItems = items.filter((item) => item.unitPrice > 0);
    if (validItems.length === 0) {
      Alert.alert("Error", "Please add at least one item with a price");
      return false;
    }

    return true;
  };

  const handleSaveInvoice = async (sendWhatsApp: boolean = false) => {
    if (isSavingRef.current) return;
    if (!validateInvoice() || !selectedCustomer || !settings) return;

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const validItems = items.filter((item) => item.unitPrice > 0);
      
      let invoice: Invoice;
      
      if (editingInvoice) {
        // Update existing invoice
        const updated = await storage.updateInvoice(editingInvoice.id, {
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          status: sendWhatsApp ? "paid" : editingInvoice.status,
          items: validItems,
          subtotal,
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount,
          total,
          notes: notes || undefined,
        });
        if (!updated) {
          throw new Error("Failed to update invoice");
        }
        invoice = updated;
      } else {
        // Create new invoice
        invoice = await storage.saveInvoice({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          status: sendWhatsApp ? "paid" : "pending",
          items: validItems,
          subtotal,
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount,
          total,
          notes: notes || undefined,
        });
      }

      if (sendWhatsApp) {
        await sendInvoiceViaWhatsApp(invoice, settings, categories);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving invoice:", error);
      Alert.alert("Error", "Failed to save invoice");
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Customer</ThemedText>
          {selectedCustomer ? (
            <Pressable
              onPress={handleOpenCustomerPicker}
              style={[styles.customerSelected, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: BrandColors.primary }]}>
                <ThemedText style={styles.initials}>
                  {selectedCustomer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.customerInfo}>
                <ThemedText type="bodyMedium">{selectedCustomer.name}</ThemedText>
                <ThemedText type="small" secondary>{selectedCustomer.phone}</ThemedText>
              </View>
              <Feather name="chevron-down" size={20} color={theme.textSecondary} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleOpenCustomerPicker}
              style={[styles.selectCustomer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            >
              <Feather name="user-plus" size={20} color={BrandColors.primary} />
              <ThemedText type="body" style={{ color: BrandColors.primary, marginLeft: Spacing.sm }}>
                Select Customer
              </ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Items</ThemedText>
            <Pressable onPress={handleAddItem} style={styles.addButton}>
              <Feather name="plus" size={18} color={BrandColors.primary} />
              <ThemedText type="small" style={{ color: BrandColors.primary, marginLeft: Spacing.xs }}>
                Add Item
              </ThemedText>
            </Pressable>
          </View>
          
          {items.map((item) => (
            <InvoiceItemRow
              key={item.id}
              item={item}
              onUpdate={(updates) => handleUpdateItem(item.id, updates)}
              onRemove={() => handleRemoveItem(item.id)}
              onSelectCategory={() => setShowCategoryPicker(item.id)}
            />
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <ThemedText type="body">Subtotal</ThemedText>
            <ThemedText type="price">Rs. {subtotal.toLocaleString("en-IN")}</ThemedText>
          </View>
          
          <View style={styles.discountRow}>
            <ThemedText type="body">Discount</ThemedText>
            <View style={styles.discountInputs}>
              <View style={styles.discountTypeToggle}>
                <Pressable
                  onPress={() => setDiscountType("percent")}
                  style={[
                    styles.discountTypeButton,
                    { backgroundColor: discountType === "percent" ? BrandColors.primary : theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: discountType === "percent" ? "#FFFFFF" : theme.text }}
                  >
                    %
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setDiscountType("fixed")}
                  style={[
                    styles.discountTypeButton,
                    { backgroundColor: discountType === "fixed" ? BrandColors.primary : theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: discountType === "fixed" ? "#FFFFFF" : theme.text }}
                  >
                    Rs.
                  </ThemedText>
                </Pressable>
              </View>
              <View style={[styles.discountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Feather name="minus" size={14} color={theme.textSecondary} />
                <TextInput
                  value={discountValue}
                  onChangeText={setDiscountValue}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.placeholder}
                  style={[styles.discountTextInput, { color: theme.text }]}
                />
              </View>
            </View>
          </View>
          
          {discountAmount > 0 ? (
            <View style={styles.summaryRow}>
              <ThemedText type="small" secondary>Discount Amount</ThemedText>
              <ThemedText type="small" style={{ color: BrandColors.success }}>
                -Rs. {discountAmount.toLocaleString("en-IN")}
              </ThemedText>
            </View>
          ) : null}
          
          <View style={[styles.totalRow, { borderTopColor: theme.divider }]}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="priceTotal" style={{ color: BrandColors.primary }}>
              Rs. {total.toLocaleString("en-IN")}
            </ThemedText>
          </View>
        </View>

        <Input
          label="Notes (optional)"
          placeholder="Add any notes for this invoice..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          onPress={() => handleSaveInvoice(false)}
          disabled={isSaving}
          style={[styles.footerButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <ThemedText style={{ color: theme.text }}>
            {editingInvoice ? "Save Changes" : "Save Invoice"}
          </ThemedText>
        </Button>
        <Button
          onPress={() => handleSaveInvoice(true)}
          disabled={isSaving}
          style={[styles.footerButton, { backgroundColor: BrandColors.whatsapp }]}
        >
          <View style={styles.whatsappButtonContent}>
            <Feather name="send" size={18} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
              {editingInvoice ? "Update & Send" : "Generate & Send"}
            </ThemedText>
          </View>
        </Button>
      </View>

      <Modal
        visible={showCustomerPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomerPicker(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border, paddingTop: insets.top + Spacing.lg }]}>
            <Pressable onPress={() => setShowCustomerPicker(false)}>
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
            <ThemedText type="h4">Select Customer</ThemedText>
            <Pressable onPress={handleAddNewCustomer}>
              <Feather name="user-plus" size={24} color={BrandColors.primary} />
            </Pressable>
          </View>
          
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <FlashList
              data={filteredCustomers}
              renderItem={renderCustomerItem}
              getItemType={() => "customer"}
              ListEmptyComponent={
                <View style={styles.emptyCustomers}>
                  <ThemedText secondary>No customers found</ThemedText>
                  <Pressable onPress={handleAddNewCustomer} style={styles.addCustomerLink}>
                    <ThemedText type="link">Add new customer</ThemedText>
                  </Pressable>
                </View>
              }
            />
          </View>
        </ThemedView>
      </Modal>

      <Modal
        visible={showCategoryPicker !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCategoryPicker(null)}
      >
        <Pressable 
          style={styles.categoryModalOverlay} 
          onPress={() => setShowCategoryPicker(null)}
        >
          <View style={[styles.categoryModalContent, { backgroundColor: theme.backgroundRoot }]}>
            <ThemedText type="h4" style={styles.categoryModalTitle}>Select Category</ThemedText>
            {(categories.length > 0 ? categories : DefaultCategories.map(c => ({ categoryId: c.id, label: c.label, icon: c.icon })).sort((a, b) => a.label.localeCompare(b.label))).map((cat: any) => (
              <Pressable
                key={cat.categoryId || cat.id}
                onPress={() => showCategoryPicker && handleSelectCategory(showCategoryPicker, cat.categoryId || cat.id)}
                style={[styles.categoryOption, { borderBottomColor: theme.divider }]}
              >
                <Feather name={cat.icon as any} size={20} color={theme.text} />
                <ThemedText type="body" style={styles.categoryLabel}>{cat.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: BrandColors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  customerSelected: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  customerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  selectCustomer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  discountInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  discountTypeToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  discountTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  discountInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    // Match height with price input
    height: 36,
    // Fit icon + input for ~4 digits
    width: 88,
  },
  discountTextInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 0,
    fontSize: 16,
    textAlign: "right",
    // No border since container has it
    borderWidth: 0,
    backgroundColor: "transparent",
    // Ensure text stays within bounds
    minWidth: 0,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  footer: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerButton: {
    flex: 1,
  },
  whatsappButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
  },
  customerList: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  emptyCustomers: {
    alignItems: "center",
    padding: Spacing["3xl"],
  },
  addCustomerLink: {
    marginTop: Spacing.md,
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  categoryModalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  categoryModalTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  categoryLabel: {
    marginLeft: Spacing.lg,
  },
});
