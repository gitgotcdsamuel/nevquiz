# Secure Online Examination Platform

A comprehensive, production-ready Next.js 14 application for secure online examinations with role-based access control, advanced security features, and institutional-scale database support.

## Features

### Core Functionality
- **Multi-Role System**: Student, Lecturer, and Admin dashboards
- **Secure Exam Taking**: Code-based exam access with built-in proctoring
- **Exam Management**: Complete CRUD operations for exams and questions
- **Real-time Security**: Copy-paste blocking, tab switching detection, screenshot prevention
- **Analytics Dashboard**: Comprehensive reports and statistics
- **Audit Logging**: Complete activity tracking for compliance

### Security Features
- **Exam Proctoring**: Violation detection and automatic termination
- **Authentication**: NextAuth.js with secure session management
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Zod schema validation for all endpoints
- **RBAC**: Role-based access control with middleware
- **Security Headers**: Comprehensive HTTP security headers

### Technical Highlights
- **Next.js 14**: App Router with Server Components
- **TypeScript**: Strict mode for type safety
- **Prisma ORM**: SQLite (dev) / PostgreSQL (prod)
- **Tailwind CSS**: Responsive, modern UI
- **Scalable**: Supports 500K+ students, 500K+ lecturers, 7M+ exams

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git

### Installation

1. **Clone or extract the project**
   ```bash
   cd exam-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # The .env file is already created with default values
   # Modify if needed, especially NEXTAUTH_SECRET for production
   ```

4. **Initialize the database**
   ```bash
   npm run prisma:push
   ```

5. **Seed the database with sample data**
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## Demo Credentials

### Admin Access
- Email: `admin@example.com`
- Password: `Admin@123456`

### Lecturer Access
- Email: `lecturer@example.com`
- Password: `Lecturer@123`

### Student Access
- Email: `student@example.com`
- Password: `Student@123`

## Project Structure

```
exam-platform/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── lecturer/      # Lecturer dashboard
│   │   ├── student/       # Student dashboard
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   ├── exam/          # Exam-specific components
│   │   └── providers/     # Context providers
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── utils.ts       # Utility functions
│   │   ├── validations.ts # Zod schemas
│   │   └── rate-limit.ts  # Rate limiting
│   ├── types/             # TypeScript definitions
│   └── middleware.ts      # Route middleware
├── .env                   # Environment variables
├── .env.example          # Environment template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Database Schema

The application uses a comprehensive database schema with:
- **Users**: Multi-role support (Student, Lecturer, Admin)
- **Exams**: Full exam lifecycle management
- **Questions**: Multiple question types (MCQ, True/False, Short Answer, Essay)
- **Exam Attempts**: Student submission tracking
- **Violations**: Security violation logging
- **Audit Logs**: Complete activity tracking

### Switching from SQLite to PostgreSQL

For production deployment on Vercel:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env` with PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. Run migrations:
   ```bash
   npm run prisma:push
   ```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Exams
- `GET /api/exams` - List exams (Lecturer)
- `POST /api/exams` - Create exam (Lecturer)
- `GET /api/exams/[examId]` - Get exam details
- `PUT /api/exams/[examId]` - Update exam (Lecturer)
- `DELETE /api/exams/[examId]` - Delete exam (Lecturer)
- `POST /api/exams/access` - Access exam with code (Student)
- `POST /api/exams/[examId]/start` - Start exam attempt (Student)
- `POST /api/exams/[examId]/submit` - Submit exam (Student)

### Questions
- `POST /api/questions` - Create question (Lecturer)

### Violations
- `POST /api/violations` - Report violation (Student)

### Dashboard
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/lecturer` - Lecturer dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

## Deployment to Vercel

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create a new project on Vercel**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure environment variables**
   In Vercel dashboard, add:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   NEXTAUTH_URL=<your-vercel-app-url>
   NEXTAUTH_SECRET=<generate-a-secure-secret>
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Database migrations run automatically via `vercel-build` script

## Security Considerations

### Exam Protection
- **Copy/Paste Prevention**: JavaScript-based blocking
- **Tab Switch Detection**: Visibility API monitoring
- **Screenshot Prevention**: Keyboard shortcut blocking
- **Violation Tracking**: Automatic termination after max violations
- **Time Tracking**: Server-side validation

### Authentication Security
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Secure JWT tokens
- **Rate Limiting**: 60 requests per minute per IP
- **CSRF Protection**: Built-in NextAuth protection

### API Security
- **Input Validation**: Zod schema validation
- **Authorization**: Middleware-based RBAC
- **Audit Logging**: Complete activity tracking
- **Error Handling**: Secure error messages

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Adding New Features

1. **Database Changes**:
   - Update `prisma/schema.prisma`
   - Run `npm run prisma:push`
   - Update seed file if needed

2. **API Routes**:
   - Create in `src/app/api/`
   - Add validation schemas in `src/lib/validations.ts`
   - Implement authorization checks

3. **UI Components**:
   - Create in `src/components/`
   - Follow existing patterns
   - Use Tailwind for styling

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Or use a different port
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Performance Optimization

### Database
- Indexed fields for fast queries
- Efficient relationships
- Query optimization with Prisma

### Frontend
- Server Components for reduced JS
- Image optimization
- Code splitting
- CSS optimization with Tailwind

### API
- Rate limiting
- Caching strategies
- Efficient queries

## Support & Contribution

For issues, questions, or contributions, please refer to the project repository.

## License

This project is private and proprietary. Unauthorized copying or distribution is prohibited.

---

**Built with ❤️ using Next.js 14, TypeScript, Prisma, and Tailwind CSS**
