# Deployment Guide - Vercel

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. PostgreSQL database (Vercel Postgres, Supabase, or Neon)

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Secure Exam Platform"

# Create repository on GitHub
# Then push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Set Up PostgreSQL Database

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string

#### Option B: Supabase

1. Create project at https://supabase.com
2. Go to Settings > Database
3. Copy the connection string (Transaction mode)

#### Option C: Neon

1. Create project at https://neon.tech
2. Copy the connection string

### 3. Update Prisma Schema for PostgreSQL

Before deployment, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Deploy to Vercel

1. **Import Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   
   Add these in Vercel dashboard under "Environment Variables":

   ```
   DATABASE_URL=<your-postgresql-connection-string>
   NEXTAUTH_URL=<your-vercel-app-url>
   NEXTAUTH_SECRET=<generate-secure-random-string>
   NODE_ENV=production
   RATE_LIMIT_MAX=60
   SESSION_MAX_AGE=86400
   APP_NAME=Secure Exam Platform
   APP_URL=<your-vercel-app-url>
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123456
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - The `vercel-build` script will:
     - Generate Prisma Client
     - Push database schema
     - Build Next.js application

### 5. Seed Production Database

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run seed command
vercel env pull .env.production
npm run prisma:seed
```

Or use Vercel CLI to run seed remotely:

```bash
vercel env pull
npx tsx prisma/seed.ts
```

### 6. Verify Deployment

1. Visit your Vercel URL
2. Test login with demo credentials
3. Verify all features work

## Environment Variables Reference

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-generated-secret-minimum-32-chars"

# Environment
NODE_ENV="production"
```

### Optional Variables

```bash
RATE_LIMIT_MAX=60
SESSION_MAX_AGE=86400
APP_NAME="Secure Exam Platform"
APP_URL="https://your-app.vercel.app"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
```

## Troubleshooting

### Build Fails with Prisma Error

**Solution:**
1. Ensure `postinstall` script is in package.json
2. Verify DATABASE_URL is set in Vercel
3. Check Prisma schema syntax

### Database Connection Error

**Solution:**
1. Verify DATABASE_URL format
2. Check database credentials
3. Ensure database allows connections from Vercel IPs
4. For Supabase: Use Transaction mode connection string

### NextAuth Error

**Solution:**
1. Ensure NEXTAUTH_URL matches your Vercel domain
2. Verify NEXTAUTH_SECRET is at least 32 characters
3. Check that NEXTAUTH_URL includes https://

### Build Succeeds but Runtime Errors

**Solution:**
1. Check Vercel function logs
2. Verify all environment variables are set
3. Ensure database schema is pushed
4. Check NEXTAUTH_URL is correct

## Post-Deployment

### 1. Update NEXTAUTH_URL

After deployment, update environment variable with actual Vercel URL:

```
NEXTAUTH_URL=https://your-actual-app.vercel.app
```

Then redeploy.

### 2. Set Up Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update NEXTAUTH_URL to use custom domain
4. Redeploy

### 3. Monitor Application

- View logs in Vercel dashboard
- Check function performance
- Monitor database usage

### 4. Scale Database

As your application grows:
- Monitor database size
- Upgrade database plan if needed
- Consider connection pooling
- Add read replicas for better performance

## Continuous Deployment

After initial setup:

1. Push changes to GitHub
2. Vercel automatically deploys
3. Preview deployments for branches
4. Production deployment for main branch

## Rollback

If deployment has issues:

1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

## Database Migrations

For schema changes:

1. Update `prisma/schema.prisma`
2. Test locally:
   ```bash
   npm run prisma:push
   ```
3. Commit and push
4. Vercel deployment will apply changes

## Security Checklist

- [✓] Strong NEXTAUTH_SECRET set
- [✓] Database credentials secure
- [✓] HTTPS enabled
- [✓] Environment variables not committed
- [✓] Rate limiting configured
- [✓] Audit logging enabled
- [✓] Security headers configured

## Performance Optimization

1. **Database**
   - Enable connection pooling
   - Add indexes for frequently queried fields
   - Use database caching

2. **Application**
   - Enable Next.js caching
   - Optimize images
   - Use ISR where appropriate

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor response times
   - Track user metrics

## Backup Strategy

1. **Database Backups**
   - Enable automatic backups in your database provider
   - Schedule regular manual backups
   - Test restore procedures

2. **Code Backups**
   - GitHub serves as code backup
   - Tag releases: `git tag v1.0.0`

## Support

For deployment issues:
- Check Vercel documentation
- Review Vercel function logs
- Test locally first
- Verify all environment variables

---

**Your Secure Exam Platform is now live! 🚀**
