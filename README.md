
# WhatsApp Ecommerce Store Template

A lightweight ecommerce store built with **NestJS + EJS** designed for small businesses that want to sell products and receive orders through **WhatsApp**.

The template includes:

* Product catalog
* Product detail pages
* Shopping cart
* WhatsApp checkout
* Admin dashboard for managing products
* Image upload
* Product pagination
* Image optimization (WebP)

This template can be deployed **completely free** using Render + Cloudflare.

---

# Tech Stack

Backend

* NestJS

Frontend

* EJS Templates

Cart

* LocalStorage

Storage

* Render Postgres OR Render Key Value

Images

* Cloudflare R2 Object Storage

Hosting

* Render Free Tier

---

# Deployment Architecture (Free Tier)

Frontend + Backend
→ Render Web Service (Free)

Database
→ Render Postgres Free
or
→ Render Key Value Free

Images
→ Cloudflare R2 Free Tier

```
Browser
   │
   ▼
Render Web Service (NestJS)
   │
   ├── Render Postgres / KV
   │
   └── Cloudflare R2 (images)
```

---

# 1. Create Required Accounts

Create the following free accounts:

Render
[https://render.com](https://render.com)

Cloudflare
[https://cloudflare.com](https://cloudflare.com)

---

# 2. Push Project to GitHub

Render deploys from GitHub.

Initialize repo:

```
git init
git add .
git commit -m "Initial commit"
```

Create a GitHub repository and push:

```
git remote add origin https://github.com/YOUR_USERNAME/your-repo.git
git push -u origin main
```

---

# 3. Deploy Backend to Render

Go to:

Render Dashboard
[https://dashboard.render.com](https://dashboard.render.com)

Click:

New → Web Service

Connect your GitHub repo.

Configure service:

Name

```
whatsapp-ecommerce-store
```

Environment

```
Node
```

Build Command

```
npm install && npm run build
```

Start Command

```
node dist/main.js
```

Plan

```
Free
```

---

# 4. Add Environment Variables

In Render → Environment Variables

Add:

```
NODE_ENV=production

STORE_NAME=My Store
CURRENCY=PKR

OWNER_WHATSAPP=923001234567

ADMIN_USER=admin
ADMIN_PASS=strongpassword
```

If using Postgres:

```
DATABASE_URL=your_render_postgres_url
```

---

# 5. Create Render Database

Option A — Postgres

Render Dashboard → New → PostgreSQL

Free plan.

Copy connection string:

```
DATABASE_URL
```

Paste into your web service environment variables.

---

Option B — Render Key Value

Render → New → Key Value

Use this if you prefer a simple key-value store.

---

# 6. Configure Cloudflare R2 (Image Storage)

The template supports uploading images for products.
Instead of storing images on Render disk, we store them in **Cloudflare R2**.

Go to:

Cloudflare Dashboard → R2 → Create Bucket

Example bucket:

```
store-images
```

---

## Create API Credentials

Cloudflare → R2 → API Tokens

Create token with:

```
Object Read & Write
```

Save:

```
R2_ACCESS_KEY
R2_SECRET_KEY
R2_ENDPOINT
R2_BUCKET
```

---

## Add Environment Variables to Render

```
R2_ACCESS_KEY=xxxx
R2_SECRET_KEY=xxxx
R2_BUCKET=store-images
R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
```

---

# 7. Update Image Upload Logic

Your app uploads images using **Sharp optimization**.

Images should be uploaded to R2 instead of:

```
public/uploads
```

This prevents issues with ephemeral disk storage on Render.

Typical flow:

```
Upload → Optimize → Upload to R2 → Store URL in DB
```

Example stored image URL:

```
https://your-domain.r2.dev/products/product123.webp
```

---

# 8. Cold Start Prevention (Optional)

Render free services sleep after inactivity.

You can keep the service warm using:

UptimeRobot
[https://uptimerobot.com](https://uptimerobot.com)

Create monitor:

```
https://your-app.onrender.com
```

Ping every:

```
5 minutes
```

---

# 9. Local Development

Install dependencies:

```
npm install
```

Start development server:

```
npm run start:dev
```

App runs on:

```
http://localhost:3000
```

---

# 10. Admin Dashboard

Admin login:

```
/admin/login
```

Credentials from environment variables:

```
ADMIN_USER
ADMIN_PASS
```

Features:

* Add product
* Upload product image
* Edit product
* Delete product

---

# 11. Store Features

Product listing
Product search
Product categories
Product pagination

Product page includes:

* quantity selector
* add to cart
* WhatsApp checkout

Cart features:

* quantity editing
* remove item
* local storage persistence

---

# 12. WhatsApp Checkout

Orders are sent directly to WhatsApp.

Example message:

```
New Order

Name: Ahmed
Phone: 03001234567

Items:
Product A x2
Product B x1

Total: PKR 3500
```

Customer is redirected to:

```
https://wa.me/OWNER_WHATSAPP
```

---

# 13. Production Notes

Render free tier limitations:

* service sleeps after inactivity
* slower cold start
* limited CPU

Recommended for:

* small stores
* MVP projects
* WhatsApp sellers

---

# 14. Future Improvements

Possible upgrades:

* Stripe payments
* product variants
* stock tracking
* admin analytics
* CDN image resizing
* infinite scroll products

---

# License

MIT License

You are free to use, modify, and sell this template.




command to create DB

powershell -ExecutionPolicy Bypass -File .\database\setup-db.ps1