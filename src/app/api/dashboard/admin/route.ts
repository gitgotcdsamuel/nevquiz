import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts
    const [totalUsers, totalStudents, totalLecturers, totalExams, totalAttempts] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'LECTURER' } }),
        prisma.exam.count(),
        prisma.examAttempt.count(),
      ]);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Get recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get violation stats
    const violationStats = await prisma.examViolation.groupBy({
      by: ['violationType'],
      _count: {
        id: true,
      },
    });

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          totalStudents,
          totalLecturers,
          totalExams,
          totalAttempts,
        },
        recentUsers,
        recentLogs,
        violationStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
