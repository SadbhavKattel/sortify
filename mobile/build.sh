#!/bin/bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/Users/lcpratik/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# Enable communication between the device and the dev server
adb reverse tcp:8081 tcp:8081 || true

# Run the app
npm run android
