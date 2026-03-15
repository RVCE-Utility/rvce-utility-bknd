# RVCE Utility Backend

A backend service for RVCE Utility resource management platform. This project provides APIs and utilities for managing, uploading, and organizing college resources using Google Drive, with user authentication and contribution tracking.

## Features

- **Google Drive Integration**: Store and organize files in a structured folder hierarchy using Google Drive API (OAuth2 authentication).
- **User Authentication**: Secure access to resources and management features using NextAuth.
- **Contribution Management**: Users can upload, track, and manage their contributions (notes, documents, etc.).
- **Admin Tools**: Approve, reject, or review user contributions.
- **Resource Search & Organization**: Search, browse, and manage files and folders efficiently.
- **Content Manager**: Sync folder hierarchies from Google Drive to GitHub, with visual diff comparison and commit capabilities.
- **Notifications**: Telegram notifications for new uploads and contributions.

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud project with Drive API enabled
- OAuth2 credentials (Client ID, Client Secret, Refresh Token)

### Environment Variables

Create a `.env` file in the project root with the following:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_ROOT_FOLDER_ID=your_drive_root_folder_id
NEXTAUTH_SECRET=your_nextauth_secret
MONGODB_URI=your_mongodb_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token (optional)
TELEGRAM_CHAT_ID=your_telegram_chat_id (optional)

# GitHub Integration (for Content Manager)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_repo_owner
GITHUB_REPO_NAME=your_github_repo_name

# Firebase (Realtime Database)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

**Note**: For the Content Manager to work, you need a GitHub Personal Access Token with `contents: write` permission. Generate one at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

## Usage

- **Drive Manager**: Browse, search, and manage files/folders in Google Drive.
- **Contribution Manager**: Review, approve, or reject user-submitted resources.
- **Content Manager**: Select Drive items, generate folder hierarchies, compare with GitHub, and commit changes.
- **User Uploads**: Authenticated users can upload files, which are organized by subject, semester, and type.

## Project Structure

- `app/` - Next.js API routes and pages
- `lib/` - Google Drive integration, database models, utilities
- `components/` - UI components

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
