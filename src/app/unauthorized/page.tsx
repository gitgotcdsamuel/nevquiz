'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Shield } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-danger-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page
          </p>
        </div>

        <Alert variant="danger" className="mb-6">
          Your user role does not have the required permissions to view this
          content. Please contact your administrator if you believe this is an
          error.
        </Alert>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
