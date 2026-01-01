# Nazaara Billing App - Local Development Setup

This guide explains how to set up and run the Nazaara billing app on your local machine.

---

## Prerequisites

- **Node.js** 18+ (Download from https://nodejs.org)
- **PostgreSQL** 14+ (Download from https://postgresql.org)
- **Git** (Download from https://git-scm.com)

---

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd nazaara-billing
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Set Up PostgreSQL Database

### Option A: Using pgAdmin or Command Line

1. Create a new database:
```sql
CREATE DATABASE nazaara_billing;
```

2. Note your connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `nazaara_billing`
   - Username: `postgres` (or your username)
   - Password: your password

### Option B: Using Docker

```bash
docker run --name nazaara-postgres \
  -e POSTGRES_DB=nazaara_billing \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

---

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Connection
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nazaara_billing

# Server Configuration
NODE_ENV=development
PORT=5000

# API Authentication (optional in development)
API_KEY=local-dev-key-123

# Expo Configuration
EXPO_PUBLIC_DOMAIN=localhost:5000
EXPO_PUBLIC_API_KEY=local-dev-key-123
```

Replace `yourpassword` with your actual PostgreSQL password.

---

## Step 5: Initialize the Database

Push the database schema:

```bash
npm run db:push
```

This creates all necessary tables (customers, invoices, products, categories, settings).

---

## Step 6: Start the Application

### Run Both Backend and Frontend

```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:5000`
- **Expo Web App** at `http://localhost:8081`

### Run Separately (for debugging)

Terminal 1 - Backend:
```bash
npm run server:dev
```

Terminal 2 - Frontend:
```bash
npm run expo:dev
```

---

## Step 7: Access the Application

| Service | URL |
|---------|-----|
| Mobile App (Web) | http://localhost:8081 |
| API Server | http://localhost:5000 |
| API Documentation | http://localhost:5000/api-docs |
| Landing Page | http://localhost:5000 |

---

## Testing on Physical Device

### Using Expo Go App

1. Install **Expo Go** on your phone (App Store / Play Store)
2. Make sure your phone and computer are on the same WiFi network
3. Run the app: `npm run expo:dev`
4. Scan the QR code shown in the terminal

### Network Configuration

For phone testing, update your `.env`:

```bash
# Replace with your computer's local IP address
EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
```

Find your IP:
- **Windows**: `ipconfig`
- **Mac/Linux**: `ifconfig` or `ip addr`

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run server:dev` | Start backend only |
| `npm run expo:dev` | Start Expo frontend only |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run server:build` | Build backend for production |

---

## Project Structure

```
nazaara-billing/
├── client/                 # React Native / Expo frontend
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, colors, spacing
│   ├── lib/                # API client, utilities
│   ├── navigation/         # React Navigation setup
│   └── screens/            # App screens
├── server/                 # Express.js backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Database operations
├── shared/                 # Shared code (schema)
│   └── schema.ts           # Drizzle ORM schema
├── .env                    # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── drizzle.config.ts       # Database configuration
```

---

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database `nazaara_billing` exists

### "EXPO_PUBLIC_DOMAIN is not set"
- Create `.env` file with required variables
- Restart the development server after changes

### "Network request failed" on phone
- Ensure phone and computer are on same WiFi
- Use your computer's IP address instead of `localhost`
- Check firewall allows connections on ports 5000 and 8081

### "Module not found" errors
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Database schema issues
- Run `npm run db:push` to sync schema
- If issues persist: `npm run db:push --force`

---

## Development Tips

1. **Hot Reload**: The app auto-refreshes when you save files
2. **API Testing**: Use Swagger UI at `/api-docs` to test endpoints
3. **Database Viewer**: Run `npm run db:studio` to view/edit data
4. **Logs**: Check terminal for server logs and errors

---

## Next Steps

Once your local setup is working:
1. Add sample customers and products
2. Create test invoices
3. Configure shop settings
4. Test PDF generation and sharing

For production deployment, see `DEPLOYMENT.md`.
