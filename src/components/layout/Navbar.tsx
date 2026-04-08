'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const getDashboardLink = () => {
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin';
      case 'LECTURER':
        return '/lecturer';
      case 'STUDENT':
        return '/student';
      default:
        return '/';
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={getDashboardLink()} className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Exam Platform
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold">
                {getInitials(session.user.name)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {session.user.role}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
