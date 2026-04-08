import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['STUDENT', 'LECTURER']),
  studentId: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
});

// Exam validations
export const examSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 8 hours'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks must be at least 0'),
  startTime: z.string(),
  endTime: z.string(),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  showResults: z.boolean().default(false),
  preventCopyPaste: z.boolean().default(true),
  preventTabSwitch: z.boolean().default(true),
  preventScreenshot: z.boolean().default(true),
  maxViolations: z.number().min(1).max(10).default(3),
});

// Question validations
export const questionSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters'),
  questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
  marks: z.number().min(1, 'Marks must be at least 1'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
});

// Exam access validation
export const examAccessSchema = z.object({
  code: z.string().length(8, 'Exam code must be 8 characters'),
});

// Answer submission validation
export const answerSchema = z.object({
  questionId: z.string(),
  answerText: z.string(),
});

export const submitExamSchema = z.object({
  attemptId: z.string(),
  answers: z.array(answerSchema),
});

// User management validations
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Violation reporting
export const violationSchema = z.object({
  examId: z.string(),
  violationType: z.enum([
    'TAB_SWITCH',
    'COPY_PASTE',
    'SCREENSHOT_ATTEMPT',
    'MULTIPLE_TABS',
    'BROWSER_EXIT',
    'SUSPICIOUS_ACTIVITY',
  ]),
  description: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});
