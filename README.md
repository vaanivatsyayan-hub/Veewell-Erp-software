# Veewell Lifescience ERP - Local Setup Guide

This project is a high-performance, GST-compliant ERP system designed for Indian Pharmaceutical businesses. It leverages React 19, Tailwind CSS, and Google Gemini AI for intelligent financial insights.

## 🚀 Quick Start (Localhost)

To run this application on your local machine, follow these steps:

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js (v18+) installed. [Download here](https://nodejs.org/).
- **API Key**: Obtain a Google Gemini API Key from the [Google AI Studio](https://aistudio.google.com/).

### 2. Project Setup
Create a new directory and save all the project files (`index.html`, `index.tsx`, `App.tsx`, etc.) into it.

### 3. Initialize Development Server
The easiest way to run a `.tsx` project with an `importmap` is using **Vite**.

```bash
# In your project root
npm init -y
npm install vite --save-dev
```

Create a `vite.config.ts` (optional, but recommended for environment variables):
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
```

### 4. Configuration
Create a `.env` file in the root directory:
```env
API_KEY=your_gemini_api_key_here
```

### 5. Running the App
Run the following command to start the development server:
```bash
npx vite
```
The app will be available at `http://localhost:5173`.

---

## 💾 Data Persistence (Offline Functionality)

The application implements a robust **Local Persistence Layer** using the Browser's `localStorage` API:

- **Automatic Saving**: Every transaction (Sales, Purchases, Vouchers) and Master entry (Items, Accounts) is automatically serialized and saved to `localStorage` under the key `VEEWELL_ERP_DATA_V1` whenever a change occurs.
- **Persistence Scope**: Data remains available even after refreshing the page or restarting the browser, provided you are using the same browser on the same device.
- **Backup & Restore**: Use the **"Backup & Sync"** tab within the app to download a physical `.json` backup of your database. This allows you to migrate data between computers or perform manual archival.
- **Cloud Sync**: The system includes hooks for Google Drive synchronization to ensure multi-device consistency.

## 🛠 Technical Architecture
- **State Management**: Built-in React Context with specialized functional updaters to prevent race conditions during accounting ledger updates.
- **GST Engine**: Real-time state-to-state comparison logic for CGST/SGST vs IGST determination.
- **AI Integration**: Uses the Gemini API to verify GSTIN authenticity and generate natural language financial health summaries on the dashboard.
- **Print System**: CSS Media Queries are optimized for professional A4 Tax Invoice printing directly from the browser.
