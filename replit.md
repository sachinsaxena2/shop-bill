# Nazaara Billing App

## Overview

Nazaara is a retail billing mobile application built with React Native and Expo, designed for small retail shops. The app enables shop owners to manage customers, create and track invoices, maintain product catalogs, and share invoices via WhatsApp. It follows Material Design 3 guidelines with a professional teal and coral color scheme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, using the new architecture enabled. The app targets Android, iOS, and web platforms.

**Navigation**: Uses React Navigation with a hybrid approach:
- Drawer navigator for main sections (Dashboard, Customers, Invoices, Products, Settings)
- Native stack navigator for modal screens (CreateInvoice, CustomerDetail, InvoiceDetail, CreateCustomer)

**State Management**: TanStack Query for server state management with a custom query client configured for API requests.

**UI Components**: Custom themed components following Material Design 3 principles:
- ThemedText/ThemedView for consistent theming with light/dark mode support
- Reanimated-powered animations for buttons, cards, and interactive elements
- Safe area handling throughout the app

**Data Storage**: PostgreSQL database for all data persistence via API endpoints. The app uses TanStack Query for data fetching and caching.

**Path Aliases**: 
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

### Backend Architecture

**Server**: Express.js server with TypeScript, running on Node.js. The server handles API routes and serves the web build in production.

**API Structure**: Routes are registered under `/api` prefix with full CRUD operations for customers, invoices, products, categories, and settings.

**Database Schema**: Drizzle ORM with PostgreSQL. Schema defined in `shared/schema.ts` using Drizzle's pgTable definitions with Zod validation via drizzle-zod.

**Storage Layer**: PostgreSQL database accessed through `DatabaseStorage` class in `server/storage.ts`.

### Data Models

- **Customers**: id, name, phone, email, address, notes, timestamps
- **Invoices**: id, invoiceNumber, customerId, status (paid/pending/cancelled), items array, subtotal, discount info, total, notes, timestamps
- **Products**: id, name, category, defaultPrice, isActive, timestamps
- **Settings**: shopName, tagline, address, phone, gstNumber, currency, taxRate, invoicePrefix, lastInvoiceNumber

### Key Design Decisions

**Database-Backed**: PostgreSQL database for all data persistence ensures data consistency and reliability.

**PDF Invoice Sharing**: Invoices are generated as professional PDF documents and shared via the native share sheet, which allows sharing to WhatsApp or any other app.

**Dynamic Category System**: Categories are stored in the database and can be customized. Default categories (suit, kurti, top, jewellery, trousers, pants) are created on first use.

## External Dependencies

**Core Services**:
- PostgreSQL database (via DATABASE_URL environment variable)
- Expo build and development services

**Third-Party Integrations**:
- WhatsApp for invoice sharing via native share sheet
- Expo ecosystem (splash screen, status bar, image handling, clipboard, web browser, haptics, print, sharing)

**Key NPM Packages**:
- `expo` and related Expo packages for mobile app infrastructure
- `expo-print` and `expo-sharing` for PDF generation and sharing
- `drizzle-orm` and `drizzle-zod` for database schema and validation
- `@tanstack/react-query` for data fetching and caching
- `react-native-reanimated` for performant animations
- `react-native-gesture-handler` and `react-native-screens` for navigation
- `@react-native-async-storage/async-storage` for local persistence
- `express` for the backend server
- `pg` for PostgreSQL connectivity