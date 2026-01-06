#!/bin/bash

# APK Reinstall Script
# This script helps you reinstall the APK on your Android emulator/device

echo "📱 APK Reinstaller for Nazaara Billing"
echo "======================================"
echo ""

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android Studio and set up environment variables."
    echo "Run: export PATH=\$PATH:\$HOME/Library/Android/sdk/platform-tools"
    exit 1
fi

# Check for connected devices
echo "🔍 Checking for connected devices..."
DEVICES=$(adb devices | grep -w "device" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "❌ No devices connected."
    echo ""
    echo "Please:"
    echo "1. Start your Android emulator from Android Studio"
    echo "2. Or connect your physical Android device with USB debugging enabled"
    exit 1
fi

echo "✅ Found $DEVICES device(s) connected"
echo ""

# Ask for APK path
echo "📦 Enter the path to your APK file:"
echo "   (e.g., ~/Downloads/build-1234567890.apk)"
read -p "APK Path: " APK_PATH

# Expand ~ to home directory
APK_PATH="${APK_PATH/#\~/$HOME}"

# Check if file exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK file not found at: $APK_PATH"
    exit 1
fi

echo ""
echo "🔄 Reinstalling APK..."
echo "Package: com.nazaara.billing"
echo ""

# Uninstall old version (ignore errors if not installed)
echo "1️⃣ Removing old version..."
adb uninstall com.nazaara.billing 2>/dev/null || echo "   No previous version found"

# Install new version
echo "2️⃣ Installing new APK..."
if adb install "$APK_PATH"; then
    echo ""
    echo "✅ APK installed successfully!"
    echo ""
    echo "📊 To view logs, run:"
    echo "   ./debug-apk.sh"
    echo ""
    echo "🚀 Launch the app and check the logs!"
else
    echo ""
    echo "❌ Installation failed"
    exit 1
fi
