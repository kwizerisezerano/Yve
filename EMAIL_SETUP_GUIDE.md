# Notify Platform Setup Guide

This guide explains how to set up **Notify** - your unified SMS and Email provider platform. **All services run under a single domain name.**

## Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │    Single Domain (yourdomain.com) │
                    │                                  │
                    │  ┌────────────────────────────┐  │
                    │  │   Nginx Reverse Proxy       │  │
                    │  │   (Port 80/443)             │  │
                    │  └────────────┬───────────────┘  │
                    └───────────────┼──────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Frontend       │      │  Backend (NestJS)│      │  Notify (PHP)    │
│   (React)        │      │  - SMS API       │      │  - Email Sending │
│   Port 80        │      │  - Email API     │      │  - SMTP/Gmail     │
│   /              │      │  - Auth/Wallet   │      │  /notify/        │
└──────────────────┘      └──────────────────┘      └──────────────────┘
         │                          │                          │
         └──────────────────────────┴──────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────┐
                    │   PostgreSQL Database     │
                    │   - notify_core (main)    │
                    │   - notify_email (email)  │
                    └──────────────────────────┘
```

## Step 1: Quick Start with Docker Compose

The easiest way to deploy everything under a single domain is using Docker Compose.

### Prerequisites

- Docker and Docker Compose installed
- Domain name (e.g., `yourdomain.com`)
- SSL certificate (or use Let's Encrypt)

### 1. Configure Environment Variables

Copy the production environment file:

```bash
cp .env.production .env
```

Edit `.env` and update:
- `DOMAIN=yourdomain.com` - Your actual domain
- `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ENCRYPTION_KEY` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `Notify_APP_SECRET` - Generate: `openssl rand -base64 32`
- `Notify_API_KEY` - Your Notify API key

### 2. Configure Nginx

Edit `nginx/nginx.conf` and replace `yourdomain.com` with your actual domain.

### 3. Setup SSL Certificates

Option A: Use Let's Encrypt (recommended for production)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

Option B: Self-signed (for development)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### 4. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- NestJS Backend (port 3000)
- Notify Backend (port 8080)
- Frontend (port 80)
- Nginx (ports 80, 443)

### 5. Run Database Migrations

```bash
# For NestJS backend
docker-compose exec backend npx prisma migrate dev

# For Notify backend
docker-compose exec relay php bin/console doctrine:migrations:migrate
```

### 6. Access Your Services

- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api
- **Notify Dashboard**: https://yourdomain.com/Notify/sudo
- **Email API**: https://yourdomain.com/Notify/api

## Step 2: Manual Setup (Without Docker)

If you prefer manual setup without Docker:

## Step 3: Configure NestJS Backend

### Update `.env` file

Add these environment variables to `sms_backend-main/.env`:

```env
# ─── Email Provider (Notify) ───────────────────────────────────────────────────
DOMAIN=yourdomain.com
Notify_API_URL=https://yourdomain.com/Notify/api
Notify_API_KEY=your-Notify-api-key
```

### Email Pricing

Set the default email price (default is 5 RWF per email):

```bash
# Via API or database
INSERT INTO system_settings (key, value, data_type) 
VALUES ('email_price_rwf', '5', 'number');
```

## Step 3: Configure Notify Backend

### Navigate to Notify folder

```bash
cd hyvor-relay/backend
```

### Install Dependencies

```bash
composer install
```

### Configure Environment

Copy and edit `.env`:

```bash
cp .env .env.local
```

Edit `.env.local`:

```env
APP_ENV=prod
APP_SECRET=your-32-byte-secret-key-generate-with-openssl-rand-base64-32

# PostgreSQL database for Notify
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/Notify_db?serverVersion=16&charset=utf8"

# Web URL where Notify will be accessible (behind nginx proxy)
WEB_URL=https://yourdomain.com/Notify

# Instance domain for email server
INSTANCE_DOMAIN=mail.yourdomain.com

# Trusted proxies (nginx)
TRUSTED_PROXIES=127.0.0.1,nginx,172.16.0.0/12,192.168.0.0/16

# OIDC (Optional - can use Notify's built-in auth)
OIDC_ISSUER_URL=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=

# File storage for email contents
FILESYSTEM=file
```

### Generate Secret Key

```bash
openssl rand -base64 32
```

Use this as `APP_SECRET`.

### Run Notify Migrations

```bash
php bin/console doctrine:migrations:migrate
```

### Start Notify Backend

```bash
# Behind nginx proxy, run on localhost
php -S 127.0.0.1:8080 -t public

# Or using Symfony CLI
symfony server:start --host=127.0.0.1 --port=8080
```

## Step 4: Configure Gmail as Email Provider

Notify supports SMTP. Configure Gmail SMTP:

### Option 1: Gmail App Password (Recommended)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Generate App Password: Security → 2-Step Verification → App Passwords
4. Use the 16-character app password

### Option 2: Gmail API

1. Create Google Cloud Project
2. Enable Gmail API
3. Create OAuth credentials
4. Use in Notify configuration

### Configure SMTP in Notify

You'll need to configure Notify's SMTP settings. This is typically done via Notify's admin dashboard or configuration files.

Example SMTP configuration (in Notify's settings):

```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Encryption: TLS
```

## Step 5: Test Email Sending

### Using the API

```bash
curl -X POST https://yourdomain.com/api/email/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [
      {"email": "recipient@example.com", "name": "John Doe"}
    ],
    "from": "noreply@yourdomain.com",
    "subject": "Test Email",
    "html": "<h1>Hello</h1><p>This is a test email.</p>",
    "text": "Hello, this is a test email."
  }'
```

### Expected Response

```json
{
  "batchId": "email_batch_1234567890_abc123",
  "totalEmails": 1,
  "totalCost": 5,
  "emailCost": 5,
  "status": "SENT",
  "emails": [
    {
      "id": "uuid",
      "to": "recipient@example.com",
      "from": "noreply@yourdomain.com",
      "subject": "Test Email",
      "cost": 5,
      "status": "SENT"
    }
  ]
}
```

## Step 6: Nginx Configuration (Single Domain)

When using a single domain, Nginx routes traffic to different services:

- `/` → Frontend (React)
- `/api/` → NestJS Backend (SMS + Email API)
- `/relay/` → Relay Backend (Email provider)
- `/relay/sudo` → Relay Admin Dashboard

### Nginx Routes

```
https://yourdomain.com/                    → Frontend
https://yourdomain.com/api/sms/send        → SMS API
https://yourdomain.com/api/email/send      → Email API
https://yourdomain.com/Notify/api/send     → Notify Direct API
https://yourdomain.com/Notify/sudo         → Notify Admin
```

### CORS Configuration

All endpoints have CORS enabled to allow cross-origin requests from your frontend.

## Step 7: Frontend Integration

Your frontend should now support both SMS and Email sending:

### Add Email Component

Create an email sending form in your React frontend (`sms_frontend-main`):

```typescript
// src/features/email/SendEmailForm.tsx
import { useState } from 'react';

export function SendEmailForm() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');

  const sendEmail = async () => {
    const response = await fetch('http://localhost:3000/email/send', {
      method: 'POST',
      headers: {
        'X-API-Key': 'your-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: to }],
        from: 'noreply@yourdomain.com',
        subject,
        html,
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); sendEmail(); }}>
      <input 
        type="email" 
        value={to} 
        onChange={(e) => setTo(e.target.value)} 
        placeholder="To"
      />
      <input 
        type="text" 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)} 
        placeholder="Subject"
      />
      <textarea 
        value={html} 
        onChange={(e) => setHtml(e.target.value)} 
        placeholder="HTML Body"
      />
      <button type="submit">Send Email</button>
    </form>
  );
}
```

## Step 8: API Endpoints

All APIs are accessible under your single domain:

### Email API (via NestJS)

- `POST https://yourdomain.com/api/email/send` - Send emails (requires API key)
- `GET https://yourdomain.com/api/email/batches` - Get email batches (requires JWT auth)

### SMS API (via NestJS)

- `POST https://yourdomain.com/api/sms/send` - Send SMS (requires API key)
- `GET https://yourdomain.com/api/sms/batches` - Get SMS batches (requires JWT auth)

### Notify Direct API (Optional)

- `POST https://yourdomain.com/Notify/api/send` - Direct Notify API (requires Notify API key)
- `GET https://yourdomain.com/Notify/sudo` - Notify Admin Dashboard

## Summary

Your project now:
1. ✅ **Single Domain** - All services under `yourdomain.com`
2. ✅ **Keeps SMS functionality** - Existing SMS API unchanged
3. ✅ **Adds email provider** - Via Notify integration
4. ✅ **Wallet-based billing** - Your existing wallet system
5. ✅ **Gmail support** - SMTP configuration for Gmail
6. ✅ **Unified API** - Developers use one domain for SMS + Email
7. ✅ **Self-hosted** - Complete control over email infrastructure
8. ✅ **Docker deployment** - Easy setup with docker-compose
9. ✅ **Rebranded** - No Relay branding visible to users

## Service URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | https://yourdomain.com |
| SMS API | https://yourdomain.com/api/sms/send |
| Email API | https://yourdomain.com/api/email/send |
| Notify Admin | https://yourdomain.com/Notify/sudo |
| Health Check | https://yourdomain.com/health |

## Troubleshooting

### Database Connection Error

Make sure PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-16

# Linux/Mac
sudo service postgresql start
```

### Notify Not Starting

Check PHP version (requires 8.4+):
```bash
php -v
```

### Gmail SMTP Authentication Failed

- Make sure 2-Step Verification is enabled
- Generate a new App Password
- Check email/password in Notify configuration

### Wallet Balance Issues

Check tenant wallet balance:
```sql
SELECT * FROM wallets WHERE tenant_id = 'your-tenant-id';
```

## Next Steps

1. Set up production environment with proper domain
2. Configure SSL certificates for Notify
3. Set up email monitoring and analytics
4. Implement webhooks for email delivery status
5. Add email templates and HTML editor
