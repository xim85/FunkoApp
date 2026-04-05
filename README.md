# Funko Collection Manager

Cross-platform mobile application for managing Funko Pop vinyl figure collections.

## Tech Stack

- React Native + Expo
- Firebase Authentication
- Cloud Firestore
- Expo Camera

## Prerequisites

- Node.js 18+
- Expo CLI
- Firebase account with configured project

## Installation

1. Clone the repository:

git clone https://github.com/your-username/funkoproject.git
cd funkoproject

2. Install dependencies:

npm install

3. Set up environment variables:

Create a `.env` file with your Firebase credentials:

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

4. Start the application:

npx expo start

## Features

- User registration and authentication
- Inventory management (owned, wishlist, duplicates)
- Search and filter items
- Barcode scanning for quick item entry
- Explore public collections from other users
- Privacy settings per section

## Project Structure

src/
├── components/        # Reusable components
├── navigation/        # Navigation configuration
├── screens/           # Application screens
└── services/          # Business logic and data access
