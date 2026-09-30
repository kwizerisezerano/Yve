# Getting Started with Ingoga SMS Gateway

This guide will help you set up and run the complete Ingoga SMS Gateway platform on your local machine.

## Overview

Ingoga SMS Gateway is a multi-tenant SMS messaging platform consisting of three main components:

1. **Backend API** (NestJS + PostgreSQL + Redis)
2. **Frontend Portal** (React + TypeScript + Vite)
3. **Mock SMS Provider** (Express - for testing)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)

## Quick Start

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd sms_backend-main/sms_backend-main
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and configure the following required variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ingoga_core"

# Application
PORT=3000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-random-jwt-secret-here

# Encryption Key (32-character key for API key encryption)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SMS Provider
SMS_PROVIDER_URL=http://localhost:4000/send
SMS_PROVIDER_AUTH_TOKEN=ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa
```

#### Setup Database

Create the PostgreSQL database:

```bash
createdb ingoga_core
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Seed the database (optional - creates a super admin user):

```bash
npm run prisma:seed
```

#### Start the Backend

Development mode (with hot reload):

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The backend API will be available at `http://localhost:3000`

API documentation (Swagger) will be available at `http://localhost:3000/api`

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd sms_frontend-main/sms_frontend-main
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file (if it doesn't exist):

```bash
echo VITE_API_URL=http://localhost:3000 > .env
```

#### Start the Frontend

Development mode:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

Production build:

```bash
npm run build
npm run preview
```

### 3. Mock SMS Provider Setup

For testing and development, start the mock SMS provider:

Navigate to the mock provider directory:

```bash
cd mock-sms-provider
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The mock SMS provider will be available at `http://localhost:4000`

Health check: `http://localhost:4000/health`

## Running All Services Together

To run the complete platform, you need three terminal windows:

**Terminal 1 - Backend:**
```bash
cd sms_backend-main/sms_backend-main
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd sms_frontend-main/sms_frontend-main
npm run dev
```

**Terminal 3 - Mock SMS Provider:**
```bash
cd mock-sms-provider
npm start
```

## Verifying the Setup

1. **Backend Health Check:**
   Open `http://localhost:3000/health` - you should see a health status response

2. **Frontend:**
   Open `http://localhost:5173` - you should see the login page

3. **Mock SMS Provider:**
   Open `http://localhost:4000/health` - you should see the provider status

## Default Credentials

If you ran the database seed script, default super admin credentials:

- Email: `superadmin@ingoga.com` (check the seed script for actual credentials)
- Password: (check `prisma/seeds/super-admin.seed.ts`)

## Next Steps

1. [Learn about the SMS Provider Microservice integration](./SMS_PROVIDER_INTEGRATION.md)
2. [Configure webhooks for delivery status updates](./WEBHOOKS_GUIDE.md)
3. [Understand the API authentication](./API_AUTHENTICATION.md)
4. [Explore the architecture and workflow](./ARCHITECTURE.md)

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Verify the database exists: `psql -l | grep ingoga_core`

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis configuration in `.env`

### Port Already in Use

If ports 3000, 5173, or 4000 are already in use, you can change them:

- Backend: Update `PORT` in `.env`
- Frontend: Update `vite.config.ts` to specify a different port
- Mock Provider: Edit `server.js` and change the `PORT` constant

### Prisma Client Errors

If you encounter Prisma client errors, regenerate the client:

```bash
cd sms_backend-main/sms_backend-main
npm run prisma:generate
```

## Additional Resources

- Backend Documentation: See `sms_backend-main/sms_backend-main/src/`
- Frontend Documentation: See `sms_frontend-main/sms_frontend-main/src/`
- API Documentation: `http://localhost:3000/api` (when backend is running)

## Support

For issues and questions, please check the documentation files in this repository.
