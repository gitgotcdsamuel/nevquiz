import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get lecturer from session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lecturer
    const lecturer = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { lecturerProfile: true }
    });

    if (!lecturer?.lecturerProfile) {
      return NextResponse.json({ error: 'Lecturer not found' }, { status: 404 });
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '6months';
    const searchQuery = searchParams.get('search') || '';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get lecturer's exams
    const exams = await prisma.exam.findMany({
      where: {
        lecturerId: lecturer.id,
        startTime: { gte: startDate },
        status: 'COMPLETED'
      },
      include: {
        attempts: {
          include: {
            answers: true
          }
        }
      }
    });

    // Get all attempts for these exams
    const attempts = exams.flatMap(exam => exam.attempts);

    // Calculate statistics
    const totalStudents = await prisma.studentProfile.count({
      where: {
        department: lecturer.lecturerProfile?.department
      }
    });

    const avgScore = attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length
      : 0;

    const passedAttempts = attempts.filter(attempt => (attempt.percentage || 0) >= 60).length;
    const passRate = attempts.length > 0 ? (passedAttempts / attempts.length) * 100 : 0;

    // Calculate score distribution
    const scoreRanges = [
      { range: '90-100', min: 90, max: 100 },
      { range: '80-89', min: 80, max: 89 },
      { range: '70-79', min: 70, max: 79 },
      { range: '60-69', min: 60, max: 69 },
      { range: 'Below 60', min: 0, max: 59 },
    ];

    const scoreDistribution = scoreRanges.map(range => {
      const count = attempts.filter(attempt => {
        const score = attempt.percentage || 0;
        return score >= range.min && score <= range.max;
      }).length;
      
      return {
        range: range.range,
        students: count,
        percentage: attempts.length > 0 ? (count / attempts.length) * 100 : 0
      };
    });

    // Get performance over time (monthly)
    const performanceOverTime = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const month = currentDate.toLocaleString('default', { month: 'short' });
      const year = currentDate.getFullYear();
      
      const monthAttempts = attempts.filter(attempt => {
        const attemptDate = new Date(attempt.startedAt);
        return attemptDate.getMonth() === currentDate.getMonth() &&
               attemptDate.getFullYear() === currentDate.getFullYear();
      });

      const monthAvgScore = monthAttempts.length > 0
        ? monthAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / monthAttempts.length
        : 0;

      performanceOverTime.push({
        month: month,
        avgScore: parseFloat(monthAvgScore.toFixed(2)),
        students: monthAttempts.length,
        exams: exams.filter(exam => {
          const examDate = new Date(exam.startTime);
          return examDate.getMonth() === currentDate.getMonth() &&
                 examDate.getFullYear() === currentDate.getFullYear();
        }).length
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Get top performing students
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        department: lecturer.lecturerProfile?.department
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    const studentPerformance = await Promise.all(
      studentProfiles.map(async (profile) => {
        const studentAttempts = await prisma.examAttempt.findMany({
          where: {
            studentId: profile.userId,
            exam: {
              lecturerId: lecturer.id
            }
          }
        });

        const avgScore = studentAttempts.length > 0
          ? studentAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / studentAttempts.length
          : 0;

        const lastAttempt = studentAttempts.sort((a, b) => 
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )[0];

        return {
          id: profile.id,
          name: profile.user.name,
          avgScore: parseFloat(avgScore.toFixed(2)),
          examsTaken: studentAttempts.length,
          lastExam: lastAttempt?.exam?.title || 'No exams',
          lastScore: lastAttempt?.percentage || 0
        };
      })
    );

    // Filter by search query
    const filteredStudents = searchQuery
      ? studentPerformance.filter(student =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : studentPerformance;

    // Sort by average score
    const topStudents = filteredStudents
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalStudents,
        avgScore: parseFloat(avgScore.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        examsConducted: exams.length,
        totalAttempts: attempts.length
      },
      performanceOverTime,
      scoreDistribution,
      topStudents,
      timeRange
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}