// app/admin/users/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import UsersTable from './UsersTable';
import { addUser, editUser, deleteUser } from './actions';
import prisma from '@/lib/prisma';
import sql from 'mssql';

// Helper function to check if email is from demo domain
function isDemoAccount(email: string): boolean {
  const demoDomains = ['@example.com', '@demo.com', '@test.com'];
  return demoDomains.some(domain => email.endsWith(domain));
}

// Function to fetch real accounts from MSSQL database
async function getRealAccountsFromMSSQL() {
  try {
    const config = {
      user: process.env.MSSQL_USER || 'sa',
      password: process.env.MSSQL_PASSWORD!,
      server: process.env.MSSQL_SERVER || 'localhost',
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      database: process.env.MSSQL_DATABASE || 'exam_system',
      options: { 
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
    };
    
    const pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT id, name, email, role, status, createdAt 
      FROM dbo.users 
      WHERE email NOT LIKE '%@example.com' 
        AND email NOT LIKE '%@demo.com' 
        AND email NOT LIKE '%@test.com'
      ORDER BY createdAt DESC
    `);
    
    await sql.close();
    
    return result.recordset.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
    }));
  } catch (error) {
    console.error('MSSQL error fetching real accounts:', error);
    return [];
  }
}

// Function to fetch demo accounts from Prisma
async function getDemoAccountsFromPrisma() {
  try {
    const demoUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { endsWith: '@example.com' } },
          { email: { endsWith: '@demo.com' } },
          { email: { endsWith: '@test.com' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return demoUsers;
  } catch (error) {
    console.error('Prisma error fetching demo users:', error);
    return [
      { id: 1, name: 'System Administrator', email: 'admin@example.com', role: 'ADMIN', status: 'Active', createdAt: new Date('2024-01-01') },
      { id: 2, name: 'Dr. John Smith', email: 'lecturer@example.com', role: 'LECTURER', status: 'Active', createdAt: new Date('2024-01-02') },
      { id: 3, name: 'Jane Doe', email: 'student@example.com', role: 'STUDENT', status: 'Active', createdAt: new Date('2024-01-03') },
    ];
  }
}

// Combined function to get users from appropriate data sources
async function getUsers(isDemoAdmin: boolean) {
  try {
    if (isDemoAdmin) {
      // Demo admin - only fetch demo accounts from Prisma
      const demoAccounts = await getDemoAccountsFromPrisma();
      return {
        realAccounts: [],
        demoAccounts,
        allUsers: demoAccounts,
        stats: {
          totalReal: 0,
          totalDemo: demoAccounts.length,
          total: demoAccounts.length,
        },
      };
    } else {
      // Real admin - fetch both real accounts from MSSQL and demo accounts from Prisma
      const [realAccounts, demoAccounts] = await Promise.all([
        getRealAccountsFromMSSQL(),
        getDemoAccountsFromPrisma(),
      ]);
      return {
        realAccounts,
        demoAccounts,
        allUsers: [...realAccounts, ...demoAccounts],
        stats: {
          totalReal: realAccounts.length,
          totalDemo: demoAccounts.length,
          total: realAccounts.length + demoAccounts.length,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    if (isDemoAdmin) {
      return {
        realAccounts: [],
        demoAccounts: [
          { id: 1, name: 'System Administrator', email: 'admin@example.com', role: 'ADMIN', status: 'Active', createdAt: new Date('2024-01-01') },
          { id: 2, name: 'Dr. John Smith', email: 'lecturer@example.com', role: 'LECTURER', status: 'Active', createdAt: new Date('2024-01-02') },
          { id: 3, name: 'Jane Doe', email: 'student@example.com', role: 'STUDENT', status: 'Active', createdAt: new Date('2024-01-03') },
        ],
        allUsers: [
          { id: 1, name: 'System Administrator', email: 'admin@example.com', role: 'ADMIN', status: 'Active', createdAt: new Date('2024-01-01') },
          { id: 2, name: 'Dr. John Smith', email: 'lecturer@example.com', role: 'LECTURER', status: 'Active', createdAt: new Date('2024-01-02') },
          { id: 3, name: 'Jane Doe', email: 'student@example.com', role: 'STUDENT', status: 'Active', createdAt: new Date('2024-01-03') },
        ],
        stats: {
          totalReal: 0,
          totalDemo: 3,
          total: 3,
        },
      };
    } else {
      return {
        realAccounts: [],
        demoAccounts: [],
        allUsers: [],
        stats: {
          totalReal: 0,
          totalDemo: 0,
          total: 0,
        },
      };
    }
  }
}

// Real-time streaming endpoint for live updates
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const isDemoAdmin = session.user.email && isDemoAccount(session.user.email);

  const stream = new ReadableStream({
    async start(controller) {
      const initialData = await getUsers(isDemoAdmin);
      controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

      const intervalId = setInterval(async () => {
        try {
          const updatedData = await getUsers(isDemoAdmin);
          controller.enqueue(`data: ${JSON.stringify(updatedData)}\n\n`);
        } catch (error) {
          console.error('Error fetching updates:', error);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login');

  const isDemoAdmin = session.user.email && isDemoAccount(session.user.email);
  
  const { realAccounts, demoAccounts, stats } = await getUsers(isDemoAdmin);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tighter">User Management</h1>
                  <span className={`px-4 py-1.5 text-xs font-mono border rounded-full animate-pulse ${
                    isDemoAdmin 
                      ? 'bg-purple-500 text-white border-purple-400' 
                      : 'bg-emerald-500 text-white border-emerald-400'
                  }`}>
                    {isDemoAdmin ? '● DEMO MODE' : '● LIVE'}
                  </span>
                </div>
                <p className="text-zinc-500 mt-1">
                  {isDemoAdmin ? 'Demo Account View (Prisma)' : 'Real Account View (MSSQL + Prisma)'} • Real-time updates
                </p>
              </div>
              <div className="flex gap-3">
                {!isDemoAdmin && (
                  <div className="px-5 py-2 bg-blue-100 text-blue-700 rounded-2xl text-sm font-medium">
                    Real Accounts: {stats.totalReal}
                  </div>
                )}
                <div className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium">
                  Demo Accounts: {stats.totalDemo}
                </div>
                <div className="px-5 py-2 bg-purple-100 text-purple-700 rounded-2xl text-sm font-medium">
                  Total Users: {stats.total}
                </div>
              </div>
            </div>

            {/* Real Accounts Section - Only visible to real admins */}
            {!isDemoAdmin && realAccounts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-semibold">Real Accounts</h2>
                  <span className="text-sm text-zinc-500">(MSSQL Database)</span>
                </div>
                <UsersTable 
                  users={realAccounts} 
                  addUserAction={addUser} 
                  editUserAction={editUser} 
                  deleteUserAction={deleteUser}
                  type="real"
                  isDemoAdmin={isDemoAdmin}
                />
              </div>
            )}

            {/* Demo Accounts Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold">Demo Accounts</h2>
                <span className="text-sm text-zinc-500">(Prisma Database)</span>
              </div>
              <UsersTable 
                users={demoAccounts} 
                addUserAction={addUser} 
                editUserAction={editUser} 
                deleteUserAction={deleteUser}
                type="demo"
                isDemoAdmin={isDemoAdmin}
              />
            </div>

            {/* Data Source Indicator */}
            <div className="mt-8 text-center text-xs text-zinc-400 border-t border-zinc-200 pt-6">
              <div className="flex justify-center gap-6 flex-wrap">
                {!isDemoAdmin && (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Real Accounts: MSSQL Database
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Demo Accounts: Prisma Database
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isDemoAdmin ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                  Current View: {isDemoAdmin ? 'Demo Mode' : 'Live Mode'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}