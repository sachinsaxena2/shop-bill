#!/bin/bash

# Debug APK Script - View logs from Android app

echo "🔍 Starting Android Debug Logs..."
echo "📱 Make sure your emulator or device is connected"
echo ""

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "❌ No device connected. Please start emulator or connect device."
    exit 1
fi

echo "✅ Device detected"
echo ""
echo "📊 Filtering logs for React Native and your app..."
echo "Press Ctrl+C to stop"
echo ""

# Clear previous logs
adb logcat -c

# Show filtered logs
adb logcat | grep -E "ReactNativeJS|Nazaara|Expo|API"
