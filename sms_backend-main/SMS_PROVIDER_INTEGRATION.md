# SMS Provider Microservice Integration Guide

This guide explains how the Ingoga SMS Gateway integrates with the SMS Provider microservice and how to connect to a real provider.

## Overview

The SMS Provider microservice is responsible for:

1. Receiving SMS requests from the Ingoga backend
2. Routing messages to telecom operators
3. Managing provider-specific logic
4. Sending delivery status webhooks back to Ingoga

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────────┐
│  Ingoga Backend      │  HTTP   │  SMS Provider        │  API    │  Telecom Operators   │
│  (NestJS)            │────────>│  Microservice        │────────>│  (MTN, Airtel, etc)  │
│                      │         │  (Express/Custom)    │         │                      │
│                      │<────────│                      │         │                      │
│                      │ Webhook │                      │         │                      │
└──────────────────────┘         └──────────────────────┘         └──────────────────────┘
```

## Configuration

### Backend Configuration

Set the provider URL and authentication token in your `.env` file:

```env
# SMS Provider Microservice
SMS_PROVIDER_URL=http://localhost:4000/send
SMS_PROVIDER_AUTH_TOKEN=ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa
```

### Environment Variables

- `SMS_PROVIDER_URL` - The endpoint where SMS requests are sent
- `SMS_PROVIDER_AUTH_TOKEN` - Authentication token for the provider API

## Request Format

### Sending SMS to Provider

The Ingoga backend sends requests in the following format:

**Endpoint:** `POST {SMS_PROVIDER_URL}`

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "recipient": [
    "+250783503691",
    "+250733503693"
  ],
  "message": "Your verification code is 123456",
  "sender": "MYAPP",
  "type": "sms",
  "authentication": "ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa",
  "idempotencyKey": "batch_1234567890abcdef"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipient` | array | Yes | List of phone numbers in E.164 format |
| `message` | string | Yes | SMS message content |
| `sender` | string | Yes | Sender ID (alphanumeric or phone number) |
| `type` | string | Yes | Message type (always "sms") |
| `authentication` | string | Yes | Provider authentication token |
| `idempotencyKey` | string | Yes | Unique batch ID for idempotency |

## Response Format

### Success Response

```json
{
  "success": true,
  "messageId": "provider-msg-id-123",
  "status": "sent",
  "recipients": 2,
  "details": {
    "sender": "MYAPP",
    "messageLength": 156,
    "timestamp": "2026-08-27T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid authentication token",
  "code": "AUTH_FAILED"
}
```

## Mock SMS Provider

For testing and development, use the included mock provider.

### Starting the Mock Provider

```bash
cd mock-sms-provider
npm install
npm start
```

The mock provider runs on `http://localhost:4000`

### Mock Provider Features

1. **Authentication** - Validates the authentication token
2. **Idempotency** - Prevents duplicate message sending
3. **Validation** - Checks request format and required fields
4. **Simulation** - Simulates realistic processing delays
5. **Health Check** - Provides status endpoints

### Mock Provider Endpoints

#### Send SMS
```bash
POST http://localhost:4000/send
```

#### Health Check
```bash
GET http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "service": "Mock SMS Provider",
  "version": "1.0.0",
  "timestamp": "2026-08-27T10:30:00Z",
  "processedRequests": 42
}
```

#### Status
```bash
GET http://localhost:4000/status
```

#### Reset (Clear Processed Keys)
```bash
POST http://localhost:4000/reset
```

#### Simulate Errors
```bash
POST http://localhost:4000/send-error
```

Payload:
```json
{
  "errorType": "timeout" | "server_error" | "invalid_auth"
}
```

## Integrating with a Real SMS Provider

To integrate with a real SMS provider (e.g., Twilio, Africa's Talking, etc.):

### Option 1: Create a Provider Adapter

Create a new microservice that implements the expected interface:

```javascript
// provider-adapter.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Configuration for your real provider
const REAL_PROVIDER = {
  url: 'https://api.realprovider.com/v1/sms',
  apiKey: process.env.REAL_PROVIDER_API_KEY,
  apiSecret: process.env.REAL_PROVIDER_API_SECRET
};

app.post('/send', async (req, res) => {
  const { recipient, message, sender, authentication, idempotencyKey } = req.body;

  // Validate authentication
  if (authentication !== process.env.SMS_PROVIDER_AUTH_TOKEN) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication'
    });
  }

  try {
    // Transform request to provider's format
    const providerRequest = {
      to: recipient,
      from: sender,
      text: message,
      reference: idempotencyKey
    };

    // Send to real provider
    const response = await axios.post(REAL_PROVIDER.url, providerRequest, {
      headers: {
        'Authorization': `Bearer ${REAL_PROVIDER.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Transform provider's response
    return res.json({
      success: true,
      messageId: response.data.messageId,
      status: 'sent',
      recipients: recipient.length,
      details: {
        sender,
        messageLength: message.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Provider error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS'
    });
  }
});

app.listen(4000, () => {
  console.log('Provider adapter running on port 4000');
});
```

### Option 2: Modify Backend Service

Update `src/modules/core/messaging/services/sms-provider.service.ts` directly:

```typescript
async sendToProvider(request: ProviderRequest): Promise<ProviderResponse> {
  // Your custom provider integration logic here
  const response = await this.httpService.post(
    this.providerUrl,
    this.transformRequest(request),
    {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    }
  ).toPromise();

  return this.transformResponse(response.data);
}
```

## Provider Requirements

Any SMS provider microservice must:

### 1. Accept POST Requests

Handle POST requests with the standardized payload format.

### 2. Validate Authentication

Verify the `authentication` token in the request.

### 3. Handle Idempotency

Use the `idempotencyKey` to prevent duplicate sends:

```javascript
const processedKeys = new Set();

if (processedKeys.has(idempotencyKey)) {
  return res.json({
    success: true,
    messageId: `cached-${idempotencyKey}`,
    status: 'already_sent'
  });
}
```

### 4. Return Standardized Response

Always return a response matching the expected format.

### 5. Send Webhooks for Status Updates

After processing, send delivery status updates:

```javascript
// After message is delivered/failed
await axios.post('http://ingoga-backend:3000/webhooks/sms/status', {
  batchId: idempotencyKey,
  messages: [
    {
      providerId: messageId,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString()
    }
  ]
});
```

## Popular Provider Integrations

### Twilio Integration

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

app.post('/send', async (req, res) => {
  const { recipient, message, sender } = req.body;

  const promises = recipient.map(to =>
    client.messages.create({
      body: message,
      from: sender,
      to: to
    })
  );

  const results = await Promise.all(promises);
  
  res.json({
    success: true,
    messageId: results[0].sid,
    status: 'sent',
    recipients: recipient.length
  });
});
```

### Africa's Talking Integration

```javascript
const AfricasTalking = require('africastalking');
const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

app.post('/send', async (req, res) => {
  const { recipient, message, sender } = req.body;

  const result = await sms.send({
    to: recipient,
    message: message,
    from: sender
  });

  res.json({
    success: true,
    messageId: result.SMSMessageData.Recipients[0].messageId,
    status: 'sent',
    recipients: recipient.length
  });
});
```

## Error Handling

### Common Errors

| Error | Status | Description | Solution |
|-------|--------|-------------|----------|
| Invalid authentication | 401 | Token is incorrect | Check `SMS_PROVIDER_AUTH_TOKEN` |
| Invalid recipient | 400 | Phone number format invalid | Validate E.164 format |
| Empty message | 400 | Message body is empty | Validate before sending |
| Provider timeout | 504 | Provider didn't respond | Implement retry logic |
| Rate limit exceeded | 429 | Too many requests | Implement rate limiting |

### Retry Logic

The backend automatically retries failed requests:

```typescript
async sendWithRetry(request: ProviderRequest, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.sendToProvider(request);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

## Testing Provider Integration

### Manual Testing

```bash
# Test with curl
curl -X POST http://localhost:4000/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": ["+250783503691"],
    "message": "Test message",
    "sender": "TEST",
    "type": "sms",
    "authentication": "ntf_6ef9d99fc6c892099e52003e03b384d578dd010e1c0e1efa",
    "idempotencyKey": "test-batch-123"
  }'
```

### Automated Testing

Create integration tests:

```javascript
describe('SMS Provider Integration', () => {
  it('should send SMS successfully', async () => {
    const response = await axios.post('http://localhost:4000/send', {
      recipient: ['+250783503691'],
      message: 'Test message',
      sender: 'TEST',
      type: 'sms',
      authentication: process.env.SMS_PROVIDER_AUTH_TOKEN,
      idempotencyKey: `test-${Date.now()}`
    });

    expect(response.data.success).toBe(true);
    expect(response.data.status).toBe('sent');
  });
});
```

## Monitoring and Logging

### Provider Logs

Monitor provider requests and responses:

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});
```

### Metrics to Track

- Request rate (requests per minute)
- Success rate (percentage)
- Average response time
- Error rate by type
- Retry attempts

## Best Practices

1. **Validate all inputs** - Check phone numbers, message length, etc.
2. **Implement idempotency** - Use the idempotencyKey to prevent duplicates
3. **Use exponential backoff** - For retries on failures
4. **Log everything** - Keep detailed logs for debugging
5. **Monitor performance** - Track success rates and response times
6. **Secure authentication** - Use environment variables for sensitive data
7. **Handle rate limits** - Implement queuing if needed
8. **Test thoroughly** - Use the mock provider for integration testing

## Related Documentation

- [Webhooks Guide](./WEBHOOKS_GUIDE.md)
- [API Authentication](./API_AUTHENTICATION.md)
- [Getting Started](./GETTING_STARTED.md)
