# Vercel Deployment Setup

## Environment Variables

To deploy this app on Vercel, you need to configure the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_PROJECT_ID` | `ptrkvdkxbwwzszwuweja` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cmt2ZGt4Ynd3enN6d3V3ZWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDQ5NzEsImV4cCI6MjA3NjMyMDk3MX0.z0N0nokoeYdKQSrthJMIesJYxXCakkz0ObabghHLaoU` |
| `VITE_SUPABASE_URL` | `https://ptrkvdkxbwwzszwuweja.supabase.co` |

4. Make sure to set these for all environments (Production, Preview, Development)
5. Redeploy your application

## Important Notes

- The edge functions are hosted on Lovable Cloud (Supabase), not Vercel
- Vercel only hosts the frontend React application
- The frontend will communicate with the backend edge functions via the Supabase URL
- These values are also available in the `.env.example` file in the project root
