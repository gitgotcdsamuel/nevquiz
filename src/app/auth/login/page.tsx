// app/auth/login/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  GraduationCap,
  ShieldCheck,
  Users,
  Award,
  ChevronRight,
  Building,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoCredentials = {
    admin: { 
      email: 'admin@example.com', 
      password: 'Admin@123456', 
      role: 'Administrator',
      redirect: '/admin',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-emerald-700'
    },
    lecturer: { 
      email: 'lecturer@example.com', 
      password: 'Lecturer@123', 
      role: 'Lecturer',
      redirect: '/lecturer',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-700'
    },
    student: { 
      email: 'student@example.com', 
      password: 'Student@123', 
      role: 'Student',
      redirect: '/student',
      icon: Users,
      color: 'from-slate-600 to-slate-800'
    },
  };

  const handleDemoLogin = async (type: keyof typeof demoCredentials) => {
    setActiveDemo(type);
    setFormData({
      email: demoCredentials[type].email,
      password: demoCredentials[type].password,
    });
    
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: demoCredentials[type].email,
      password: demoCredentials[type].password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid demo credentials. Please try again.');
      setIsLoading(false);
    } else {
      router.push(demoCredentials[type].redirect);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* Animated Background Elements */}
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
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-slate-100 to-emerald-100 rounded-full opacity-20 blur-3xl"
        />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200"
            style={{
              left: `${10 + (i * 10)}%`,
              top: `${20 + (i * 8)}%`,
            }}
          >
            <BookOpen className="h-6 w-6 text-slate-700" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl flex flex-col lg:flex-row gap-8"
        >
          {/* Left Side - Brand & Description */}
          <div className="lg:w-1/2 flex flex-col justify-center p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-3 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl shadow-xl"
                >
                  <BookOpen className="h-10 w-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-800">Secure<span className="text-emerald-600">Quiz</span></h1>
                  <p className="text-slate-600 text-sm font-medium">Secure Digital Examinations</p>
                </div>
              </div>
              
            </motion.div>

          </div>

          {/* Right Side - Login Card */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Card Header */}
              <div className="p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Sign In</h3>
                    <p className="text-slate-600">Access your dashboard</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg"
                  >
                    <Lock className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-red-700 text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        placeholder="you@mail.edu"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </motion.div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </label>
                    <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded flex items-center justify-center peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors">
                          <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm text-slate-700">Remember me</span>
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="px-4 text-sm text-slate-500 font-medium">Quick Access</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Demo Accounts */}
                <div className="space-y-3">
                  {(Object.entries(demoCredentials) as [keyof typeof demoCredentials, typeof demoCredentials[keyof typeof demoCredentials]][]).map(([type, cred]) => {
                    const Icon = cred.icon;
                    return (
                      <motion.button
                        key={type}
                        onClick={() => handleDemoLogin(type)}
                        disabled={isLoading}
                        whileHover={{ x: 5 }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                          activeDemo === type
                            ? `bg-gradient-to-r ${cred.color}/10 border-${cred.color.split('-')[1]}-300`
                            : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${cred.color} rounded-lg`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-slate-800 font-medium">{cred.role} Account</p>
                            <p className="text-sm text-slate-600">
                              {type === 'admin' && 'Full system administration'}
                              {type === 'lecturer' && 'Create and manage exams'}
                              {type === 'student' && 'Take exams and track progress'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-slate-700">{cred.email}</p>
                          <p className="text-xs text-slate-500">Click to sign in</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Register Link */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-center text-slate-700">
                    New to SecureQuiz?{' '}
                    <Link
                      href="/auth/register"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="lg:w-1/2 flex flex-col justify-center p-8"
      >
        <p className="text-sm text-slate-500">
          ©️ {new Date().getFullYear()} Secure Quiz. All rights reserved. {' '}
        </p>
      </motion.div>
    </div>
  );
}