# Webhooks Guide

This guide explains how webhooks work in the Ingoga SMS Gateway platform, including both incoming webhooks from the SMS provider and outgoing webhooks to your application.

## Overview

The Ingoga SMS Gateway uses webhooks in two directions:

1. **Incoming Webhooks** - SMS provider sends delivery status updates to our backend
2. **Outgoing Webhooks** - Our backend forwards status updates to your application

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  SMS Provider   │ webhook │  Ingoga Backend │ webhook │  Your App       │
│  Microservice   │────────>│  (NestJS)       │────────>│  (Customer)     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## 1. Incoming Webhooks (SMS Provider to Backend)

### Endpoint

```
POST http://localhost:3000/webhooks/sms/status
```

### Webhook Payload Format

The SMS provider sends delivery status updates in the following format:

```json
{
  "batchId": "batch_1234567890abcdef",
  "messages": [
    {
      "providerId": "msg_xyz123",
      "status": "DELIVERED",
      "deliveredAt": "2026-08-27T10:30:00Z"
    },
    {
      "providerId": "msg_abc456",
      "status": "FAILED",
      "errorCode": "INVALID_NUMBER",
      "errorMessage": "The phone number is invalid",
      "failedAt": "2026-08-27T10:30:05Z"
    }
  ]
}
```

### Message Status Values

- `DELIVERED` - Message successfully delivered to recipient
- `FAILED` - Message delivery failed
- `PENDING` - Message is still being processed
- `EXPIRED` - Message expired before delivery

### Backend Processing

When the backend receives a webhook:

1. **Validates the batch ID** - Ensures the batch exists in the database
2. **Updates message statuses** - Updates each message record with the new status
3. **Records timestamps** - Sets `deliveredAt` or `failedAt` timestamps
4. **Updates batch statistics** - Updates `successCount` and `failedCount`
5. **Creates audit logs** - Records the webhook event for auditing
6. **Forwards to user application** - If configured, sends update to customer's webhook URL

### Error Handling

If webhook processing fails:

- Returns HTTP 400 for invalid payload
- Returns HTTP 404 if batch not found
- Returns HTTP 500 for server errors
- Failed forwards to user apps are logged but don't block webhook processing

## 2. Outgoing Webhooks (Backend to Your Application)

### Configuration

Configure webhooks at the **App level** when creating or updating an app:

```json
{
  "name": "My Application",
  "description": "My SMS application",
  "webhookUrl": "https://myapp.com/webhooks/sms-status",
  "webhookSecret": "your-secret-key-for-signature-verification"
}
```

### Webhook Payload Format

Your application will receive webhooks in this format:

```json
{
  "event": "sms.status_update",
  "batchId": "batch_1234567890abcdef",
  "timestamp": "2026-08-27T10:30:00Z",
  "messages": [
    {
      "id": "msg-uuid-1",
      "to": "+250783503691",
      "from": "MYAPP",
      "status": "DELIVERED",
      "cost": 20,
      "smsCount": 1,
      "providerId": "msg_xyz123",
      "deliveredAt": "2026-08-27T10:30:00Z",
      "errorCode": null,
      "errorMessage": null
    },
    {
      "id": "msg-uuid-2",
      "to": "+250733503693",
      "from": "MYAPP",
      "status": "FAILED",
      "cost": 20,
      "smsCount": 1,
      "providerId": "msg_abc456",
      "failedAt": "2026-08-27T10:30:05Z",
      "errorCode": "INVALID_NUMBER",
      "errorMessage": "The phone number is invalid"
    }
  ]
}
```

### Webhook Security

#### Signature Verification

Each webhook includes security headers for verification:

```
X-Webhook-Signature: sha256=abc123def456...
X-Webhook-Signature-Algorithm: sha256
User-Agent: SMS-Gateway-Webhook/1.0
```

#### Verifying the Signature

To verify the webhook is from Ingoga:

**Node.js Example:**

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

// In your webhook handler
app.post('/webhooks/sms-status', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
  res.json({ received: true });
});
```

**Python Example:**

```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return signature == f"sha256={expected_signature}"

# In your webhook handler
@app.route('/webhooks/sms-status', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ.get('WEBHOOK_SECRET')
    
    if not verify_webhook_signature(request.json, signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook...
    return jsonify({'received': True})
```

### Webhook Response Requirements

Your webhook endpoint should:

1. **Respond quickly** (within 5 seconds)
2. **Return HTTP 200** on successful processing
3. **Return appropriate error codes** on failure
4. **Process asynchronously** if handling takes time

**Good Response:**
```json
{
  "received": true,
  "processed": true
}
```

**Error Response:**
```json
{
  "error": "Invalid payload",
  "code": "INVALID_PAYLOAD"
}
```

### Retry Policy

If your webhook endpoint fails, Ingoga will:

- Log the failure
- NOT automatically retry (implement your own retry logic if needed)
- Continue processing other webhooks

**Best Practice:** Implement idempotency in your webhook handler using the `batchId` to handle duplicate deliveries.

## Testing Webhooks

### Testing Incoming Webhooks (Provider to Backend)

You can manually trigger a webhook using curl:

```bash
curl -X POST http://localhost:3000/webhooks/sms/status \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "batch_1234567890abcdef",
    "messages": [
      {
        "providerId": "msg_test123",
        "status": "DELIVERED",
        "deliveredAt": "2026-08-27T10:30:00Z"
      }
    ]
  }'
```

### Testing Outgoing Webhooks (Backend to Your App)

#### Option 1: Use webhook.site

1. Go to https://webhook.site
2. Copy your unique URL
3. Configure it as your app's webhook URL
4. Send an SMS
5. Trigger the provider webhook
6. View the forwarded webhook on webhook.site

#### Option 2: Use ngrok for Local Testing

```bash
# Start ngrok
ngrok http 8080

# Use the ngrok URL as your webhook URL
# Your local server at localhost:8080 will receive webhooks
```

#### Option 3: Create a Simple Test Server

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhooks/sms-status', (req, res) => {
  console.log('Webhook received:');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  
  res.json({ received: true });
});

app.listen(8080, () => {
  console.log('Webhook test server running on port 8080');
});
```

## Common Webhook Patterns

### 1. Idempotent Processing

```javascript
const processedBatches = new Set();

app.post('/webhooks/sms-status', async (req, res) => {
  const { batchId } = req.body;
  
  if (processedBatches.has(batchId)) {
    console.log(`Already processed batch ${batchId}`);
    return res.json({ received: true, duplicate: true });
  }
  
  // Process webhook...
  await processWebhook(req.body);
  
  processedBatches.add(batchId);
  res.json({ received: true });
});
```

### 2. Asynchronous Processing

```javascript
app.post('/webhooks/sms-status', async (req, res) => {
  // Respond immediately
  res.json({ received: true });
  
  // Process asynchronously
  processWebhookAsync(req.body).catch(err => {
    console.error('Failed to process webhook:', err);
  });
});
```

### 3. Database Persistence

```javascript
app.post('/webhooks/sms-status', async (req, res) => {
  // Store webhook for processing
  await db.webhooks.create({
    payload: req.body,
    receivedAt: new Date(),
    processed: false
  });
  
  res.json({ received: true });
  
  // Process in background worker
  await processWebhookQueue();
});
```

## Monitoring and Debugging

### Checking Webhook Delivery

Query the backend for batch status:

```bash
curl http://localhost:3000/webhooks/sms/batch/batch_1234567890abcdef
```

Response:
```json
{
  "batchId": "batch_1234567890abcdef",
  "totalMessages": 10,
  "successCount": 8,
  "failedCount": 2,
  "status": "COMPLETED"
}
```

### Backend Logs

The backend logs webhook events:

```
[WebhookService] Processing webhook for batch batch_123 with 2 message updates
[WebhookService] Forwarding webhook to user app: https://myapp.com/webhooks
[WebhookService] Successfully forwarded webhook to user app
[WebhookService] Webhook processed: batch=batch_123, updated=2, success=1, failed=1
```

### Common Issues

**Issue:** Webhook not received by your app
- Check webhook URL configuration
- Verify your app is accessible from the internet (use ngrok for local testing)
- Check firewall settings

**Issue:** Signature verification fails
- Ensure you're using the correct webhook secret
- Verify you're computing the signature correctly
- Check that the payload hasn't been modified

**Issue:** Slow webhook processing
- Move heavy processing to background jobs
- Respond with HTTP 200 immediately
- Process asynchronously

## Best Practices

1. **Validate webhooks** - Always verify the signature
2. **Be idempotent** - Handle duplicate webhooks gracefully
3. **Respond quickly** - Don't block on heavy processing
4. **Log everything** - Keep audit logs of all webhook events
5. **Handle failures** - Implement retry logic for critical operations
6. **Secure your endpoints** - Use HTTPS and signature verification
7. **Monitor performance** - Track webhook success/failure rates

## Related Documentation

- [SMS Provider Integration](./SMS_PROVIDER_INTEGRATION.md)
- [API Authentication](./API_AUTHENTICATION.md)
- [Getting Started](./GETTING_STARTED.md)
