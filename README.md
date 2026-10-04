# Notify - Unified SMS and Email Provider Platform

**Notify** is a self-hosted communication platform that provides both SMS and Email services under a single domain. It acts as a service provider where developers can use API keys to send bulk SMS and emails, with wallet-based billing.

## Features

- 📱 **SMS Sending** - Bulk SMS via API with wallet charging
- 📧 **Email Sending** - Bulk email via API with Gmail/SMTP integration
- 💰 **Wallet System** - Prepaid wallet for billing both SMS and Email
- 🔑 **API Keys** - Secure API key authentication for developers
- 🎯 **Single Domain** - All services under one domain (yourdomain.com)
- 🚀 **Self-Hosted** - Complete control over your communication infrastructure
- 📊 **Analytics** - Track message delivery and usage

## Architecture

```
yourdomain.com (Single Domain)
    ↓
Nginx (Port 80/443)
    ├─→ /               → Frontend (React - Notify Dashboard)
    ├─→ /api/           → Backend (NestJS - SMS + Email API)
    │   ├─→ /api/sms/send      → SMS API
    │   └─→ /api/email/send    → Email API
    └─→ /notify/        → Notify Email Backend (PHP)
        ├─→ /notify/api/send   → Direct Email API
        └─→ /notify/sudo       → Email Admin Dashboard
```

## Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | https://yourdomain.com | Notify Dashboard |
| SMS API | https://yourdomain.com/api/sms/send | Send SMS |
| Email API | https://yourdomain.com/api/email/send | Send Email |
| Email Admin | https://yourdomain.com/notify/sudo | Email Management |
| Health Check | https://yourdomain.com/health | Service Health |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Domain name (e.g., yourdomain.com)
- SSL certificate

### 1. Setup Environment

```bash
cp .env.production .env
nano .env
```

Update:
- `DOMAIN=yourdomain.com`
- `JWT_SECRET` (generate with node)
- `ENCRYPTION_KEY` (generate with node)
- `NOTIFY_APP_SECRET` (generate with openssl)
- `NOTIFY_API_KEY` (your API key)

### 2. Configure Nginx

Edit `nginx/nginx.conf`:
- Replace `yourdomain.com` with your domain
- Setup SSL certificates in `nginx/ssl/`

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
# Backend (NestJS)
docker-compose exec backend npx prisma migrate dev

# Email Backend (Notify)
docker-compose exec relay php bin/console doctrine:migrations:migrate
```

## Pricing

Default pricing (configurable):
- SMS: 15 RWF per SMS
- Email: 5 RWF per email

## API Usage

### Send SMS

```bash
curl -X POST https://yourdomain.com/api/sms/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["+250788123456"],
    "from": "Notify",
    "message": "Hello from Notify!"
  }'
```

### Send Email

```bash
curl -X POST https://yourdomain.com/api/email/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "user@example.com"}],
    "from": "noreply@yourdomain.com",
    "subject": "Welcome",
    "html": "<h1>Hello!</h1><p>Welcome to Notify.</p>"
  }'
```

## Project Structure

```
Yve/
├── docker-compose.yml          # Docker orchestration
├── nginx/
│   ├── nginx.conf              # Reverse proxy config
│   └── ssl/                    # SSL certificates
├── sms_backend-main/           # NestJS Backend (SMS + Email API)
│   ├── src/
│   │   └── modules/core/
│   │       ├── email/          # Email module
│   │       ├── messaging/      # SMS module
│   │       ├── wallet/         # Wallet system
│   │       └── auth/           # Authentication
│   └── prisma/
│       └── schema.prisma       # Database schema
├── sms_frontend-main/          # React Frontend
│   └── src/
│       └── features/           # UI components
├── hyvor-relay/               # Email Backend (Rebranded as Notify)
│   ├── backend/               # PHP/Symfony email backend
│   └── frontend/              # SvelteKit email dashboard
└── .env.production            # Environment template
```

## Documentation

- [Setup Guide](./EMAIL_SETUP_GUIDE.md) - Complete setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Docker deployment
- [Rebranding Guide](./NOTIFY_REBRANDING_GUIDE.md) - Customizing branding

## License

- **Backend (NestJS)**: UNLICENSED (Custom)
- **Email Backend (Relay)**: AGPL-3.0 (Based on Hyvor Relay)
- **Frontend**: Custom

## Support

For issues and questions, refer to the documentation guides above.

---

**Notify** - Your Unified SMS and Email Provider Platform
