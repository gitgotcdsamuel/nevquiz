// app/auth/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User,
  ShieldCheck,
  GraduationCap,
  Users,
  ChevronRight,
  Building,
  Briefcase,
  UserCircle,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    studentId: '',
    employeeId: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Show success message
      setIsSuccess(true);
      setError(''); // Clear any errors

      // Wait for 2 seconds to show the success message, then redirect
      setTimeout(() => {
        router.push('/auth/login?registered=true');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full opacity-30 blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">Secure<span className="text-emerald-600">Quiz</span></h1>
                      <p className="text-slate-600 text-sm">Secure Academic Platform</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mt-4">Create Your Account</h2>
                  <p className="text-slate-600">Join our secure examination platform</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl">
                  <UserCircle className="h-6 w-6 text-white" />
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-center">{error}</p>
                </div>
              )}

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  <p className="text-emerald-700 text-center font-medium">
                    ✓ Account created successfully! Redirecting to sign in...
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="you@mail.edu"
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    I am a
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'STUDENT', label: 'Student', icon: Users, color: 'from-slate-600 to-slate-800' },
                      { value: 'LECTURER', label: 'Lecturer', icon: GraduationCap, color: 'from-blue-500 to-blue-700' },
                      { value: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: 'from-emerald-500 to-emerald-700' },
                    ].map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value })}
                          className={`p-4 rounded-xl border transition-all flex flex-col items-center ${formData.role === role.value
                              ? `bg-gradient-to-br ${role.color} text-white border-transparent shadow-lg`
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                        >
                          <Icon className="h-5 w-5 mb-2" />
                          <span className="text-sm font-medium">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role-specific fields */}
                {formData.role === 'STUDENT' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      placeholder="e.g., 20230001"
                      required={formData.role === 'STUDENT'}
                    />
                  </div>
                )}

                {formData.role === 'LECTURER' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      placeholder="e.g., EMP001"
                      required={formData.role === 'LECTURER'}
                    />
                  </div>
                )}

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 8 characters with letters and numbers
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-1">
                    <input type="checkbox" className="sr-only peer" required />
                    <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded flex items-center justify-center peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-slate-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Redirecting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-700">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}