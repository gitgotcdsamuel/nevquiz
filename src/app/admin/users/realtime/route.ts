// app/api/admin/users/realtime/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  // Helper function to check if email is from demo domain
  const isDemoAccount = (email: string) => {
    const demoDomains = ['@example.com', '@demo.com', '@test.com'];
    return demoDomains.some(domain => email.endsWith(domain));
  };

  // Function to fetch all users with categorization
  const getUsers = async () => {
    const allUsers = await prisma.user.findMany({
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

    const realAccounts = allUsers.filter(user => !isDemoAccount(user.email));
    const demoAccounts = allUsers.filter(user => isDemoAccount(user.email));

    return {
      realAccounts,
      demoAccounts,
      stats: {
        totalReal: realAccounts.length,
        totalDemo: demoAccounts.length,
        total: allUsers.length,
      },
    };
  };

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const initialData = await getUsers();
      controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

      // Poll for updates every 3 seconds
      const intervalId = setInterval(async () => {
        try {
          const updatedData = await getUsers();
          controller.enqueue(`data: ${JSON.stringify(updatedData)}\n\n`);
        } catch (error) {
          console.error('Error fetching updates:', error);
        }
      }, 3000);

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