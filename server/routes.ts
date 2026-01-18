import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage, initializeDefaultCategories } from "./storage";

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         invoiceNumber:
 *           type: string
 *         customerId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [paid, pending, cancelled]
 *         items:
 *           type: array
 *           items:
 *             type: object
 *         subtotal:
 *           type: number
 *         discountType:
 *           type: string
 *         discountValue:
 *           type: number
 *         total:
 *           type: number
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         defaultPrice:
 *           type: number
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Settings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         shopName:
 *           type: string
 *         tagline:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         gstNumber:
 *           type: string
 *         currency:
 *           type: string
 *         taxRate:
 *           type: number
 *         invoicePrefix:
 *           type: string
 *         lastInvoiceNumber:
 *           type: integer
 */

export async function registerRoutes(app: Express): Promise<Server> {
  await initializeDefaultCategories();

  /**
   * @swagger
   * /api/customers:
   *   get:
   *     summary: Get all customers
   *     tags: [Customers]
   *     responses:
   *       200:
   *         description: List of customers
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Customer'
   */
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  /**
   * @swagger
   * /api/customers/{id}:
   *   get:
   *     summary: Get customer by ID
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Customer details
   *       404:
   *         description: Customer not found
   */
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  /**
   * @swagger
   * /api/customers/phone/{phone}:
   *   get:
   *     summary: Get customer by phone number
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: phone
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Customer details or null
   */
  app.get("/api/customers/phone/:phone", async (req, res) => {
    try {
      const customer = await storage.getCustomerByPhone(req.params.phone);
      res.json(customer || null);
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  /**
   * @swagger
   * /api/customers:
   *   post:
   *     summary: Create a new customer
   *     tags: [Customers]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, phone]
   *             properties:
   *               name:
   *                 type: string
   *               phone:
   *                 type: string
   *               email:
   *                 type: string
   *               address:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Customer created
   *       400:
   *         description: Phone number already exists
   */
  app.post("/api/customers", async (req, res) => {
    try {
      const { name, phone, email, address, notes } = req.body;
      const existingCustomer = await storage.getCustomerByPhone(phone);
      if (existingCustomer) {
        return res.status(400).json({ error: "A customer with this phone number already exists" });
      }
      const customer = await storage.createCustomer({ name, phone, email, address, notes });
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  /**
   * @swagger
   * /api/customers/{id}:
   *   put:
   *     summary: Update a customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Customer'
   *     responses:
   *       200:
   *         description: Customer updated
   *       404:
   *         description: Customer not found
   *   delete:
   *     summary: Delete a customer
   *     tags: [Customers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Customer deleted
   *       404:
   *         description: Customer not found
   */
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { phone, name, email, address, notes } = req.body;
      if (phone) {
        const existingCustomer = await storage.getCustomerByPhone(phone);
        if (existingCustomer && existingCustomer.id !== req.params.id) {
          return res.status(400).json({ error: "A customer with this phone number already exists" });
        }
      }
      const updateData = { name, phone, email, address, notes };
      const customer = await storage.updateCustomer(req.params.id, updateData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  /**
   * @swagger
   * /api/invoices:
   *   get:
   *     summary: Get all invoices
   *     tags: [Invoices]
   *     responses:
   *       200:
   *         description: List of invoices
   *   post:
   *     summary: Create a new invoice
   *     tags: [Invoices]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               customerId:
   *                 type: string
   *               items:
   *                 type: array
   *               subtotal:
   *                 type: number
   *               total:
   *                 type: number
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Invoice created
   */
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  /**
   * @swagger
   * /api/invoices/{id}:
   *   get:
   *     summary: Get invoice by ID
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invoice details
   *       404:
   *         description: Invoice not found
   *   put:
   *     summary: Update an invoice
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Invoice ID (UUID)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               customerId:
   *                 type: string
   *               customerName:
   *                 type: string
   *               customerPhone:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [paid, pending, cancelled]
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *               subtotal:
   *                 type: number
   *               discountType:
   *                 type: string
   *                 enum: [percent, fixed]
   *               discountValue:
   *                 type: number
   *               discountAmount:
   *                 type: number
   *               total:
   *                 type: number
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Invoice updated successfully
   *       404:
   *         description: Invoice not found
   *   delete:
   *     summary: Delete an invoice
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Invoice ID (UUID)
   *     responses:
   *       200:
   *         description: Invoice deleted successfully
   *       404:
   *         description: Invoice not found
   */
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoiceById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByCustomerId(req.params.customerId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceNumber = await storage.getNextInvoiceNumber();
      const invoice = await storage.createInvoice({
        ...req.body,
        invoiceNumber,
      });
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     responses:
   *       200:
   *         description: List of products
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     responses:
   *       201:
   *         description: Product created
   */
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of categories
   *   post:
   *     summary: Create a new category
   *     tags: [Categories]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               categoryId:
   *                 type: string
   *               label:
   *                 type: string
   *               icon:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               sortOrder:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Category created
   * /api/categories/{id}:
   *   put:
   *     summary: Update a category
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Category ID (UUID)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               label:
   *                 type: string
   *               icon:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               sortOrder:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Category updated successfully
   *       404:
   *         description: Category not found
   *   delete:
   *     summary: Delete a category
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Category ID (UUID)
   *     responses:
   *       200:
   *         description: Category deleted successfully
   *       404:
   *         description: Category not found
   */
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  /**
   * @swagger
   * /api/settings:
   *   get:
   *     summary: Get shop settings
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Shop settings
   *   put:
   *     summary: Update shop settings
   *     tags: [Settings]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Settings'
   *     responses:
   *       200:
   *         description: Settings updated
   */
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
