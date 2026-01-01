export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  category: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CategoryData {
  id: string;
  categoryId: string;
  label: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export type DiscountType = "percent" | "fixed";
export type InvoiceStatus = "paid" | "pending" | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address?: string;
  phone?: string;
  gstNumber?: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  lastInvoiceNumber: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  invoiceCount: number;
  paidAmount: number;
  pendingAmount: number;
}
