import { apiRequest, getApiUrl } from "./query-client";
import { Customer, Invoice, Product, ShopSettings, CategoryData } from "@/types";

export const defaultSettings: ShopSettings = {
  shopName: "Nazaara",
  tagline: "Retail Billing Made Simple",
  address: "",
  phone: "",
  gstNumber: "",
  currency: "INR",
  taxRate: 0,
  invoicePrefix: "NZ-",
  lastInvoiceNumber: 0,
};

async function fetchApi<T>(path: string): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const storage = {
  async getCustomers(): Promise<Customer[]> {
    try {
      const data = await fetchApi<any[]>("/api/customers");
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || undefined,
        address: c.address || undefined,
        notes: c.notes || undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting customers:", error);
      return [];
    }
  },

  async saveCustomer(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const res = await apiRequest("POST", "/api/customers", customer);
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    try {
      const res = await apiRequest("PUT", `/api/customers/${id}`, updates);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      return null;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await apiRequest("DELETE", `/api/customers/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      return false;
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const data = await fetchApi<any>(`/api/customers/${id}`);
      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting customer:", error);
      return null;
    }
  },

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const data = await fetchApi<any>(`/api/customers/phone/${phone}`);
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting customer by phone:", error);
      return null;
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await fetchApi<any[]>("/api/invoices");
      return data.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        customerId: i.customerId,
        customerName: i.customerName,
        customerPhone: i.customerPhone,
        status: i.status,
        items: i.items,
        subtotal: parseFloat(i.subtotal),
        discountType: i.discountType,
        discountValue: parseFloat(i.discountValue),
        discountAmount: parseFloat(i.discountAmount),
        total: parseFloat(i.total),
        notes: i.notes || undefined,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting invoices:", error);
      return [];
    }
  },

  async saveInvoice(invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">): Promise<Invoice> {
    const res = await apiRequest("POST", "/api/invoices", {
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      status: invoice.status,
      items: invoice.items,
      subtotal: invoice.subtotal.toString(),
      discountType: invoice.discountType,
      discountValue: invoice.discountValue.toString(),
      discountAmount: invoice.discountAmount.toString(),
      total: invoice.total.toString(),
      notes: invoice.notes,
    });
    const data = await res.json();
    return {
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      status: data.status,
      items: data.items,
      subtotal: parseFloat(data.subtotal),
      discountType: data.discountType,
      discountValue: parseFloat(data.discountValue),
      discountAmount: parseFloat(data.discountAmount),
      total: parseFloat(data.total),
      notes: data.notes || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const res = await apiRequest("PUT", `/api/invoices/${id}`, updates);
      const data = await res.json();
      return {
        id: data.id,
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: data.status,
        items: data.items,
        subtotal: parseFloat(data.subtotal),
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        discountAmount: parseFloat(data.discountAmount),
        total: parseFloat(data.total),
        notes: data.notes || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error updating invoice:", error);
      return null;
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      await apiRequest("DELETE", `/api/invoices/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return false;
    }
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const data = await fetchApi<any>(`/api/invoices/${id}`);
      return {
        id: data.id,
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: data.status,
        items: data.items,
        subtotal: parseFloat(data.subtotal),
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        discountAmount: parseFloat(data.discountAmount),
        total: parseFloat(data.total),
        notes: data.notes || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error getting invoice:", error);
      return null;
    }
  },

  async getInvoicesByCustomerId(customerId: string): Promise<Invoice[]> {
    try {
      const data = await fetchApi<any[]>(`/api/invoices/customer/${customerId}`);
      return data.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        customerId: i.customerId,
        customerName: i.customerName,
        customerPhone: i.customerPhone,
        status: i.status,
        items: i.items,
        subtotal: parseFloat(i.subtotal),
        discountType: i.discountType,
        discountValue: parseFloat(i.discountValue),
        discountAmount: parseFloat(i.discountAmount),
        total: parseFloat(i.total),
        notes: i.notes || undefined,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting customer invoices:", error);
      return [];
    }
  },

  async getProducts(): Promise<Product[]> {
    try {
      const data = await fetchApi<any[]>("/api/products");
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        defaultPrice: parseFloat(p.defaultPrice),
        isActive: p.isActive,
        createdAt: p.createdAt,
      }));
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  },

  async saveProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const res = await apiRequest("POST", "/api/products", {
      name: product.name,
      category: product.category,
      defaultPrice: product.defaultPrice.toString(),
      isActive: product.isActive,
    });
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      defaultPrice: parseFloat(data.defaultPrice),
      isActive: data.isActive,
      createdAt: data.createdAt,
    };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const updateData: any = { ...updates };
      if (updates.defaultPrice !== undefined) {
        updateData.defaultPrice = updates.defaultPrice.toString();
      }
      const res = await apiRequest("PUT", `/api/products/${id}`, updateData);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        defaultPrice: parseFloat(data.defaultPrice),
        isActive: data.isActive,
        createdAt: data.createdAt,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiRequest("DELETE", `/api/products/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },

  async getCategories(): Promise<CategoryData[]> {
    try {
      const data = await fetchApi<any[]>("/api/categories");
      return data.map((c) => ({
        id: c.id,
        categoryId: c.categoryId,
        label: c.label,
        icon: c.icon,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
      }));
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  async saveCategory(category: Omit<CategoryData, "id">): Promise<CategoryData> {
    const res = await apiRequest("POST", "/api/categories", category);
    const data = await res.json();
    return {
      id: data.id,
      categoryId: data.categoryId,
      label: data.label,
      icon: data.icon,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    };
  },

  async updateCategory(id: string, updates: Partial<CategoryData>): Promise<CategoryData | null> {
    try {
      const res = await apiRequest("PUT", `/api/categories/${id}`, updates);
      const data = await res.json();
      return {
        id: data.id,
        categoryId: data.categoryId,
        label: data.label,
        icon: data.icon,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return null;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await apiRequest("DELETE", `/api/categories/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  },

  async getSettings(): Promise<ShopSettings> {
    try {
      const data = await fetchApi<any>("/api/settings");
      return {
        shopName: data.shopName,
        tagline: data.tagline || "",
        address: data.address || "",
        phone: data.phone || "",
        gstNumber: data.gstNumber || "",
        currency: data.currency,
        taxRate: parseFloat(data.taxRate) || 0,
        invoicePrefix: data.invoicePrefix,
        lastInvoiceNumber: data.lastInvoiceNumber,
      };
    } catch (error) {
      console.error("Error getting settings:", error);
      return defaultSettings;
    }
  },

  async updateSettings(updates: Partial<ShopSettings>): Promise<ShopSettings> {
    try {
      const updateData: any = { ...updates };
      if (updates.taxRate !== undefined) {
        updateData.taxRate = updates.taxRate.toString();
      }
      const res = await apiRequest("PUT", "/api/settings", updateData);
      const data = await res.json();
      return {
        shopName: data.shopName,
        tagline: data.tagline || "",
        address: data.address || "",
        phone: data.phone || "",
        gstNumber: data.gstNumber || "",
        currency: data.currency,
        taxRate: parseFloat(data.taxRate) || 0,
        invoicePrefix: data.invoicePrefix,
        lastInvoiceNumber: data.lastInvoiceNumber,
      };
    } catch (error) {
      console.error("Error updating settings:", error);
      return defaultSettings;
    }
  },

  async getDailySummary(date: string): Promise<{ totalSales: number; invoiceCount: number; paidAmount: number; pendingAmount: number }> {
    const invoices = await storage.getInvoices();
    const dayInvoices = invoices.filter((i) => {
      const invoiceDate = new Date(i.createdAt).toISOString().split("T")[0];
      return invoiceDate === date && i.status !== "cancelled";
    });

    const totalSales = dayInvoices.reduce((sum, i) => sum + i.total, 0);
    const invoiceCount = dayInvoices.length;
    const paidAmount = dayInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = dayInvoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.total, 0);

    return { totalSales, invoiceCount, paidAmount, pendingAmount };
  },
};
