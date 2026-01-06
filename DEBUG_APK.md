# APK Debugging Guide

## Server Configuration

**Backend Server:** `http://35.208.236.54`
- Nginx forwards port 80 → 3000
- Node.js backend runs on port 3000
- No port needed in URLs (defaults to 80)

## Prerequisites

### 1. Install Android Studio
- Download: https://developer.android.com/studio
- Install Android SDK, Platform Tools, and Emulator

### 2. Environment Setup (Already Done ✅)
The following has been added to your `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Run `source ~/.zshrc` in new terminal windows to load these paths.

## Debugging Steps

### Step 1: Create Android Emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create Device → Choose Pixel 5 or similar
4. Select System Image (Android 13 or 14)
5. Finish and start the emulator

### Step 2: Verify ADB Connection
```bash
# Check if adb is available
adb version

# List connected devices
adb devices
```

You should see your emulator listed.

### Step 3: Install APK
```bash
# Download your APK from EAS Build
# Then install it:
adb install ~/Downloads/nazaara-billing.apk

# Or if already installed, use -r to reinstall:
adb install -r ~/Downloads/nazaara-billing.apk
```

### Step 4: View Real-Time Logs
```bash
# Option 1: Use the debug script
./debug-apk.sh

# Option 2: Manual logcat
adb logcat | grep -E "ReactNativeJS|Nazaara|Expo"

# Option 3: Clear logs first, then view
adb logcat -c && adb logcat *:E ReactNativeJS:V
```

### Step 5: Debug Specific Issues

#### Network Issues
```bash
# Check network connectivity from emulator
adb shell ping -c 3 35.208.236.54

# Check if port 3000 is accessible
adb shell curl -v http://35.208.236.54/api/customers
```

#### View App Data
```bash
# Open shell in emulator
adb shell

# View app logs
run-as com.nazaara.billing
cd files
ls -la
```

#### Clear App Data
```bash
# Clear app cache and data
adb shell pm clear com.nazaara.billing
```

### Step 6: React Native Debugging

#### Enable Remote Debugging
```bash
# Open dev menu (shake gesture)
adb shell input keyevent 82

# Then select "Debug" from the menu
# Opens Chrome DevTools at: chrome://inspect
```

#### View Console Logs
The updated code now logs:
- 🌐 Every API request with URL
- 📡 Response status codes
- ❌ Detailed error information including full URL

### Step 7: Test API Manually

From your Mac terminal:
```bash
# Test if server is accessible (nginx forwards port 80 to 3000)
curl -v http://35.208.236.54/api/customers \
  -H "X-API-Key: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h"

# Add a customer
curl -X POST http://35.208.236.54/api/customers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h" \
  -d '{"name":"Test Customer","phone":"1234567890"}'
```

## Common Issues & Solutions

### Issue 1: "Network request failed"
**Possible causes:**
- Server not running on GCP
- Nginx not forwarding port 80 to 3000
- Firewall blocking port 80
- Wrong URL in EXPO_PUBLIC_DOMAIN

**Solution:**
```bash
# Check if server is accessible (nginx on port 80)
curl http://35.208.236.54/api/customers

# Check if nginx is running
ssh your-gcp-instance
sudo systemctl status nginx

# Check if Node.js backend is running
pm2 status

# If not accessible, check GCP firewall rules
# Allow TCP port 80 (HTTP) in GCP Console
```

### Issue 2: CORS Errors
**Check server logs on GCP:**
```bash
ssh your-gcp-instance
pm2 logs shop-bill
```

**Update ALLOWED_ORIGINS on server:**
Should include your app's origin

### Issue 3: Missing API Key
The APK is built with:
- `EXPO_PUBLIC_DOMAIN=http://35.208.236.54` (port 80, nginx forwards to 3000)
- `EXPO_PUBLIC_API_KEY=nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h`

Verify in logs that the key is being sent in the `X-API-Key` header.

### Issue 4: Cleartext HTTP Not Allowed (Android 9+) ✅ FIXED
**Status:** Already configured in `app.json`
```json
"android": {
  "usesCleartextTraffic": true
}
```
This allows HTTP traffic to `http://35.208.236.54`
```
Then rebuild the APK.

## Quick Reference Commands

```bash
# Start emulator
emulator -avd Pixel_5_API_33 &

# Install APK
adb install -r app.apk

# View logs
./debug-apk.sh

# Clear app data
adb shell pm clear com.nazaara.billing

# Uninstall app
adb uninstall com.nazaara.billing

# Take screenshot
adb shell screencap /sdcard/screen.png
adb pull /sdcard/screen.png
```

## Production Debug Logs

The app now includes these logs in production:
- ✅ API request URL before each call
- ✅ Response status code
- ✅ Full error details with URL on failure

Check these in `adb logcat` to see what's happening.
