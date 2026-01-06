# Android HTTP Security Issue - Diagnosis & Fix

## 🔴 The Problem

**Error:** `Network request failed`  
**URL:** `http://35.208.236.54/api/...`  
**Cause:** Android blocks cleartext (HTTP) traffic by default for security

## 🔍 Root Cause

### Android Security Policy (Android 9+)
Starting with Android 9 (API 28), Google blocks all **cleartext HTTP traffic** by default:
- ✅ HTTPS is allowed (encrypted)
- ❌ HTTP is blocked (cleartext, unencrypted)

This affects you because:
- Your server uses HTTP: `http://35.208.236.54`
- No SSL certificate (would need HTTPS with domain name)
- Android's security policy blocks the request **before** it even leaves the device

## ✅ What's Fixed in Version 1.0.1

### 1. **Network Security Configuration** ✅
Added `android-network-security-config.xml`:
```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">35.208.236.54</domain>
    </domain-config>
</network-security-config>
```
**What it does:** Tells Android "Allow HTTP to this specific IP address"

### 2. **App Manifest Setting** ✅
Updated `app.json`:
```json
"android": {
  "usesCleartextTraffic": true,
  "networkSecurityConfig": "./android-network-security-config.xml"
}
```
**What it does:** 
- `usesCleartextTraffic`: Global permission for HTTP
- `networkSecurityConfig`: Fine-grained control per domain

### 3. **Error Popups** ✅
Added user-facing error alerts so you know what's failing in production

### 4. **Enhanced Debug Logging** ✅
Added detailed logs to diagnose:
- ✅ Is API key being sent?
- ✅ What URL is being called?
- ✅ What headers are sent?
- ✅ How long does the request take?
- ✅ What's the exact error?

## 📊 New Debug Logs

When you install version 1.0.1 and run the app, you'll see:

```
========== API REQUEST DEBUG ==========
📍 Route: /api/customers
🔧 Method: GET
🌍 Base URL: http://35.208.236.54/
🔗 Full URL: http://35.208.236.54/api/customers
🔑 Headers being sent:
{
  "X-API-Key": "nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h"
}
🔑 X-API-Key present: YES ✅
🔑 X-API-Key value: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h
🚀 Initiating fetch request...
```

**If successful:**
```
✅ Fetch completed in 234ms
📡 Status: 200 OK
========== END DEBUG ==========
```

**If it fails:**
```
========== API REQUEST ERROR ==========
❌ Request: GET /api/customers
❌ Error Type: TypeError
❌ Error Message: Network request failed

🔍 NETWORK ERROR DIAGNOSIS:
   • URL attempted: http://35.208.236.54/api/customers
   • This is a cleartext HTTP request to an IP address
   • Android may be blocking this for security
   • Check: networkSecurityConfig in app.json
   • Check: usesCleartextTraffic setting
========== END ERROR ==========
```

## 🔧 How to Test

### Step 1: Check Current Version
```bash
# Check what's in app.json
cat app.json | grep -A 2 "version"
# Should show: "version": "1.0.1", "versionCode": 2
```

### Step 2: Rebuild APK
```bash
eas build -p android --profile production
```

### Step 3: Install New APK
```bash
# Download the new APK from EAS, then:
adb install -r ~/Downloads/build-xxxxx.apk
```

### Step 4: View Detailed Logs
```bash
./debug-apk.sh
# Or:
adb logcat | grep -E "ReactNativeJS|API REQUEST"
```

## 🔍 What to Look For in Logs

### ✅ Success Indicators:
- See "X-API-Key present: YES ✅"
- See "Fetch completed in XXXms"
- See "Status: 200 OK"
- See actual customer data

### ❌ Failure Indicators:
- See "Network request failed"
- See "NETWORK ERROR DIAGNOSIS"
- Error popup appears on device
- No response headers

## 📝 Verification Checklist

After installing version 1.0.1:

- [ ] Check logs show `X-API-Key` is being sent
- [ ] Check logs show full URL is correct
- [ ] Check if network error still occurs
- [ ] Check if error popup appears
- [ ] Try ping from emulator: `adb shell ping 35.208.236.54`
- [ ] Check server is running: `curl http://35.208.236.54/api/customers`

## 🚨 If Still Failing After Rebuild

### Possibility 1: Network Security Config Not Applied
**Check:**
```bash
# Verify the file is included in the APK
# (requires unzipping the APK)
```

### Possibility 2: Server Not Accessible
**Test:**
```bash
# From your Mac
curl -v http://35.208.236.54/api/customers \
  -H "X-API-Key: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h"

# From emulator
adb shell ping -c 3 35.208.236.54
```

### Possibility 3: GCP Firewall
**Check GCP Console:**
- Firewall rules allow port 80
- External IP is 35.208.236.54
- Nginx is running: `sudo systemctl status nginx`
- Backend is running: `pm2 status`

## 🎯 Expected Outcome

After version 1.0.1 is installed:
1. ✅ Network security config allows HTTP to your server IP
2. ✅ API key is sent with every request
3. ✅ Detailed logs show exactly what's happening
4. ✅ Error popups inform user if something fails
5. ✅ App can fetch customers, invoices, etc.

## 📞 Debug Commands

```bash
# View comprehensive logs
adb logcat | grep -E "API REQUEST|X-API-Key|Network request"

# Check app version installed
adb shell dumpsys package com.nazaara.billing | grep versionCode

# Test server from Mac
curl http://35.208.236.54/api/customers -H "X-API-Key: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h"

# Test ping from emulator
adb shell ping -c 3 35.208.236.54
```

## 🔐 API Key Verification

The new logs will show **exactly** if the API key is being sent:
```
🔑 X-API-Key present: YES ✅
🔑 X-API-Key value: nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h
```

If it shows "NO ❌", then the API key is missing and that's a separate issue.

## 📌 Summary

**Problem:** Android blocks HTTP traffic  
**Solution:** Network security config to allow HTTP to your server  
**Version:** 1.0.1 (build 2) includes the fix  
**Testing:** Enhanced logs will show exactly what's happening  
**Next Step:** Rebuild and install version 1.0.1
