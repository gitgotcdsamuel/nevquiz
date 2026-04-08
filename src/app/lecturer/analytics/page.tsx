// src/app/lecturer/analytics/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-bold tracking-tighter">Analytics Dashboard</h1>
                <p className="text-zinc-500 mt-2">Real-time insights into student performance and exam trends</p>
              </div>
              <div className="text-sm text-emerald-600 font-medium">Live Data • Last updated just now</div>
            </div>

            {/* Client Component for all interactivity */}
            <AnalyticsClient />
          </div>
        </main>
      </div>
    </div>
  );
}