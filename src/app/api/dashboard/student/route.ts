import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Get exam attempts
    const attempts = await prisma.examAttempt.findMany({
      where: { studentId: session.user.id },
      include: {
        exam: {
          select: {
            title: true,
            totalMarks: true,
            lecturer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate stats
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(
      (a) => a.status === 'SUBMITTED'
    ).length;
    const averageScore = profile?.averageScore || 0;

    // Get recent violations
    const violations = await prisma.examViolation.findMany({
      where: { studentId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    return NextResponse.json(
      {
        profile,
        stats: {
          totalAttempts,
          completedAttempts,
          averageScore,
        },
        recentAttempts: attempts,
        recentViolations: violations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
