import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  customers,
  invoices,
  products,
  categories,
  settings,
  type Customer,
  type InsertCustomer,
  type Invoice,
  type InsertInvoice,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Settings,
} from "@shared/schema";

export interface IStorage {
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(data: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  getInvoices(): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | undefined>;
  getInvoicesByCustomerId(customerId: string): Promise<Invoice[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getNextInvoiceNumber(): Promise<string>;

  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  createCategory(data: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getSettings(): Promise<Settings>;
  updateSettings(data: Partial<Settings>): Promise<Settings>;
}

class DatabaseStorage implements IStorage {
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.phone, phone));
    return result[0];
  }

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(data).returning();
    return result[0];
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  async getInvoicesByCustomerId(customerId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(data).returning();
    return result[0];
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return result[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const settingsData = await this.getSettings();
    const nextNumber = settingsData.lastInvoiceNumber + 1;
    await db
      .update(settings)
      .set({ lastInvoiceNumber: nextNumber })
      .where(eq(settings.id, settingsData.id));
    return `${settingsData.invoicePrefix}${nextNumber.toString().padStart(5, "0")}`;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(data).returning();
    return result[0];
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSettings(): Promise<Settings> {
    const result = await db.select().from(settings);
    if (result.length === 0) {
      const newSettings = await db
        .insert(settings)
        .values({
          shopName: "Nazaara",
          tagline: "Exclusive Fashion & Style",
          currency: "INR",
          taxRate: "0",
          invoicePrefix: "NZ-",
          lastInvoiceNumber: 0,
        })
        .returning();
      return newSettings[0];
    }
    return result[0];
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const result = await db.update(settings).set(data).where(eq(settings.id, current.id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();

export async function initializeDefaultCategories() {
  const existing = await db.select().from(categories);
  if (existing.length === 0) {
    const defaultCategories = [
      { categoryId: "suit", label: "Suit", icon: "shopping-bag", sortOrder: 0 },
      { categoryId: "kurti", label: "Kurti", icon: "layout", sortOrder: 1 },
      { categoryId: "top", label: "Top", icon: "airplay", sortOrder: 2 },
      { categoryId: "jewellery", label: "Jewellery", icon: "award", sortOrder: 3 },
      { categoryId: "trousers", label: "Trousers", icon: "align-left", sortOrder: 4 },
      { categoryId: "pants", label: "Pants", icon: "sidebar", sortOrder: 5 },
    ];
    await db.insert(categories).values(defaultCategories);
  }
}
