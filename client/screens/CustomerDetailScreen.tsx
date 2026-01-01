import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { InvoiceCard } from "@/components/InvoiceCard";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { EmptyState } from "@/components/EmptyState";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { Customer, Invoice } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CustomerDetailRouteProp = RouteProp<RootStackParamList, "CustomerDetail">;

type Tab = "details" | "history";

export default function CustomerDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CustomerDetailRouteProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});

  const loadData = useCallback(async () => {
    const [customerData, invoicesData] = await Promise.all([
      storage.getCustomerById(route.params.customerId),
      storage.getInvoicesByCustomerId(route.params.customerId),
    ]);
    
    if (customerData) {
      setCustomer(customerData);
      setEditedCustomer(customerData);
    }
    setInvoices(invoicesData.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, [route.params.customerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalPurchases = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const handleSave = async () => {
    if (!customer) return;
    
    if (!editedCustomer.name?.trim()) {
      Alert.alert("Error", "Customer name is required");
      return;
    }
    
    if (!editedCustomer.phone?.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }
    
    try {
      const updateData = {
        name: editedCustomer.name,
        phone: editedCustomer.phone,
        email: editedCustomer.email,
        address: editedCustomer.address,
        notes: editedCustomer.notes,
      };
      const result = await storage.updateCustomer(customer.id, updateData);
      if (result) {
        setCustomer(result);
        setEditedCustomer(result);
        setIsEditing(false);
        Alert.alert("Success", "Customer updated successfully");
      } else {
        Alert.alert("Error", "Failed to update customer. Phone number may already be in use.");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update customer";
      if (errorMessage.includes("phone")) {
        Alert.alert("Error", "A customer with this phone number already exists");
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleDelete = () => {
    if (invoices.length > 0) {
      Alert.alert(
        "Cannot Delete",
        `This customer has ${invoices.length} invoice(s). Please delete all invoices first before deleting this customer.`
      );
      return;
    }
    
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (customer) {
              const deleted = await storage.deleteCustomer(customer.id);
              if (deleted) {
                navigation.goBack();
              } else {
                Alert.alert("Error", "Failed to delete customer. The customer may have invoices.");
              }
            }
          },
        },
      ]
    );
  };

  const handleCreateInvoice = () => {
    if (customer) {
      navigation.navigate("CreateInvoice", { customerId: customer.id });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigation.navigate("InvoiceDetail", { invoiceId: invoice.id });
  };

  if (!customer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: BrandColors.primary }]}>
          <ThemedText type="h2" style={styles.initials}>{initials}</ThemedText>
        </View>
        <ThemedText type="h3" style={styles.customerName}>{customer.name}</ThemedText>
        <ThemedText type="body" secondary>{customer.phone}</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText type="priceTotal" style={{ color: BrandColors.primary }}>
              Rs. {totalPurchases.toLocaleString("en-IN")}
            </ThemedText>
            <ThemedText type="caption" secondary>Total Purchases</ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText type="h3">{invoices.length}</ThemedText>
            <ThemedText type="caption" secondary>Invoices</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab("details")}
          style={[
            styles.tab,
            activeTab === "details" && { borderBottomColor: BrandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <ThemedText
            type="bodyMedium"
            style={{ color: activeTab === "details" ? BrandColors.primary : theme.textSecondary }}
          >
            Details
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("history")}
          style={[
            styles.tab,
            activeTab === "history" && { borderBottomColor: BrandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <ThemedText
            type="bodyMedium"
            style={{ color: activeTab === "history" ? BrandColors.primary : theme.textSecondary }}
          >
            Purchase History
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === "details" ? (
        <KeyboardAwareScrollViewCompat 
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsHeader}>
            <ThemedText type="h4">Customer Information</ThemedText>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Feather name={isEditing ? "x" : "edit-2"} size={20} color={BrandColors.primary} />
            </Pressable>
          </View>

          <Input
            label="Name"
            value={editedCustomer.name || ""}
            onChangeText={(text) => setEditedCustomer({ ...editedCustomer, name: text })}
            editable={isEditing}
          />
          
          <Input
            label="Phone"
            value={editedCustomer.phone || ""}
            onChangeText={(text) => setEditedCustomer({ ...editedCustomer, phone: text })}
            editable={isEditing}
            keyboardType="phone-pad"
          />
          
          <Input
            label="Email"
            value={editedCustomer.email || ""}
            onChangeText={(text) => setEditedCustomer({ ...editedCustomer, email: text })}
            editable={isEditing}
            keyboardType="email-address"
          />
          
          <Input
            label="Address"
            value={editedCustomer.address || ""}
            onChangeText={(text) => setEditedCustomer({ ...editedCustomer, address: text })}
            editable={isEditing}
            multiline
            numberOfLines={3}
          />
          
          <Input
            label="Notes"
            value={editedCustomer.notes || ""}
            onChangeText={(text) => setEditedCustomer({ ...editedCustomer, notes: text })}
            editable={isEditing}
            multiline
            numberOfLines={3}
          />

          {isEditing ? (
            <Button onPress={handleSave} style={styles.saveButton}>
              Save Changes
            </Button>
          ) : null}

          <View style={styles.actions}>
            <Button onPress={handleCreateInvoice} style={styles.actionButton}>
              Create Invoice
            </Button>
            <Pressable onPress={handleDelete} style={[styles.deleteButton, { borderColor: theme.error }]}>
              <Feather name="trash-2" size={18} color={theme.error} />
              <ThemedText style={{ color: theme.error, marginLeft: Spacing.sm }}>Delete Customer</ThemedText>
            </Pressable>
          </View>
        </KeyboardAwareScrollViewCompat>
      ) : (
        <View style={styles.historyContainer}>
          {invoices.length > 0 ? (
            <FlatList
              data={invoices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <InvoiceCard invoice={item} onPress={() => handleViewInvoice(item)} />
              )}
              contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="file-text"
              title="No purchase history"
              description="This customer hasn't made any purchases yet"
              actionLabel="Create Invoice"
              onAction={handleCreateInvoice}
            />
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  initials: {
    color: "#FFFFFF",
  },
  customerName: {
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.xl,
    gap: Spacing["4xl"],
  },
  stat: {
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  content: {
    padding: Spacing.lg,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
  actions: {
    marginTop: Spacing["2xl"],
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  historyContainer: {
    flex: 1,
  },
});
