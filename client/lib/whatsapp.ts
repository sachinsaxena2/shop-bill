import { Linking, Platform, Alert } from "react-native";
import { Invoice, ShopSettings, CategoryData } from "@/types";
import { DefaultCategories } from "@/constants/theme";

const getCategoryLabel = (categoryId: string, categories: CategoryData[]): string => {
  const category = categories.find((c) => c.categoryId === categoryId);
  if (category) return category.label;
  const defaultCat = DefaultCategories.find((c) => c.id === categoryId);
  return defaultCat?.label || categoryId;
};

const formatCurrency = (amount: number, currency: string = "INR"): string => {
  if (currency === "INR") {
    return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
};

export const generateInvoiceMessage = (invoice: Invoice, settings: ShopSettings, categories: CategoryData[] = []): string => {
  const lines: string[] = [];
  const createdAtDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  
  lines.push(`*${settings.shopName}*`);
  lines.push(`_Find your signature look_`);
  if (settings.address) lines.push(settings.address);
  if (settings.phone) lines.push(`Tel: ${settings.phone}`);
  if (settings.gstNumber) lines.push(`GST: ${settings.gstNumber}`);
  lines.push("");
  lines.push("----------------------------");
  lines.push(`*INVOICE: ${invoice.invoiceNumber}*`);
  lines.push(`Date: ${createdAtDate.toLocaleDateString("en-IN")}`);
  lines.push("----------------------------");
  lines.push("");
  lines.push(`*Customer:* ${invoice.customerName}`);
  lines.push(`*Phone:* ${invoice.customerPhone}`);
  lines.push("");
  lines.push("*Items:*");
  lines.push("");
  
  invoice.items.forEach((item, index) => {
    const categoryLabel = getCategoryLabel(item.category, categories);
    const description = item.description ? ` - ${item.description}` : "";
    lines.push(`${index + 1}. ${categoryLabel}${description}`);
    lines.push(`   Qty: ${item.quantity} x ${formatCurrency(Number(item.unitPrice) || 0, settings.currency)} = ${formatCurrency(Number(item.lineTotal) || 0, settings.currency)}`);
  });
  
  lines.push("");
  lines.push("----------------------------");
  lines.push(`*Subtotal:* ${formatCurrency(Number(invoice.subtotal) || 0, settings.currency)}`);
  
  if (Number(invoice.discountValue) > 0) {
    const discountLabel = invoice.discountType === "percent" 
      ? `${invoice.discountValue}%` 
      : formatCurrency(Number(invoice.discountValue) || 0, settings.currency);
    lines.push(`*Discount (${discountLabel}):* -${formatCurrency(Number(invoice.discountAmount) || 0, settings.currency)}`);
  }
  
  lines.push("");
  lines.push(`*TOTAL: ${formatCurrency(Number(invoice.total) || 0, settings.currency)}*`);
  lines.push("----------------------------");
  lines.push("");
  lines.push("Thank you for shopping with us :)");
  lines.push("");
  lines.push("_Exchange is applicable only within 2 days_");
  lines.push("_No exchange on jewellery and sale items._");
  
  return lines.join("\n");
};

export const sendInvoiceViaWhatsApp = async (
  invoice: Invoice, 
  settings: ShopSettings,
  categories: CategoryData[] = []
): Promise<boolean> => {
  try {
    const message = generateInvoiceMessage(invoice, settings, categories);
    const phone = invoice.customerPhone.replace(/[^0-9]/g, "");
    const phoneWithCountryCode = phone.startsWith("91") ? phone : `91${phone}`;
    
    const webWhatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
    
    if (Platform.OS === "web") {
      await Linking.openURL(webWhatsappUrl);
      return true;
    }
    
    const whatsappUrl = `whatsapp://send?phone=${phoneWithCountryCode}&text=${encodeURIComponent(message)}`;
    const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpenWhatsApp) {
      await Linking.openURL(whatsappUrl);
      return true;
    } else {
      Alert.alert(
        "WhatsApp Not Found",
        "Please install WhatsApp to send invoices directly. You can also copy the invoice and share it manually.",
        [{ text: "OK" }]
      );
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    Alert.alert("Error", "Failed to open WhatsApp. Please try again.");
    return false;
  }
};
