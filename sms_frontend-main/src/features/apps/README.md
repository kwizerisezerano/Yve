# Apps & Messaging Feature

This feature provides a complete app management system with API key generation and message sending capabilities using mock data to simulate a microservice architecture.

## Overview

The Apps feature allows users to:
1. Create and manage multiple applications
2. Generate API keys for each application
3. Send SMS messages through applications
4. Track message history and delivery status
5. Monitor app usage statistics

## Architecture

### Mock Microservice Simulation

This implementation simulates a microservice architecture where:
- **Frontend** handles UI/UX and user interactions
- **Mock API Layer** (`apps.api.ts`) simulates backend microservices that would handle:
  - App management
  - API key generation and validation
  - Message queuing and delivery
  - Statistics tracking

### File Structure

```
src/features/apps/
├── types/
│   └── app.types.ts          # TypeScript interfaces
├── api/
│   └── apps.api.ts            # Mock API (simulates microservices)
├── hooks/
│   ├── useApps.ts             # App CRUD operations
│   ├── useApiKeys.ts          # API key management
│   └── useMessaging.ts        # Message sending
├── components/
│   ├── CreateAppModal.tsx     # Modal for creating apps
│   ├── AppCard.tsx            # App display card
│   └── CreateApiKeyModal.tsx  # Modal for API key generation
├── pages/
│   ├── AppsPage.tsx           # Main apps listing
│   ├── AppDetailPage.tsx      # App details & API keys
│   └── SendMessagePage.tsx    # Message sending interface
└── README.md                  # This file
```

## Features

### 1. App Management

**Create App**
- Users can create multiple applications for different purposes
- Each app has a name, description, and status
- Apps track message count and last usage

**App Details**
- View app statistics (messages sent, API keys, last used)
- Manage API keys for the app
- Quick access to send messages

### 2. API Key Generation

**Key Types**
- `sk_test_*` - Testing/development keys
- `sk_live_*` - Production keys

**Key Features**
- Automatic prefix assignment based on key name
- Copy-to-clipboard functionality
- Revoke/delete capabilities
- Last used tracking

**Security Notes** (for real implementation):
- Keys should be hashed in the database
- Only show full key once during creation
- Implement key rotation policies
- Add expiration dates

### 3. Message Sending

**Features**
- Single or bulk message sending
- Custom sender ID support
- Real-time cost estimation
- Character count and SMS part calculation
- Delivery status tracking

**Validation**
- Phone number format validation
- Message length limits (160 chars per SMS)
- Recipient count tracking

**Mock Delivery**
- 90% success rate simulation
- Instant delivery for demo purposes
- Batch processing with statistics

## Mock Data Details

### Apps Mock Data
```typescript
- E-Commerce Platform (15,420 messages sent)
- Mobile App (8,950 messages sent)
```

### API Keys Mock Data
```typescript
- Production keys (sk_live_*)
- Development keys (sk_test_*)
- Active/revoked status tracking
```

### Message Simulation
- Random 90% delivery success rate
- $0.05 per SMS cost
- Instant processing (real-world would be async)
- Batch tracking with success/fail counts

## Integration Points (Real Implementation)

### Backend Microservices Needed

1. **App Service**
   - CRUD operations for apps
   - App status management
   - Statistics aggregation

2. **API Key Service**
   - Key generation with cryptographic security
   - Key validation and authentication
   - Rate limiting per key

3. **Message Queue Service**
   - Accept message requests
   - Queue for processing
   - Priority handling

4. **SMS Gateway Service**
   - Interface with telecom providers
   - Delivery status webhooks
   - Retry logic for failures

5. **Billing Service**
   - Cost calculation
   - Wallet deduction
   - Transaction logging

### API Endpoints (Example)

```
POST   /api/v1/apps                 - Create app
GET    /api/v1/apps                 - List apps
GET    /api/v1/apps/:id             - Get app details
PATCH  /api/v1/apps/:id             - Update app
DELETE /api/v1/apps/:id             - Delete app

POST   /api/v1/apps/:id/keys        - Create API key
GET    /api/v1/apps/:id/keys        - List keys
DELETE /api/v1/apps/:id/keys/:keyId - Delete key
POST   /api/v1/apps/:id/keys/:keyId/revoke - Revoke key

POST   /api/v1/messages              - Send messages
GET    /api/v1/messages              - List message batches
GET    /api/v1/messages/:id          - Get batch details

# Webhook endpoint for delivery status
POST   /api/v1/webhooks/delivery     - Delivery status callback
```

## Usage Examples

### Creating an App

1. Navigate to `/app/apps`
2. Click "Create App"
3. Fill in name and description
4. App is created and ready to use

### Generating API Keys

1. Go to app details
2. Click "Create Key"
3. Name the key (use "test" or "dev" for test keys)
4. Copy the key immediately (won't be shown again in real implementation)

### Sending Messages

1. Select an app
2. Click "Send Message"
3. Enter recipients (one per line or comma-separated)
4. Enter message content
5. Optionally set sender ID
6. Review cost estimate
7. Click "Send Message"
8. View results and delivery status

## Real-World Considerations

### Security
- Implement proper authentication for API keys
- Use HTTPS for all communications
- Encrypt sensitive data at rest
- Implement rate limiting
- Add IP whitelisting for API keys

### Scalability
- Use message queues (Redis, RabbitMQ, Kafka)
- Implement worker pools for processing
- Database indexing for lookups
- Caching for frequently accessed data
- CDN for static assets

### Reliability
- Retry mechanisms for failed deliveries
- Dead letter queues for permanent failures
- Health checks and monitoring
- Graceful degradation
- Circuit breakers for external services

### Compliance
- GDPR/data protection compliance
- Opt-out/unsubscribe management
- Message content filtering
- Audit logging
- International regulations (TCPA, etc.)

### Monitoring
- Message delivery rates
- API key usage statistics
- Error tracking and alerting
- Performance metrics
- Cost tracking

## Future Enhancements

1. **Scheduled Messages** - Send at specific times
2. **Templates** - Reusable message templates
3. **Webhooks** - Delivery status callbacks
4. **Analytics Dashboard** - Detailed insights
5. **A/B Testing** - Test message variations
6. **Segmentation** - Target specific groups
7. **Two-way Messaging** - Receive replies
8. **Rich Media** - MMS support
9. **Campaign Management** - Bulk campaigns
10. **API Documentation** - Interactive API docs

## Testing

The current implementation uses mock data, making it perfect for:
- Frontend development and testing
- UI/UX demonstrations
- Integration testing patterns
- API contract definition

To test:
1. Create multiple apps
2. Generate various API keys
3. Send test messages
4. Observe simulated delivery statuses
5. Check statistics updates

## Migration to Real Backend

When connecting to real microservices:

1. Replace `apps.api.ts` with real API client
2. Update endpoint URLs in API configuration
3. Add proper error handling
4. Implement authentication headers
5. Add loading states and retries
6. Handle async operations properly
7. Add proper TypeScript types from backend
8. Implement websockets for real-time updates
9. Add proper validation on both sides
10. Implement proper testing strategies

## Support

For questions or issues with this feature, refer to the main project documentation or contact the development team.
