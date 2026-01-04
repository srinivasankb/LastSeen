
# Last Seen

A privacy-focused, manual location sharing application. Broadcast your last known spot to your friends or the community without constant background tracking.

## Features

*   **📍 Manual Logging**: You control when your location is updated. No background battery drain or creeping.
*   **🌊 Vague Mode**: Share your general area (~500m radius) without revealing your exact coordinates.
*   **🔒 Privacy Controls**: Choose between Public visibility (community map) or Unlisted (share via unique link).
*   **⏲️ Auto-Expiration**: Set your location to expire automatically (1h, 4h, 24h, etc.).
*   **🗺️ Interactive Map**: Powered by Leaflet with clustering for viewing community activity.
*   **🌓 Dark Mode**: Fully supported UI theme switching.
*   **📱 PWA Ready**: Installable on mobile devices.

## Tech Stack

*   **Frontend**: React 19 (ES Modules), TypeScript.
*   **Styling**: TailwindCSS (via CDN).
*   **Maps**: Leaflet + OpenStreetMap + Leaflet.markercluster.
*   **Backend**: PocketBase (Auth + Database).
*   **Architecture**: Build-less Single Page Application (SPA) using `importmap` and `esm.sh`.

## Setup & Installation

### 1. Backend (PocketBase)

1.  Download and run [PocketBase](https://pocketbase.io/).
2.  **Users Collection**:
    *   Add a text field named `public_token` (used for sharing unique links).
    *   Enable **Google OAuth2** in the Auth Providers settings.
    *   **Index**: Add `CREATE UNIQUE INDEX idx_public_token ON users (public_token)`
3.  **Locations Collection**:
    *   Create a new collection named `locations`.
    *   Add the following fields:
        *   `user` (Relation -> users, Max Select: 1)
        *   `lat` (Number)
        *   `lng` (Number)
        *   `note` (Text)
        *   `address` (Text)
        *   `expiresAt` (Date/Time)
        *   `isPublic` (Boolean)
        *   `isVague` (Boolean)
    *   **API Rules**:
        *   List/View: `""` (Public access allowed for map view).
        *   Create: `user = @request.auth.id`
        *   Update: `user = @request.auth.id`
        *   Delete: `user = @request.auth.id`
    *   **Indexes** (Critical for speed):
        *   `CREATE INDEX idx_user_updated ON locations (user, updated)`

### 2. Configuration

1.  Open `lib/pocketbase.ts`.
2.  Update the `PB_URL` constant to point to your PocketBase instance (e.g., `http://127.0.0.1:8090`).

### 3. Running the App

This project uses modern browser features (ES Modules) and requires no build step (like Webpack or Vite). You simply need to serve the files.

**Using Python:**
```bash
python3 -m http.server 8000
```

**Using Node.js (serve):**
```bash
npx serve .
```

Open your browser to `http://localhost:8000` (or the port specified).

## Usage Guide

1.  **Sign In**: Click "Sign In" and authenticate using your Google account.
2.  **Dashboard**:
    *   **Log Location**: Click the button to capture your current GPS coordinates.
    *   **Vague Mode**: Toggle this ON to add random noise (approx 500m offset) to your location for privacy.
    *   **Visibility**: Toggle between "Public" (visible on the main map) and "Unlisted".
3.  **Sharing**:
    *   If Unlisted, expand the "Share Unique Link" section to copy a private URL to send to friends.
4.  **Profile**:
    *   Go to Profile Settings to change your Display Name or Logout.

## License

MIT
