# Setup Guide - Secure Exam Platform

## Zero-Error Setup Instructions

Follow these steps exactly to get the application running with **ZERO ERRORS**.

### Step 1: Verify Prerequisites

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm version (must be 9+)
npm --version
```

If you need to install Node.js: https://nodejs.org/

### Step 2: Navigate to Project Directory

```bash
cd exam-platform
```

### Step 3: Install Dependencies

```bash
npm install
```

**Expected output:** All packages installed successfully without errors.

### Step 4: Verify Environment Variables

The `.env` file is already created with working defaults. Verify it exists:

```bash
cat .env
```

You should see:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="exam-platform-secret-key-minimum-32-characters-long-for-security"
...
```

### Step 5: Initialize Database

```bash
npm run prisma:push
```

**Expected output:**
```
✓ Generated Prisma Client
✓ Your database is now in sync with your schema.
```

### Step 6: Seed Database with Demo Data

```bash
npm run prisma:seed
```

**Expected output:**
```
✅ Admin user created: admin@example.com
✅ Lecturer user created: lecturer@example.com
✅ Student user created: student@example.com
🎉 Seeding completed successfully!
```

### Step 7: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.15
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in XXXms
```

### Step 8: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the login page with **ZERO ERRORS** in the console.

## Demo Login Credentials

### Admin Dashboard
- **Email:** admin@example.com
- **Password:** Admin@123456
- **Access:** Full system management

### Lecturer Dashboard
- **Email:** lecturer@example.com
- **Password:** Lecturer@123
- **Access:** Create/manage exams, view results

### Student Dashboard
- **Email:** student@example.com
- **Password:** Student@123
- **Access:** Take exams, view results

## Verifying Everything Works

### Test 1: Login as Admin
1. Go to http://localhost:3000
2. Login with admin credentials
3. You should see the Admin Dashboard with 3 users

### Test 2: Login as Lecturer
1. Logout from admin
2. Login with lecturer credentials
3. You should see the Lecturer Dashboard
4. Click "Create New Exam" to test exam creation

### Test 3: Login as Student
1. Logout from lecturer
2. Login with student credentials
3. You should see the Student Dashboard
4. Click "Take an Exam" to test exam access

## Troubleshooting

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Database locked error

**Solution:**
```bash
# Close Prisma Studio if it's open
# Then restart the dev server
npm run dev
```

### Issue: Module not found errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma Client errors

**Solution:**
```bash
# Regenerate Prisma Client
npm run prisma:generate
npm run dev
```

### Issue: Build errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset and reseed database
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

## Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 to view and edit data.

### Reset Database

```bash
# Remove existing database
rm prisma/dev.db
rm prisma/dev.db-journal

# Recreate and seed
npm run prisma:push
npm run prisma:seed
```

### Backup Database

```bash
# SQLite database is in prisma/dev.db
cp prisma/dev.db prisma/dev.db.backup
```

## Next Steps After Setup

1. **Create a Test Exam as Lecturer**
   - Login as lecturer@example.com
   - Go to "Create New Exam"
   - Fill in exam details
   - Add questions
   - Publish the exam
   - Note the exam code

2. **Take the Exam as Student**
   - Login as student@example.com
   - Go to "Take an Exam"
   - Enter the exam code
   - Take the exam
   - Test security features (try copying text, switching tabs)

3. **Monitor as Admin**
   - Login as admin@example.com
   - View all users
   - Check audit logs
   - Monitor violations

## Production Deployment to Vercel

See the main README.md for detailed Vercel deployment instructions.

Quick steps:
1. Push code to GitHub
2. Import project in Vercel
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## Support

If you encounter any issues:
1. Check this guide first
2. Review the main README.md
3. Check the console for error messages
4. Verify all dependencies are installed
5. Ensure database is properly initialized

## Success Checklist

- [✓] Node.js 18+ installed
- [✓] Dependencies installed without errors
- [✓] Database created and seeded
- [✓] Dev server running on port 3000
- [✓] Can login as admin/lecturer/student
- [✓] No console errors
- [✓] All three dashboards accessible

If all items are checked, your setup is complete and working perfectly!

---

**Congratulations! Your Secure Exam Platform is ready to use! 🎉**
