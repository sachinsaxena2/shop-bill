import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, DefaultCategories } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { generateInvoiceMessage } from "@/lib/whatsapp";
import { generatePdfAndShare, sendPdfToWhatsApp } from "@/lib/pdf";
import { Invoice, InvoiceStatus, ShopSettings, CategoryData } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type InvoiceDetailRouteProp = RouteProp<RootStackParamList, "InvoiceDetail">;

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case "paid":
      return BrandColors.success;
    case "pending":
      return BrandColors.warning;
    case "cancelled":
      return BrandColors.error;
    default:
      return BrandColors.primary;
  }
};

export default function InvoiceDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InvoiceDetailRouteProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    loadData();
  }, [route.params.invoiceId]);

  const loadData = async () => {
    const [invoiceData, settingsData, categoriesData] = await Promise.all([
      storage.getInvoiceById(route.params.invoiceId),
      storage.getSettings(),
      storage.getCategories(),
    ]);
    setInvoice(invoiceData);
    setSettings(settingsData);
    setCategories(categoriesData);
  };

  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find((c) => c.categoryId === categoryId);
    if (category) return category.label;
    const defaultCat = DefaultCategories.find((c) => c.id === categoryId);
    return defaultCat?.label || categoryId;
  };

  const handleUpdateStatus = (newStatus: InvoiceStatus) => {
    Alert.alert(
      "Update Status",
      `Mark this invoice as ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            if (invoice) {
              try {
                const updated = await storage.updateInvoice(invoice.id, { status: newStatus });
                if (updated) {
                  setInvoice(updated);
                  Alert.alert("Success", `Invoice marked as ${newStatus}`);
                } else {
                  Alert.alert("Error", "Failed to update invoice status");
                }
              } catch (error) {
                console.error("Error updating invoice status:", error);
                Alert.alert("Error", "Failed to update invoice status");
              }
            }
          },
        },
      ]
    );
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleSharePdf = async () => {
    if (invoice && settings) {
      setIsGeneratingPdf(true);
      try {
        const result = await generatePdfAndShare(invoice, settings, categories);
        if (result.shared) {
          await storage.updateInvoice(invoice.id, { status: "paid" });
          setInvoice({ ...invoice, status: "paid" });
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        Alert.alert("Error", "Failed to generate PDF. Please try again.");
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  const handleSendWhatsApp = async () => {
    if (invoice && settings) {
      setIsSendingWhatsApp(true);
      try {
        const result = await sendPdfToWhatsApp(invoice, settings, categories);
        if (result.shared) {
          await storage.updateInvoice(invoice.id, { status: "paid" });
          setInvoice({ ...invoice, status: "paid" });
        }
      } catch (error) {
        console.error("Error sending to WhatsApp:", error);
        Alert.alert("Error", "Failed to send to WhatsApp. Please try again.");
      } finally {
        setIsSendingWhatsApp(false);
      }
    }
  };

  const handleCopyInvoice = async () => {
    if (invoice && settings) {
      const message = generateInvoiceMessage(invoice, settings, categories);
      await Clipboard.setStringAsync(message);
      Alert.alert("Copied", "Invoice details copied to clipboard");
    }
  };

  const handleViewCustomer = () => {
    if (invoice) {
      navigation.navigate("CustomerDetail", { customerId: invoice.customerId });
    }
  };

  const handleDeleteInvoice = () => {
    Alert.alert(
      "Delete Invoice",
      `Are you sure you want to delete invoice ${invoice?.invoiceNumber}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (invoice) {
              const deleted = await storage.deleteInvoice(invoice.id);
              if (deleted) {
                navigation.goBack();
              } else {
                Alert.alert("Error", "Failed to delete invoice");
              }
            }
          },
        },
      ]
    );
  };

  if (!invoice || !settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const statusColor = getStatusColor(invoice.status);
  const createdAtDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const formattedDate = createdAtDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.invoiceHeader, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.invoiceNumberRow}>
            <ThemedText type="h3">{invoice.invoiceNumber}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <ThemedText type="caption" style={[styles.statusText, { color: statusColor }]}>
                {invoice.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" secondary style={styles.date}>{formattedDate}</ThemedText>
        </View>

        <Pressable
          onPress={handleViewCustomer}
          style={[styles.customerCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <View style={[styles.customerAvatar, { backgroundColor: BrandColors.primary }]}>
            <ThemedText style={styles.customerInitials}>
              {invoice.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.customerInfo}>
            <ThemedText type="bodyMedium">{invoice.customerName}</ThemedText>
            <ThemedText type="small" secondary>{invoice.customerPhone}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>Items</ThemedText>
          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < invoice.items.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: 1 },
              ]}
            >
              <View style={styles.itemInfo}>
                <ThemedText type="bodyMedium">{getCategoryLabel(item.category)}</ThemedText>
                {item.description ? (
                  <ThemedText type="caption" secondary>{item.description}</ThemedText>
                ) : null}
                <ThemedText type="small" secondary>
                  {item.quantity} x Rs. {(Number(item.unitPrice) || 0).toLocaleString("en-IN")}
                </ThemedText>
              </View>
              <ThemedText type="price">Rs. {(Number(item.lineTotal) || 0).toLocaleString("en-IN")}</ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <ThemedText type="body">Subtotal</ThemedText>
            <ThemedText type="price">Rs. {(Number(invoice.subtotal) || 0).toLocaleString("en-IN")}</ThemedText>
          </View>
          
          {(Number(invoice.discountAmount) || 0) > 0 ? (
            <View style={styles.summaryRow}>
              <ThemedText type="body">
                Discount ({invoice.discountType === "percent" ? `${invoice.discountValue}%` : `Rs. ${invoice.discountValue}`})
              </ThemedText>
              <ThemedText type="price" style={{ color: BrandColors.success }}>
                -Rs. {(Number(invoice.discountAmount) || 0).toLocaleString("en-IN")}
              </ThemedText>
            </View>
          ) : null}
          
          <View style={[styles.totalRow, { borderTopColor: theme.divider }]}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="priceTotal" style={{ color: BrandColors.primary }}>
              Rs. {(Number(invoice.total) || 0).toLocaleString("en-IN")}
            </ThemedText>
          </View>
        </View>

        {invoice.notes ? (
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>Notes</ThemedText>
            <ThemedText type="body">{invoice.notes}</ThemedText>
          </View>
        ) : null}

        <View style={styles.statusActions}>
          <ThemedText type="h4" style={styles.sectionTitle}>Update Status</ThemedText>
          <View style={styles.statusButtons}>
            {(["paid", "pending", "cancelled"] as InvoiceStatus[]).map((status) => (
              <Pressable
                key={status}
                onPress={() => handleUpdateStatus(status)}
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: invoice.status === status ? getStatusColor(status) : theme.backgroundSecondary,
                    borderColor: getStatusColor(status),
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ 
                    color: invoice.status === status ? "#FFFFFF" : getStatusColor(status),
                    fontWeight: "600",
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleDeleteInvoice}
          style={[styles.deleteButton, { borderColor: theme.error }]}
        >
          <Feather name="trash-2" size={18} color={theme.error} />
          <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm }}>
            Delete Invoice
          </ThemedText>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleCopyInvoice}
          style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="copy" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={handleSharePdf}
          disabled={isGeneratingPdf}
          style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="share-2" size={20} color={theme.text} />
        </Pressable>
        <Button
          onPress={handleSendWhatsApp}
          disabled={isSendingWhatsApp}
          style={[styles.shareButton, { backgroundColor: BrandColors.whatsapp }]}
        >
          <View style={styles.shareButtonContent}>
            <Feather name="send" size={18} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
              {isSendingWhatsApp ? "Sending..." : "Send to WhatsApp"}
            </ThemedText>
          </View>
        </Button>
      </View>
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
  invoiceHeader: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  invoiceNumberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontWeight: "600",
  },
  date: {
    marginTop: Spacing.xs,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInitials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  customerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    color: BrandColors.primary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.lg,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  statusActions: {
    marginBottom: Spacing.xl,
  },
  statusButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    flex: 1,
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
