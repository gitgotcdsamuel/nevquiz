import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Redirect to appropriate dashboard based on role
  switch (session.user.role) {
    case 'ADMIN':
      redirect('/admin');
    case 'LECTURER':
      redirect('/lecturer');
    case 'STUDENT':
      redirect('/student');
    default:
      redirect('/auth/login');
  }
}
