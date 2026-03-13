# Sortify - Urgent Email App

Sortify is an Android application + Home Screen Widget that connects to your Gmail (or Outlook) account, filters out mundane "Important" emails, and highlights only **truly urgent** messages.

## Architecture
This project is built using:
- **Backend**: Spring Boot (Java 17), H2 Database (for local zero-cost MVP), Google API Client for Gmail OAuth and email fetching.
- **Classification Engine**: A hybrid rules-based (regex/keyword/sender-trust) Java service that evaluates incoming emails for urgency without relying on expensive ML APIs, ensuring 100% zero-cost operation.
- **Frontend/Mobile**: React Native exclusively configured for Android, incorporating a Native Android AppWidgetProvider module for the Home Screen Widget.

## Folder Structure
- `/backend/` - Spring Boot backend
  - `/src/main/java/com/sortify/provider` - Email integration
  - `/src/main/java/com/sortify/service` - Classification engine & syncing
- `/mobile/` - React Native app
  - `/android/` - Android native code with `SortifyWidgetProvider`
  - `/src/screens/` - React Native UI screens

## Zero-Cost MVP Considerations
- Uses standard Spring Boot with H2 on the filesystem `(./data/sortifydb)` instead of a managed remote DB.
- Categorization regex-engine executes locally within the JVM without any external ML service.
- Gmail Developer App is free.

## Setup Instructions

### 1. Prerequisites
- Java 17+
- Node.js 18+ and npm/Yarn
- Android Studio & Android Emulator
- Maven

### 2. Configuration
Copy the `.env.example` in the root folder to `.env` (or set environment variables locally). 
You need to generate a Google Cloud Platform OAuth 2.0 Client ID for Web/Android.

### 3. Running the Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

### 4. Running the Mobile App
```bash
cd mobile
npm install
npx react-native start
# in another terminal
npx react-native run-android
```
*(Make sure an Android Emulator is running)*

### 5. Using the Widget
- Go to the Android Emulator home screen.
- Long press on empty space -> Widgets.
- Find "Sortifymobile" -> Add the widget to your home screen.

## Privacy & Security
Email snippets and sender details are persisted to the local H2 database strictly for displaying within the app and widget. Full email bodies are not fetched nor saved. OAuth tokens are stored but can be easily flushed or scoped-down via standard Google settings.
