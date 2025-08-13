# Vercel Environment Variables Setup

## Add these to your Vercel project:

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. Add these variables:

### Variable 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://aiefuksfypocgzyvagpe.supabase.co`
- **Environment**: Production, Preview, Development (select all)

### Variable 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZWZ1a3NmeXBvY2d6eXZhZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzE3OTAsImV4cCI6MjA3MDUwNzc5MH0.8_bJUjd3mx0clLbuz0oGUs-lXPa_6fJW2CJxjDUOmZg`
- **Environment**: Production, Preview, Development (select all)

3. **Save** the variables

4. **Redeploy** your project (Vercel → Deployments → "..." → Redeploy)

## ✅ Once Done:
- Your app will connect to Supabase in production
- Contractor profiles will save to the database
- Data will be consistent between sidebar and profile
- You'll have persistent storage across sessions