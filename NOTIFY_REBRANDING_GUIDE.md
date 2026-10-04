# Notify Rebranding Guide

This guide explains how to completely rebrand the Relay (Hyvor) frontend and backend to use your own brand name "Notify".

## What Needs to Be Rebranded

### 1. Backend (PHP/Symfony)

The Relay backend has hardcoded branding in several places:

#### Files to Modify in `hyvor-relay/backend/`:

1. **Logo and Icons**
   - `public/assets/` - Replace Relay logo with Notify logo
   - `public/favicon.ico` - Replace favicon

2. **Email Templates**
   - `templates/` - Update email templates with Notify branding
   - Replace "Hyvor Relay" with "Notify"

3. **Environment Variables**
   Already configured in `.env`:
   - `WEB_URL=https://yourdomain.com/Notify`
   - `INSTANCE_DOMAIN=mail.yourdomain.com`

4. **Database Configuration**
   - Database name: `Notify_db` (instead of `relay_db`)

### 2. Frontend (SvelteKit)

The Relay frontend needs significant rebranding:

#### Files to Modify in `hyvor-relay/frontend/`:

1. **Package.json**
   ```json
   {
     "name": "Notify-frontend",
     "description": "Notify Email Provider"
   }
   ```

2. **App Configuration**
   - `src/lib/config.ts` - Update app name, URLs
   - Replace "Hyvor Relay" with "Notify"

3. **Components and Pages**
   Search and replace in all `.svelte` files:
   - "Hyvor" → "Notify"
   - "Relay" → "Notify"
   - "hyvor.com" → "yourdomain.com"
   - "relay.hyvor.com" → "yourdomain.com/Notify"

4. **Static Assets**
   - `static/` - Replace all logos, icons, images
   - `static/favicon.png` - Replace favicon

5. **SEO Metadata**
   - Update `<title>` tags
   - Update meta descriptions
   - Update Open Graph tags

### 3. Automated Rebranding Script

Create a script to automate the search and replace:

```bash
#!/bin/bash
# rebrand.sh - Automated rebranding script

BRAND_NAME="Notify"
OLD_BRAND="Hyvor Relay"
OLD_SHORT="Relay"
OLD_COMPANY="Hyvor"
DOMAIN="yourdomain.com"

# Rebrand frontend
cd hyvor-relay/frontend

# Find and replace in .svelte files
find src -name "*.svelte" -type f -exec sed -i "s/$OLD_BRAND/$BRAND_NAME/g" {} +
find src -name "*.svelte" -type f -exec sed -i "s/$OLD_SHORT/$BRAND_NAME/g" {} +
find src -name "*.svelte" -type f -exec sed -i "s/$OLD_COMPANY/Your Company/g" {} +

# Find and replace in TypeScript files
find src -name "*.ts" -type f -exec sed -i "s/$OLD_BRAND/$BRAND_NAME/g" {} +
find src -name "*.ts" -type f -exec sed -i "s/$OLD_SHORT/$BRAND_NAME/g" {} +

# Rebrand backend
cd ../backend

# Find and replace in PHP files
find src -name "*.php" -type f -exec sed -i "s/$OLD_BRAND/$BRAND_NAME/g" {} +
find src -name "*.php" -type f -exec sed -i "s/$OLD_SHORT/$BRAND_NAME/g" {} +

# Replace URLs
find . -type f \( -name "*.php" -o -name "*.svelte" -o -name "*.ts" \) -exec sed -i "s/relay.hyvor.com/$DOMAIN\/Notify/g" {} +
find . -type f \( -name "*.php" -o -name "*.svelte" -o -name "*.ts" \) -exec sed -i "s/hyvor.com/$DOMAIN/g" {} +

echo "Rebranding complete!"
```

### 4. Manual Rebranding Checklist

After running the automated script, manually verify:

#### Backend (PHP)
- [ ] Update `public/assets/` with Notify logo
- [ ] Update `public/favicon.ico`
- [ ] Review `templates/` for email templates
- [ ] Check `src/Util/` for any hardcoded strings
- [ ] Update any documentation in `README.md`

#### Frontend (SvelteKit)
- [ ] Replace `static/logo.svg` with Notify logo
- [ ] Replace `static/favicon.png`
- [ ] Update `src/routes/+layout.svelte` - header/footer branding
- [ ] Update `src/lib/config.ts` - app configuration
- [ ] Check all page titles in `src/routes/`
- [ ] Update any external links to Relay documentation
- [ ] Replace "Powered by Hyvor" footer text

### 5. Custom Assets Preparation

Create your Notify branding assets:

```
hyvor-relay/
├── backend/
│   └── public/
│       ├── assets/
│       │   ├── logo.png (Notify logo)
│       │   └── icon.png (Notify icon)
│       └── favicon.ico (Notify favicon)
└── frontend/
    └── static/
        ├── logo.svg (Notify logo)
        ├── favicon.png (Notify favicon)
        └── og-image.png (Open Graph image)
```

### 6. Docker Build with Rebranding

When building Docker images, ensure the rebranded files are included:

```dockerfile
# In hyvor-relay/Dockerfile
COPY backend/ /app
COPY frontend/ /frontend

# The build process will use your rebranded files
```

### 7. Testing Rebranding

After rebranding, verify:

1. **Backend**
   ```bash
   cd hyvor-relay/backend
   php bin/console cache:clear
   php -S localhost:8080 -t public
   # Visit http://localhost:8080 and check for old branding
   ```

2. **Frontend**
   ```bash
   cd hyvor-relay/frontend
   npm install
   npm run dev
   # Visit http://localhost:5173 and check for old branding
   ```

3. **Search for remaining references**
   ```bash
   cd hyvor-relay
   grep -r "Hyvor" . --exclude-dir=node_modules --exclude-dir=vendor
   grep -r "Relay" . --exclude-dir=node_modules --exclude-dir=vendor
   grep -r "hyvor.com" . --exclude-dir=node_modules --exclude-dir=vendor
   ```

### 8. Legal Considerations

⚠️ **Important**: Relay is licensed under AGPL-3.0. When rebranding:

1. **Keep the License** - Do not remove AGPL-3.0 license
2. **Attribute Source** - Include attribution to original source (Hyvor)
3. **Share Modifications** - AGPL requires you to share your modifications if you offer it as a network service
4. **README Updates** - Update README to mention it's based on Hyvor Relay

Add to your README:
```
This email provider is based on Hyvor Relay (https://github.com/hyvor/relay)
and is licensed under AGPL-3.0. Modifications have been made to rebrand
the service as Notify.
```

### 9. Deployment with Rebranding

When deploying with Docker Compose:

```bash
# 1. Complete rebranding locally
./rebrand.sh

# 2. Build with rebranded code
docker-compose build

# 3. Deploy
docker-compose up -d
```

## Summary

The rebranding process involves:
1. ✅ **URL paths** - `/relay/` → `/Notify/` (already done)
2. ✅ **Environment variables** - `RELAY_*` → `Notify_*` (already done)
3. ✅ **Database names** - `relay_db` → `Notify_db` (already done)
4. ⏳ **Frontend rebranding** - Manual or automated replacement
5. ⏳ **Backend rebranding** - Manual or automated replacement
6. ⏳ **Asset replacement** - Logos, favicons, images
7. ⏳ **Legal compliance** - Keep AGPL license and attribution

After completing the rebranding, your service will appear as "Notify" with no visible Relay branding to end users.
