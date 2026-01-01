import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import { Invoice, ShopSettings, CategoryData } from "@/types";
import { DefaultCategories } from "@/constants/theme";

const formatPhoneForWhatsApp = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.substring(1);
  }
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
};

const getCategoryLabel = (categoryId: string, categories: CategoryData[]): string => {
  const category = categories.find((c) => c.categoryId === categoryId);
  if (category) return category.label;
  const defaultCat = DefaultCategories.find((c) => c.id === categoryId);
  return defaultCat?.label || categoryId;
};

export const generateInvoiceHtml = (
  invoice: Invoice,
  settings: ShopSettings,
  categories: CategoryData[]
): string => {
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${getCategoryLabel(item.category, categories)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${item.description || "-"}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">Rs. ${item.unitPrice.toLocaleString("en-IN")}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">Rs. ${item.lineTotal.toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const discountHtml =
    invoice.discountAmount > 0
      ? `
      <tr>
        <td colspan="4" style="padding: 8px 12px; text-align: right;">Discount (${
          invoice.discountType === "percent"
            ? `${invoice.discountValue}%`
            : `Rs. ${invoice.discountValue}`
        })</td>
        <td style="padding: 8px 12px; text-align: right; color: #10B981;">-Rs. ${invoice.discountAmount.toLocaleString("en-IN")}</td>
      </tr>
    `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 40px;
            color: #1F2937;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #E45DF0;
          }
          .shop-info h1 {
            color: #E45DF0;
            font-size: 28px;
            margin-bottom: 4px;
          }
          .shop-info .tagline {
            color: #6B7280;
            font-size: 12px;
            margin-bottom: 12px;
          }
          .shop-info p {
            color: #4B5563;
            font-size: 12px;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-info h2 {
            color: #E45DF0;
            font-size: 24px;
            margin-bottom: 8px;
          }
          .invoice-info p {
            color: #6B7280;
            font-size: 12px;
          }
          .invoice-number {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
          }
          .customer-section {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .customer-section h3 {
            color: #E45DF0;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .customer-section p {
            color: #4B5563;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #E45DF0;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          th:nth-child(3), th:nth-child(4), th:nth-child(5) {
            text-align: right;
          }
          th:nth-child(3) {
            text-align: center;
          }
          .summary-table {
            margin-left: auto;
            width: 300px;
          }
          .summary-table td {
            padding: 8px 12px;
          }
          .summary-table .total-row {
            background: #E45DF0;
            color: white;
            font-weight: 600;
            font-size: 16px;
          }
          .notes {
            background: #FEF3C7;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .notes h4 {
            color: #92400E;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .notes p {
            color: #78350F;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #9CA3AF;
            font-size: 11px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-paid {
            background: #D1FAE5;
            color: #059669;
          }
          .status-pending {
            background: #FEF3C7;
            color: #D97706;
          }
          .status-cancelled {
            background: #FEE2E2;
            color: #DC2626;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-info">
            <h1>${settings.shopName}</h1>
            <p class="tagline">Find your signature look</p>
            ${settings.address ? `<p>${settings.address}</p>` : ""}
            ${settings.phone ? `<p>Tel: ${settings.phone}</p>` : ""}
            ${settings.gstNumber ? `<p>GST: ${settings.gstNumber}</p>` : ""}
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p class="invoice-number">${invoice.invoiceNumber}</p>
            <p>Date: ${formattedDate}</p>
          </div>
        </div>

        <div class="customer-section">
          <h3>Bill To</h3>
          <p><strong>${invoice.customerName}</strong></p>
          <p>Phone: ${invoice.customerPhone}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="summary-table">
          <tr>
            <td colspan="4" style="text-align: right;">Subtotal</td>
            <td style="text-align: right;">Rs. ${invoice.subtotal.toLocaleString("en-IN")}</td>
          </tr>
          ${discountHtml}
          <tr class="total-row">
            <td colspan="4" style="text-align: right; padding: 12px;">Total</td>
            <td style="text-align: right; padding: 12px;">Rs. ${invoice.total.toLocaleString("en-IN")}</td>
          </tr>
        </table>

        ${
          invoice.notes
            ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p style="font-size: 14px; font-weight: 500; margin-bottom: 16px;">Thank you for shopping with us!</p>
          <div style="background: #FEF3C7; padding: 12px 16px; border-radius: 6px; display: inline-block; text-align: left; margin-bottom: 16px;">
            <p style="margin: 0 0 4px 0; color: #78350F; font-size: 12px;">Exchange is applicable only within 2 days</p>
            <p style="margin: 0; color: #78350F; font-size: 12px;">No exchange on jewellery and sale items.</p>
          </div>
          <p style="font-size: 11px; color: #9CA3AF;">This is a computer-generated invoice.</p>
        </div>
      </body>
    </html>
  `;
};

export const generatePdfAndShare = async (
  invoice: Invoice,
  settings: ShopSettings,
  categories: CategoryData[]
): Promise<{ uri: string; shared: boolean }> => {
  const html = generateInvoiceHtml(invoice, settings, categories);

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return { uri: "", shared: true };
  }

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice ${invoice.invoiceNumber}`,
      UTI: "com.adobe.pdf",
    });
    return { uri, shared: true };
  }

  Alert.alert(
    "PDF Generated",
    "The PDF has been created. Sharing is not available on this device.",
    [{ text: "OK" }]
  );
  return { uri, shared: false };
};

export const sendPdfToWhatsApp = async (
  invoice: Invoice,
  settings: ShopSettings,
  categories: CategoryData[]
): Promise<{ uri: string; shared: boolean }> => {
  const html = generateInvoiceHtml(invoice, settings, categories);

  if (Platform.OS === "web") {
    const whatsappPhone = formatPhoneForWhatsApp(invoice.customerPhone);
    const message = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber} from ${settings.shopName}\n` +
      `Total: Rs. ${invoice.total.toLocaleString("en-IN")}\n\n` +
      `Thank you for shopping with us!`
    );
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`;
    await Linking.openURL(whatsappUrl);
    await Print.printAsync({ html });
    return { uri: "", shared: true };
  }

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Invoice for ${invoice.customerName} (${invoice.customerPhone})`,
      UTI: "com.adobe.pdf",
    });
    
    return new Promise((resolve) => {
      Alert.alert(
        "Confirm Send",
        `Was the invoice sent successfully to ${invoice.customerName} (${invoice.customerPhone})?`,
        [
          { 
            text: "No", 
            style: "cancel",
            onPress: () => resolve({ uri, shared: false }) 
          },
          { 
            text: "Yes, Sent", 
            onPress: () => resolve({ uri, shared: true }) 
          },
        ],
        { cancelable: false }
      );
    });
  }
  
  return { uri, shared: false };
};

export const generatePdfUri = async (
  invoice: Invoice,
  settings: ShopSettings,
  categories: CategoryData[]
): Promise<string> => {
  const html = generateInvoiceHtml(invoice, settings, categories);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
};
