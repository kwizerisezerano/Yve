# Single Domain Deployment

Your project is now configured to run all services under a **single domain name** using Docker Compose and Nginx reverse proxy. The email provider is branded as **Notify** (rebranded from Relay).

## Quick Start

### 1. Setup Environment

```bash
# Copy production environment
cp .env.production .env

# Edit .env with your values
nano .env
```

Required variables:
- `DOMAIN=yourdomain.com`
- `JWT_SECRET` (generate with node)
- `ENCRYPTION_KEY` (generate with node)
- `Notify_APP_SECRET` (generate with openssl)
- `Notify_API_KEY` (your Notify API key)

### 2. Configure Nginx

Edit `nginx/nginx.conf`:
- Replace `yourdomain.com` with your actual domain
- Setup SSL certificates in `nginx/ssl/`

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
# NestJS backend
docker-compose exec backend npx prisma migrate dev

# Notify backend
docker-compose exec relay php bin/console doctrine:migrations:migrate
```

## Architecture

```
yourdomain.com (Single Domain)
    ↓
Nginx (Port 80/443)
    ├─→ /               → Frontend (React)
    ├─→ /api/           → Backend (NestJS - SMS + Email)
    └─→ /Notify/         → Notify (PHP - Email Provider)
```

## Service Endpoints

| Service | URL |
|---------|-----|
| Frontend | https://yourdomain.com |
| SMS API | https://yourdomain.com/api/sms/send |
| Email API | https://yourdomain.com/api/email/send |
| Notify Admin | https://yourdomain.com/Notify/sudo |

## Files Created

- `docker-compose.yml` - Orchestrates all services
- `nginx/nginx.conf` - Reverse proxy configuration
- `nginx/ssl/` - SSL certificates directory
- `.env.production` - Production environment template
- `sms_backend-main/Dockerfile` - Backend container
- `sms_frontend-main/Dockerfile` - Frontend container
- `sms_frontend-main/nginx.conf` - Frontend nginx config

## Next Steps

1. Get SSL certificate (Let's Encrypt recommended)
2. Configure Gmail SMTP in Notify
3. Test email sending
4. Update frontend to use new API URLs

See full setup guide: [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)
