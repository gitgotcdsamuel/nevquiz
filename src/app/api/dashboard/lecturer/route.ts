import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lecturer profile
    const profile = await prisma.lecturerProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Get exams
    const exams = await prisma.exam.findMany({
      where: { lecturerId: session.user.id },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalExams = exams.length;
    const activeExams = exams.filter((e) => e.isActive && e.isPublished).length;
    const totalAttempts = exams.reduce(
      (sum, exam) => sum + exam._count.attempts,
      0
    );

    // Get recent attempts
    const recentAttempts = await prisma.examAttempt.findMany({
      where: {
        exam: {
          lecturerId: session.user.id,
        },
      },
      include: {
        exam: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(
      {
        profile,
        stats: {
          totalExams,
          activeExams,
          totalAttempts,
        },
        exams,
        recentAttempts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lecturer dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
