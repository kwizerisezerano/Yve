# Quick Start Guide - Apps Feature

## 🚀 Getting Started (5 minutes)

### 1. Navigate to Apps
Open your browser and go to: `http://localhost:5173/app/apps`

### 2. Create Your First App
```
1. Click "Create App" button
2. Fill in:
   - Name: "My Test App"
   - Description: "Testing SMS functionality"
3. Click "Create App"
```

### 3. Generate API Key
```
1. Click on your newly created app card
2. Click "Create Key" button
3. Enter name: "Test Key"
4. Click "Create Key"
5. Copy the generated key (starts with sk_test_ or sk_live_)
```

### 4. Send Your First Message
```
1. Click "Send Message" button
2. Enter recipient: +250781234567
3. Type message: "Hello from Ingoga SMS!"
4. Click "Send Messages"
```

## 📋 Sample API Key Usage

Once you have your API key, use it to send messages via API:

```bash
curl -X POST http://your-backend/v1/apps/:appId/messages \
  -H "X-API-Key: sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["+250781234567"],
    "message": "Hello from API!",
    "from": "INGOGA"
  }'
```

## 🔍 Feature Tour

### Apps Page (`/app/apps`)
- **View all apps** in grid layout
- **Create new app** with modal form
- **See metrics**: Messages sent, API keys, last used
- **Quick actions**: Manage, Send, Delete

### App Detail Page (`/app/apps/:appId`)
- **App overview** with stats
- **API keys management** (create, revoke, delete)
- **Key copying** with one click
- **Navigation** to send messages

### Send Message Page (`/app/apps/:appId/send`)
- **Recipients field**: Multiple phone numbers
- **Message field**: Up to 160 characters
- **Sender ID**: Optional custom sender
- **Cost calculator**: Real-time pricing
- **Preview**: See message before sending
- **History**: Recent message batches

## 🎯 Common Tasks

### Delete an App
```
1. Go to /app/apps
2. Click "Delete" on app card
3. Confirm deletion
→ App and all API keys removed
```

### Revoke API Key
```
1. Go to app detail page
2. Find the key you want to revoke
3. Click "Revoke" button
4. Confirm action
→ Key status changes to REVOKED
```

### Send Bulk Messages
```
1. Open send message page
2. Enter multiple numbers:
   +250781234567
   +250782345678
   +250783456789
3. Type your message
4. See cost estimate update
5. Click "Send Messages"
→ Messages sent to all recipients
```

## 🐛 Troubleshooting

### App Not Creating
- Check all required fields are filled
- Ensure name is unique
- Check console for errors

### API Key Not Copying
- Ensure browser clipboard permissions
- Try manual selection and copy
- Check if copy button shows "Copied!"

### Messages Not Sending
- Verify app status is ACTIVE
- Check recipient format (+countrycode...)
- Ensure message is not empty
- Verify sufficient wallet balance

## 💡 Tips & Tricks

1. **Test vs Live Keys**: Name keys with "test" or "dev" to auto-generate test keys
2. **Bulk Sending**: Paste phone numbers from Excel (one per line)
3. **Message Length**: Keep under 160 chars to avoid splitting
4. **Sender ID**: Use 11 characters max, alphanumeric only
5. **Cost Management**: Check estimate before sending bulk messages

## 🔗 Navigation Shortcuts

- **Dashboard** → Click "Send Messages" quick action
- **Apps List** → Sidebar: Messaging > Apps
- **Send Message** → From app card or app detail page
- **API Keys** → Open app detail page

## 📊 Understanding Metrics

### App Card Metrics
- **Status**: ACTIVE (green), INACTIVE (yellow), SUSPENDED (red)
- **API Keys**: Number of active keys for the app
- **Messages Sent**: Total messages delivered
- **Last Used**: Time since last API call

### Message Batch Metrics
- **Total Messages**: Recipients count
- **Success Count**: Successfully delivered
- **Failed Count**: Delivery failures
- **Total Cost**: Calculated cost ($0.05 per message)

## 🎓 Learning Path

1. **Start Here**: Create your first app
2. **Next**: Generate an API key
3. **Then**: Send a test message
4. **Advanced**: Send bulk messages
5. **Expert**: Integrate with your application

## 🆘 Need Help?

1. Read: `API_INTEGRATION_GUIDE.md` for detailed docs
2. Check: Console logs for error messages
3. Review: Network tab for API responses
4. Inspect: React Query DevTools for data state

## ✅ Checklist

Before going to production:
- [ ] Create production app
- [ ] Generate live API key (sk_live_...)
- [ ] Test single message send
- [ ] Test bulk message send
- [ ] Verify cost calculations
- [ ] Check message delivery status
- [ ] Review API key security
- [ ] Set up monitoring
- [ ] Configure rate limits
- [ ] Add error handling

## 🚀 Ready to Integrate?

The mock implementation is fully functional. When ready to connect to your real SMS gateway:

1. Open `src/features/apps/api/apps.api.ts`
2. Replace mock functions with HTTP calls
3. Update base URL to your backend
4. Test with real phone numbers
5. Deploy and monitor

That's it! You're ready to start using the Apps feature. 🎉
