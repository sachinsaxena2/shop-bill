# Nazaara Billing App - Design Guidelines

## Platform & Design System
**Material Design 3 for Android** - Use modern, clean Material You components with adaptive color schemes suitable for a professional retail environment.

**Color Palette:**
- Background: Very Light Pink (#FBE8FC / RGB 251, 232, 252) - soft, elegant retail aesthetic
- Primary: Deep Purple (#7B2D8E) - for buttons and interactive elements, provides strong contrast
- Secondary: Bright Purple (#E45DF0) - for accents and highlights
- Text: Dark Purple (#3D1A45) - high contrast for readability on pink background
- Text Secondary: Muted Purple (#6B4A70) - for secondary information
- Surface/Cards: White (#FFFFFF) for content cards
- Error: Standard Material Red (#B00020)
- Success: Forest Green (#2E7D32) for completed transactions

**Typography:**
- Headings: Poppins SemiBold (20sp for screen titles, 16sp for section headers)
- Body: Roboto Regular (14sp for content, 12sp for labels)
- Numbers/Prices: Roboto Medium (18sp for totals, 16sp for line items)

## Authentication & Access
**Auth Required** - Business application with backend integration
- Google Sign-In (primary SSO option for Android)
- Include email/password as fallback for shop employees
- Role-based access: Owner/Manager/Staff (mentioned in Settings)
- Login screen: Nazaara branding with shop name, tagline "Retail Billing Made Simple"
- Include terms of service and privacy policy links

## Navigation Architecture
**Primary Navigation: Navigation Drawer + FAB**

**Drawer Menu Items:**
1. Dashboard (default view)
2. Customers
3. Invoices
4. Products & Categories
5. Reports
6. Settings
7. Logout

**Floating Action Button (FAB):**
- Positioned bottom-right on Dashboard and Customers screens
- Label: "New Bill" with receipt icon
- Opens Invoice Creation flow as full-screen modal

## Screen Specifications

### 1. Dashboard Screen
**Purpose:** Quick overview of daily sales and recent activity
**Layout:**
- Material Top App Bar (elevated) with hamburger menu icon (left), "Nazaara" title (center), notification bell (right)
- Scrollable content with top padding: insets.top + 16dp
- Bottom padding: insets.bottom + 80dp (for FAB clearance)

**Content Blocks:**
- Summary Cards: Today's sales total, number of invoices, pending payments
- Recent Invoices List: Last 5 transactions with customer name, amount, time
- Quick Actions: "New Bill" (FAB), "View All Invoices", "Add Customer"

### 2. Invoice Creation Screen (Full-Screen Modal)
**Purpose:** Create and send customer invoices
**Layout:**
- Material Top App Bar: Back button (left), "New Invoice" title, "Save Draft" icon (right)
- Scrollable form with top padding: 16dp, bottom padding: insets.bottom + 16dp
- Submit button: Floating above keyboard in Material Button style

**Form Sections:**
1. Customer Selection
   - Autocomplete dropdown with search
   - "+ Add New Customer" quick action below
2. Items Section
   - Repeatable item rows (up to 20 items)
   - Each row: Category dropdown (Suit, Kurti, Top, Jewellery, Trousers, Pants), Quantity stepper, Price input
   - "+ Add Item" text button after each row
3. Pricing Summary Card (sticky at bottom when scrolling)
   - Subtotal (auto-calculated)
   - Discount field (percentage or fixed amount toggle)
   - Tax (if applicable)
   - **Total in bold, larger font**
4. Action Buttons
   - Primary: "Generate & Send" (opens WhatsApp with pre-filled invoice)
   - Secondary: "Save Invoice" (outlined button)

### 3. Customers Screen
**Purpose:** Manage customer database
**Layout:**
- Top App Bar: Hamburger menu, "Customers" title, search icon (right)
- Search Bar: Expandable from search icon, filters by name/phone
- Scrollable list with top padding: 16dp, bottom padding: insets.bottom + 80dp

**Customer List Item:**
- Avatar circle with initials
- Name (16sp), Phone number (12sp secondary text)
- Total purchases amount (right-aligned, 14sp)
- Tap to view customer detail screen

### 4. Customer Detail Screen (Modal)
**Purpose:** View purchase history and edit customer info
**Layout:**
- Top App Bar: Back button, customer name, edit icon
- Tabbed content: "Details" and "Purchase History"
- Details Tab: Name, Phone, Email (optional), Address, Notes
- Purchase History Tab: Chronological list of invoices with date, items, amount

### 5. Invoices Screen
**Purpose:** Browse all invoices with filters
**Layout:**
- Top App Bar: Hamburger menu, "Invoices" title, filter icon
- Filter Chips: "Today", "This Week", "This Month", date range picker
- Grouped list: Invoices grouped by date
- Each Invoice Card: Invoice number, customer name, date/time, total amount, status badge (Paid/Pending)
- Tap to view invoice detail with option to resend on WhatsApp

### 6. Products & Categories Screen
**Purpose:** Manage product catalog and pricing
**Layout:**
- Top App Bar: Hamburger menu, "Products" title, add icon
- Category tabs: All, Suit, Kurti, Top, Jewellery, Trousers, Pants
- Grid or list view toggle
- Product cards: Name, default price, category tag, edit icon

### 7. Settings Screen
**Purpose:** App configuration and account management
**Layout:**
- Top App Bar: Back button, "Settings" title
- Grouped settings list:
  - Account: Profile, Change Password, Logout
  - Business: Shop name, GST number, Address, Logo upload
  - Preferences: Currency, Tax rate, Invoice numbering format
  - Advanced: Data backup, Export data, Delete account (nested)

## Visual Design Patterns

**Cards & Elevation:**
- Use Material Cards with 2dp elevation for content containers
- Increase to 4dp elevation on press for interactive cards
- Invoice summary card: 4dp elevation with slight border

**Interactive Feedback:**
- All buttons: Ripple effect in primary color at 20% opacity
- FAB: 6dp elevation, lifts to 12dp on press
- List items: Background color shift to surface variant on press

**Forms:**
- Material Outlined Text Fields for all inputs
- Dropdowns: Material Exposed Dropdown Menu
- Number inputs: Include increment/decrement buttons for quantity
- Validation: Error text in red below fields, shake animation on submit error

**WhatsApp Integration:**
- Use WhatsApp green (#25D366) for "Send on WhatsApp" buttons
- Show WhatsApp icon next to button text
- Generate invoice as formatted text message with shop details, items table, and payment instructions

## Critical Assets
1. **Nazaara Shop Logo** - Square format (512x512px) for app icon and invoice header
2. **Category Icons** - Simple line icons for each clothing category (Suit, Kurti, Top, Jewellery, Trousers, Pants)
3. **Empty State Illustrations:**
   - No invoices yet (receipt with checkmark)
   - No customers yet (people outline)
   - No products (shopping bag)

## Accessibility
- Minimum touch target: 48x48dp for all interactive elements
- Color contrast ratio: 4.5:1 for text, 3:1 for interactive components
- Screen reader labels for all icons and actions
- Support for Android TalkBack
- Large text support (scale up to 200%)