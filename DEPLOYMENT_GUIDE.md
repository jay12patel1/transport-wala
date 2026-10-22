# Transport Wala - Vercel & Custom Domain Deployment Guide

This complete guide explains how to deploy the **Transport Wala** full-stack application (Vite React Frontend + Express / Serverless Backend) to **Vercel** and connect your custom domain (purchased from Hostinger, GoDaddy, Namecheap, etc.) with automatic SSL.

---

## Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │                 Custom Domain                 │
                      │         (e.g., transportwala.com)             │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │              Vercel Edge Network              │
                      │         (Global CDN + HTTPS SSL Free)         │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
             ┌────────────────▼──────────────┐ ┌──────────────▼──────────────┐
             │         Frontend SPA          │ │      Backend Serverless     │
             │         (Vite React)          │ │      (Express / Node.js)    │
             │                               │ │                             │
             │ Rewrites:                     │ │ Route:                      │
             │  - /login                     │ │  - /api/health              │
             │  - /customer                  │ │  - /api/telematics/status   │
             │  - /transporter               │ │  - /api/ai/estimate         │
             │  - /driver                    │ │                             │
             │  - /admin                     │ │ Entry:                      │
             │ (All fallback to index.html)  │ │  api/index.js -> server.js  │
             └───────────────────────────────┘ └─────────────────────────────┘
```

---

## 1. Push Your Code to GitHub

If your code is not yet on GitHub, follow these simple terminal commands from your project root:

1. **Initialize Git** (if not already initialized):
   ```bash
   git init
   ```

2. **Add all project files and commit**:
   ```bash
   git add .
   git commit -m "Configure full-stack Vercel deployment with custom domain support"
   ```

3. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter Repository Name (e.g., `transport-wala`).
   - Choose **Public** or **Private**.
   - Click **Create repository** (do *not* initialize with README/license as we have existing code).

4. **Link and push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

## 2. Import & Deploy on Vercel

1. Log in to [Vercel](https://vercel.com) (sign in with your GitHub account for easiest integration).
2. On your Vercel Dashboard, click the **"Add New..."** button and select **"Project"**.
3. Under **"Import Git Repository"**, find your repository (`transport-wala`) and click **"Import"**.
4. Configure Project Settings:
   - **Framework Preset**: Select **`Vite`** (or leave as Auto-detected).
   - **Root Directory**: `./` (Default root).
   - **Build Command**: `vite build` (Default).
   - **Output Directory**: `dist` (Default).
   - **Install Command**: `npm install` (Default).

*(Note: The `vercel.json` file in the root directory automatically handles all build parameters, SPA routing, and `/api/*` serverless functions).*

5. Expand the **Environment Variables** section before clicking deploy (see Step 3 below).

---

## 3. Configure Environment Variables in Vercel

In the Vercel project deployment screen (or under **Project Settings ➔ Environment Variables**):

Add the following environment variables:

| Variable Name | Description | Example / Required |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous API key | `eyJhbGciOi...` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API key for AI load & route analysis | `AIzaSy...` |
| `NODE_ENV` | Environment mode | `production` |

Select all environments: **Production**, **Preview**, and **Development**.

Click **"Deploy"**. Vercel will install dependencies, build the Vite frontend, compile serverless API functions, and assign you a free `*.vercel.app` URL.

---

## 4. Connect Your Custom Domain (Hostinger, GoDaddy, Namecheap, etc.)

Once your project is deployed on Vercel, follow these exact steps to connect your custom domain:

### Step 4.1: Add Domain in Vercel
1. Open your project on Vercel.
2. Go to **Settings** (top tab) ➔ **Domains** (left sidebar).
3. In the input box, type your custom domain name (e.g. `yourdomain.com`) and click **"Add"**.
4. Vercel will ask how you want to redirect. We recommend:
   - **Add `yourdomain.com`** (primary).
   - **Add `www.yourdomain.com`** (automatically redirects to `yourdomain.com` or vice-versa).

### Step 4.2: Add DNS Records in Your Domain Registrar

Log in to the account where you purchased your domain (Hostinger, GoDaddy, Google Domains / Squarespace, Namecheap, BigRock):

Navigate to **DNS Management / DNS Zone Editor**:

Add the following **two records**:

#### Record 1 (Root Domain - Apex `@`):
- **Type**: `A`
- **Name / Host**: `@` (or leave blank if your registrar doesn't accept `@`)
- **Points to / Value**: `76.76.21.21`
- **TTL**: `3600` (or `Automatic` / `1 Hour`)

#### Record 2 (Subdomain `www`):
- **Type**: `CNAME`
- **Name / Host**: `www`
- **Points to / Value**: `cname.vercel-dns.com.`
- **TTL**: `3600` (or `Automatic` / `1 Hour`)

> **Note for Hostinger Users**:
> Go to **hPanel ➔ Domains ➔ Manage ➔ DNS / Nameservers**. If there are existing `A` records for `@` or `CNAME` for `www`, edit them to point to `76.76.21.21` and `cname.vercel-dns.com`.
>
> **Note for GoDaddy Users**:
> Go to **Domain Control Center ➔ Domain Settings ➔ Manage DNS**. Edit the `A` record with Host `@` to point to `76.76.21.21` and `CNAME` with Host `www` to `cname.vercel-dns.com`.

### Step 4.3: Verify in Vercel
- Return to **Vercel Settings ➔ Domains**.
- Click **"Refresh"**. Once DNS records propagate (typically 5 to 30 minutes), the domain status indicator will turn **Green (Valid Configuration)**.
- Vercel will automatically provision a **free Let's Encrypt SSL Certificate** with automatic 90-day renewals. Both `http://` and `https://` requests will be securely routed.

---

## 5. How SPA Refresh & Backend Routing Works (`vercel.json`)

Your `vercel.json` file is configured with the following rules:

```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Why this configuration is critical:
1. **No 404s on Refresh**: In standard Single Page Applications (SPAs), navigating to deep URLs like `/login`, `/customer`, `/transporter`, or `/driver` and pressing Browser Refresh causes a 404 error on typical servers because those files do not exist physically on disk. The fallback rewrite directs every non-API request to `index.html`, where React router/hash routing seamlessly mounts the intended screen.
2. **Unified Backend API**: All requests to `/api/*` are intercepted before the SPA fallback and routed directly to the Express serverless function (`api/index.js`), giving you high-performance serverless endpoints without managing a separate backend VPS.

---

## 6. Verifying Your Deployment

Once deployed, you can verify both frontend and backend functionality:

1. **Frontend App**:
   - Open `https://yourdomain.com` in your browser.
   - Test navigating to Customer, Transporter, Driver, and Admin login views.
   - Refresh the browser on any page to ensure no 404 occurs.

2. **Backend API Health Check**:
   - Open `https://yourdomain.com/api/health` in your browser or curl:
     ```bash
     curl -i https://yourdomain.com/api/health
     ```
   - Expected Response:
     ```json
     {
       "status": "ok",
       "service": "Transport Wala Commercial Logistics Backend",
       "uptime": 12.4,
       "timestamp": "2026-10-22T...",
       "environment": "production",
       "configuredServices": {
         "supabase": true,
         "geminiAi": true
       }
     }
     ```

3. **Telematics API Route**:
   - Open `https://yourdomain.com/api/telematics/status`
   - Returns active freight corridor telematics status.

---

## 7. Troubleshooting & FAQs

- **Q: My custom domain says "Invalid Configuration" in Vercel.**
  - DNS propagation can take anywhere from 5 minutes to 24 hours depending on your registrar. Verify using [whatsmydns.net](https://www.whatsmydns.net/) by searching for your domain's `A` record.
- **Q: Do I need to pay for an SSL certificate on Hostinger/GoDaddy?**
  - **No.** Never purchase SSL addons from your registrar. Vercel automatically generates and manages free, high-grade TLS certificates for all custom domains connected to your project.
- **Q: Can I run this server locally or on a standard VPS / Docker?**
  - **Yes.** Run `npm run build` and then `npm start` (which runs `node server.js`). The server will host the Express APIs and serve the compiled static frontend on port 3000.
