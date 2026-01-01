# Nazaara Billing App - Deployment Guide

## Quick Setup Checklist

Before deploying, you need:
- [ ] External server with Node.js 18+
- [ ] PostgreSQL database
- [ ] Domain name for your backend API
- [ ] Expo account (free) for APK builds

---

## Part 1: Backend Deployment

### Step 1: Build the Backend
```bash
npm run server:build
```

### Step 2: Copy Files to Your Server
Transfer these files/folders to your server:
- `server_dist/` (compiled server)
- `shared/` (database schema)
- `package.json`
- `package-lock.json`
- `drizzle.config.ts`

### Step 3: Install Dependencies
On your server:
```bash
npm install --production
```

### Step 4: Set Environment Variables
Create a `.env` file or set these in your server environment:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/nazaara_db
API_KEY=your-secure-api-key-here
```

### Step 5: Initialize Database
```bash
npm run db:push
```

### Step 6: Start the Server
```bash
npm run server:prod
```

For production, use a process manager like PM2:
```bash
pm2 start server_dist/index.js --name nazaara-api
```

### Step 7: Configure Reverse Proxy (Nginx)
Example Nginx configuration:
```nginx
server {
    listen 443 ssl;
    server_name api.yoursite.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Part 2: Mobile App (APK) Build

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure eas.json
Edit `eas.json` and replace the placeholder values:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_DOMAIN": "api.yoursite.com",
        "EXPO_PUBLIC_API_KEY": "your-secure-api-key-here"
      }
    }
  }
}
```

**Important:** 
- `EXPO_PUBLIC_DOMAIN` = Your backend server domain (without https://)
- `EXPO_PUBLIC_API_KEY` = Same key you set in backend's API_KEY

### Step 4: Build the APK
```bash
eas build --platform android --profile production
```

This will:
1. Upload your code to Expo's build servers
2. Build the APK (takes 10-20 minutes)
3. Provide a download link for the APK

### Step 5: Download and Install
- Download the APK from the link provided
- Transfer to your Android device
- Install the APK (enable "Install from unknown sources" if needed)

---

## Environment Variables Reference

### Backend Server
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `API_KEY` | Secret key for API auth | `nz2024-aBcD1234-xYz5678` |

### Mobile App (eas.json)
| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_DOMAIN` | Backend domain | `api.yoursite.com` |
| `EXPO_PUBLIC_API_KEY` | Must match API_KEY | `nz2024-aBcD1234-xYz5678` |

---

## Testing Your Deployment

### Test Backend API
```bash
curl -H "X-API-Key: your-api-key" https://api.yoursite.com/api/customers
```

### Test Swagger Documentation
Open in browser: `https://api.yoursite.com/api-docs`

---

## Troubleshooting

### App shows "Error getting data"
- Check if EXPO_PUBLIC_DOMAIN matches your backend URL
- Verify API_KEY matches in both backend and app
- Ensure backend is running and accessible

### API returns 401 Unauthorized
- Verify API_KEY is set in server environment
- Check EXPO_PUBLIC_API_KEY in eas.json matches

### Database connection fails
- Verify DATABASE_URL is correct
- Check if database server allows connections from your IP
- Run `npm run db:push` to initialize tables

---

## Security Recommendations

1. **Use a strong API key** - Generate with: `openssl rand -base64 32`
2. **Enable HTTPS** - Always use SSL/TLS in production
3. **Firewall** - Only expose ports 80/443
4. **Database** - Use a separate database user with limited permissions
5. **Backups** - Set up regular database backups
