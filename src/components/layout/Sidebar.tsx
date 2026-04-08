// components/layout/Sidebar.tsx - FIXED
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Settings,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  Bell,
  Clock,
  Award,
  HelpCircle,
  MessageSquare,
  Database,
  BookMarked,
  CheckSquare,
  AlertCircle,
  LogOut,
  User // Add this as a fallback
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  if (!session) return null;

  // SAFETY CHECK: Make sure role exists and is valid
  const role = session.user?.role as 'ADMIN' | 'LECTURER' | 'STUDENT';
  
  // If role is undefined or not valid, use ADMIN as default
  const validRoles = ['ADMIN', 'LECTURER', 'STUDENT'];
  const safeRole = validRoles.includes(role) ? role : 'ADMIN';
  
  const userName = session.user?.name || 'User';
  const userEmail = session.user?.email || 'user@example.com';
  
  // Define navigation items for each role
  const roleNavItems = {
    ADMIN: [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/exams', label: 'Exams', icon: FileText },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
    LECTURER: [
      { href: '/lecturer', label: 'Dashboard', icon: Home },
      { href: '/lecturer/exams', label: 'My Exams', icon: FileText },
      { href: '/lecturer/results', label: 'Results', icon: ClipboardList },
      { href: '/lecturer/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    STUDENT: [
      { href: '/student', label: 'Dashboard', icon: Home },
      { href: '/student/exams', label: 'Available Exams', icon: FileText },
      { href: '/student/results', label: 'Results', icon: Award },
    ],
  };

  // Role-specific configuration with FALLBACK
  const roleConfig = {
    ADMIN: {
      title: 'Admin Panel',
      subtitle: 'System Management',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
      badgeColor: 'bg-purple-600',
    },
    LECTURER: {
      title: 'Lecturer Panel',
      subtitle: 'Teaching Dashboard',
      icon: GraduationCap,
      color: 'bg-blue-100 text-blue-600',
      badgeColor: 'bg-blue-600',
    },
    STUDENT: {
      title: 'Student Panel',
      subtitle: 'Learning Dashboard',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      badgeColor: 'bg-green-600',
    },
  };

  // FIXED LINE 89: Use safeRole instead of role, and provide a fallback
  const config = roleConfig[safeRole] || roleConfig.ADMIN;
  const Icon = config.icon || User; // Use User icon as fallback
  const navItems = roleNavItems[safeRole] || roleNavItems.ADMIN;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center">
          <div className={`h-12 w-12 ${config.color} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{userName}</h2>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
            <div className="mt-1">
              <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${config.badgeColor}`}>
                {safeRole}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-3 px-4">
            Navigation
          </h3>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== `/${safeRole.toLowerCase()}` && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* System Status (Admin only) */}
        {safeRole === 'ADMIN' && (
          <div className="mt-8 px-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Database className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">System Status</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-xs text-gray-600">Operational</span>
                </div>
                <span className="text-xs text-gray-500">v2.1.0</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer/Links Section */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2">
          <a href="/help" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="font-medium">Help & Support</span>
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}