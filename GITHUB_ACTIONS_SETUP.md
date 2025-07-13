# GitHub Actions Cleanup Setup

This project uses GitHub Actions to run the Firebase cleanup job daily at midnight UTC. **Optimized for free plans** of GitHub, Vercel, and Firebase.

## Setup Instructions

### 1. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:

```
SERVER_CRON_SECRET=your-super-secret-cron-key-here
CLEANUP_URL=https://your-app.vercel.app
```

### 2. Environment Variables

Set the same `SERVER_CRON_SECRET` in your Vercel project environment variables.

### 3. How It Works

- **Schedule**: Runs daily at 00:00 UTC
- **Authentication**: Uses `x-cron-secret` header with `SERVER_CRON_SECRET`
- **Manual trigger**: You can manually run the workflow from GitHub Actions tab
- **Dry run**: Manual triggers include a dry-run test

### 4. Testing

#### Manual Test
1. Go to **Actions** tab in your GitHub repository
2. Select **Daily Cleanup Job**
3. Click **Run workflow**
4. This will run both the actual cleanup and a dry-run test

#### Local Test
```bash
curl -X POST \
  -H "x-cron-secret: your-secret-key" \
  -H "Content-Type: application/json" \
  "https://your-app.vercel.app/api/cleanup?dry-run=true"
```

### 5. Monitoring

- View workflow runs in the **Actions** tab
- Check logs for each cleanup execution
- Monitor API response status codes

## Free Plan Optimizations

This cleanup system is optimized for free tiers:

### 🔥 **Firebase Spark Plan**
- **Room limit**: 100 rooms per cleanup run (stays under read limits)
- **Typing limit**: 50 typing documents per run (prevents quota exhaustion)
- **Small batches**: 10 rooms per batch (reduces memory usage)

### ⚡ **Vercel Hobby Plan**
- **Execution limit**: 45-second timeout (under 60s limit)
- **Early exit**: Stops processing if approaching time limit
- **Error handling**: Continues processing even if some batches fail

### 🐙 **GitHub Actions Free**
- **Workflow timeout**: 5 minutes maximum
- **Health check**: Quick API validation before cleanup
- **Curl timeouts**: 300s for cleanup, 120s for dry-run

## Benefits of GitHub Actions

✅ **Free**: No additional cost for public repositories  
✅ **Platform agnostic**: Works with any hosting platform  
✅ **Transparent**: All logs visible in GitHub  
✅ **Flexible**: Easy to modify schedule or add steps  
✅ **Template friendly**: No sensitive data in repository  
✅ **Free plan friendly**: Optimized for usage limits  

## Troubleshooting

- **401 Unauthorized**: Check `SERVER_CRON_SECRET` matches in both GitHub and Vercel
- **Workflow not running**: Verify the repository has GitHub Actions enabled
- **API errors**: Check Vercel function logs for detailed error messages 