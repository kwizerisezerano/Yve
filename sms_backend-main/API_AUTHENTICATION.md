# API Authentication Guide

This guide explains how authentication works in the Ingoga SMS Gateway platform, including API key management, JWT authentication, and security best practices.

## Overview

Ingoga SMS Gateway uses two types of authentication:

1. **JWT Authentication** - For web portal users (Admin, Developer, Viewer)
2. **API Key Authentication** - For programmatic SMS sending

## 1. JWT Authentication (Portal Users)

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| SUPER_ADMIN | Platform administrator | Full system access |
| ADMIN | Tenant administrator | Manage users, apps, view all data |
| DEVELOPER | Developer user | Create apps, generate API keys, send SMS |
| VIEWER | Read-only user | View data only, no modifications |

### Login Flow

#### Endpoint
```
POST http://localhost:3000/auth/login
```

#### Request
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

#### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "DEVELOPER",
    "tenantId": "tenant-uuid"
  }
}
```

### Using JWT Tokens

Include the token in the Authorization header for all authenticated requests:

```bash
curl http://localhost:3000/apps \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Expiration

JWT tokens expire after 24 hours by default (configured in `.env`):

```env
JWT_EXPIRES_IN=24h
```

When a token expires, users must login again to get a new token.

## 2. API Key Authentication (SMS Sending)

### API Key Format

API keys use the prefix format for identification:

```
ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa
```

Format: `{prefix}_{key}`

- **Prefix**: `ntf_` (stands for "notify")
- **Key**: 40-character hexadecimal string

### Creating API Keys

#### Via Portal (Recommended)

1. Login to the portal
2. Navigate to your App
3. Click "Create API Key"
4. Provide a name and description
5. Copy the API key (shown only once)

#### Via API

**Endpoint:**
```
POST http://localhost:3000/apps/{appId}/api-keys
```

**Headers:**
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Production API Key",
  "expiresAt": "2027-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "key-uuid",
  "name": "Production API Key",
  "apiKey": "ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa",
  "keyPrefix": "ntf_6ef9",
  "status": "ACTIVE",
  "expiresAt": "2027-12-31T23:59:59Z",
  "createdAt": "2026-08-27T10:30:00Z"
}
```

**Important:** The full API key is only shown once. Store it securely.

### API Key Storage

API keys are stored securely:

1. **Full Key** - Encrypted using AES-256 encryption (can be retrieved)
2. **Key Hash** - SHA-256 hash for authentication (one-way)
3. **Key Prefix** - First 9 characters for identification

#### Encryption Configuration

Set the encryption key in `.env`:

```env
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### Using API Keys

Include the API key in the X-API-Key header:

```bash
curl -X POST http://localhost:3000/sms/send \
  -H "X-API-Key: ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+250783503691"],
    "message": "Hello from SMS Gateway",
    "sender": "MYAPP"
  }'
```

### API Key Validation Flow

1. **Extract Key** - Get API key from X-API-Key header
2. **Hash Key** - Compute SHA-256 hash
3. **Lookup** - Find API key record by hash
4. **Validate Status** - Check if key is ACTIVE
5. **Check Expiration** - Verify key hasn't expired
6. **Cache Result** - Store in Redis for 5 minutes
7. **Update Last Used** - Record last usage timestamp

### API Key Caching

API keys are cached in Redis for performance:

- **Cache Duration**: 5 minutes
- **Cache Key Format**: `apikey:{keyHash}`
- **Benefits**: Reduces database queries, improves response time

### Listing API Keys

**Endpoint:**
```
GET http://localhost:3000/apps/{appId}/api-keys
```

**Response:**
```json
{
  "keys": [
    {
      "id": "key-uuid-1",
      "name": "Production Key",
      "keyPrefix": "ntf_6ef9",
      "status": "ACTIVE",
      "lastUsedAt": "2026-08-27T10:30:00Z",
      "expiresAt": null,
      "createdAt": "2026-08-20T10:30:00Z"
    },
    {
      "id": "key-uuid-2",
      "name": "Development Key",
      "keyPrefix": "ntf_7abc",
      "status": "REVOKED",
      "lastUsedAt": "2026-08-25T10:30:00Z",
      "expiresAt": "2027-12-31T23:59:59Z",
      "createdAt": "2026-08-15T10:30:00Z"
    }
  ]
}
```

Note: The full API key is never returned after creation.

### Revoking API Keys

**Endpoint:**
```
DELETE http://localhost:3000/apps/{appId}/api-keys/{keyId}
```

**Response:**
```json
{
  "message": "API key revoked successfully",
  "revokedAt": "2026-08-27T10:30:00Z"
}
```

Once revoked, the API key can no longer be used for authentication.

### Retrieving Full API Key

If you need to retrieve the full API key (e.g., if lost):

**Endpoint:**
```
GET http://localhost:3000/apps/{appId}/api-keys/{keyId}/reveal
```

**Response:**
```json
{
  "apiKey": "ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa",
  "retrievedAt": "2026-08-27T10:30:00Z"
}
```

This action is logged in the audit trail.

## Security Best Practices

### For API Keys

1. **Store Securely**
   - Never commit API keys to version control
   - Use environment variables or secret management services
   - Rotate keys regularly

2. **Use HTTPS**
   - Always use HTTPS in production
   - Never send API keys over unencrypted connections

3. **Limit Scope**
   - Create separate API keys for different environments
   - Use different keys for development, staging, and production

4. **Monitor Usage**
   - Track API key usage via `lastUsedAt` field
   - Review API keys periodically
   - Revoke unused keys

5. **Set Expiration**
   - Set expiration dates for temporary keys
   - Rotate keys before expiration

### For JWT Tokens

1. **Secure Secret**
   - Use a strong, random JWT secret
   - Keep secret in environment variables
   - Never expose in client-side code

2. **Short Expiration**
   - Use reasonable expiration times (e.g., 24 hours)
   - Implement refresh token mechanism if needed

3. **HTTPS Only**
   - Only transmit tokens over HTTPS
   - Set secure cookie flags in production

### Environment Variables

**Development:**
```env
JWT_SECRET=dev-secret-for-testing-only
ENCRYPTION_KEY=dev-encryption-key-32-characters
```

**Production:**
```env
JWT_SECRET=super-secure-random-jwt-secret-here-use-64-chars-minimum
ENCRYPTION_KEY=f4e5d6c7b8a9f4e5d6c7b8a9f4e5d6c7
```

Generate secure keys:

```bash
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Error Responses

### Authentication Errors

#### Invalid API Key
```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

#### Expired API Key
```json
{
  "statusCode": 401,
  "message": "API key has expired",
  "error": "Unauthorized"
}
```

#### Revoked API Key
```json
{
  "statusCode": 401,
  "message": "API key has been revoked",
  "error": "Unauthorized"
}
```

#### Missing API Key
```json
{
  "statusCode": 401,
  "message": "API key is required",
  "error": "Unauthorized"
}
```

#### Invalid JWT Token
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### Expired JWT Token
```json
{
  "statusCode": 401,
  "message": "Token has expired",
  "error": "Unauthorized"
}
```

## Testing Authentication

### Testing JWT Authentication

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Use the token
curl http://localhost:3000/apps \
  -H "Authorization: Bearer {token-from-step-1}"
```

### Testing API Key Authentication

```bash
# 1. Create API key (using JWT token)
curl -X POST http://localhost:3000/apps/{appId}/api-keys \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key"
  }'

# 2. Use the API key
curl -X POST http://localhost:3000/sms/send \
  -H "X-API-Key: {api-key-from-step-1}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+250783503691"],
    "message": "Test message",
    "sender": "TEST"
  }'
```

## Code Examples

### Node.js (API Key)

```javascript
const axios = require('axios');

const API_KEY = process.env.SMS_API_KEY;
const BASE_URL = 'http://localhost:3000';

async function sendSMS(recipients, message, sender) {
  try {
    const response = await axios.post(
      `${BASE_URL}/sms/send`,
      {
        recipients,
        message,
        sender
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }
    throw error;
  }
}

// Usage
sendSMS(['+250783503691'], 'Hello!', 'MYAPP')
  .then(result => console.log('SMS sent:', result))
  .catch(error => console.error('Error:', error));
```

### Python (API Key)

```python
import os
import requests

API_KEY = os.getenv('SMS_API_KEY')
BASE_URL = 'http://localhost:3000'

def send_sms(recipients, message, sender):
    try:
        response = requests.post(
            f'{BASE_URL}/sms/send',
            json={
                'recipients': recipients,
                'message': message,
                'sender': sender
            },
            headers={
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            raise Exception('Invalid API key')
        raise

# Usage
result = send_sms(['+250783503691'], 'Hello!', 'MYAPP')
print('SMS sent:', result)
```

### React (JWT Token)

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Create axios instance with interceptor
const api = axios.create({
  baseURL: API_BASE
});

// Add JWT token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('jwt_token', response.data.accessToken);
  return response.data;
}

// Create API key
async function createApiKey(appId: string, name: string) {
  const response = await api.post(`/apps/${appId}/api-keys`, { name });
  return response.data;
}

// Usage
login('user@example.com', 'password')
  .then(() => createApiKey('app-123', 'My API Key'))
  .then(key => console.log('Created key:', key))
  .catch(error => console.error('Error:', error));
```

## Audit Trail

All authentication events are logged in the audit trail:

- API key creation
- API key revocation
- API key retrieval
- User login
- Failed authentication attempts

Query audit logs:

```bash
curl http://localhost:3000/audit/logs?action=API_KEY_CREATED \
  -H "Authorization: Bearer {jwt-token}"
```

## Related Documentation

- [Getting Started](./GETTING_STARTED.md)
- [Webhooks Guide](./WEBHOOKS_GUIDE.md)
- [SMS Provider Integration](./SMS_PROVIDER_INTEGRATION.md)
