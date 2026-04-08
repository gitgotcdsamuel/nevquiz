import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { examAccessSchema } from '@/lib/validations';
import { isExamActive } from '@/lib/utils';

// POST - Access exam with code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = examAccessSchema.parse(body);

    // Find exam by code
    const exam = await prisma.exam.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        lecturer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Invalid exam code' },
        { status: 404 }
      );
    }

    if (!exam.isActive || !exam.isPublished) {
      return NextResponse.json(
        { error: 'This exam is not available' },
        { status: 400 }
      );
    }

    // Check if exam is active (within time range)
    if (!isExamActive(exam.startTime, exam.endTime)) {
      const now = new Date();
      if (now < exam.startTime) {
        return NextResponse.json(
          { error: 'Exam has not started yet', startTime: exam.startTime },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Exam has ended' },
          { status: 400 }
        );
      }
    }

    // Check if student has already attempted the exam
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: exam.id,
          studentId: session.user.id,
        },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'IN_PROGRESS') {
        return NextResponse.json(
          {
            message: 'You have an ongoing attempt',
            exam,
            attemptId: existingAttempt.id,
            status: 'IN_PROGRESS',
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'You have already attempted this exam' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: 'Exam found',
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          startTime: exam.startTime,
          endTime: exam.endTime,
          lecturerName: exam.lecturer.name,
          preventCopyPaste: exam.preventCopyPaste,
          preventTabSwitch: exam.preventTabSwitch,
          preventScreenshot: exam.preventScreenshot,
          maxViolations: exam.maxViolations,
        },
        canStart: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Exam access error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid exam code format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to access exam' },
      { status: 500 }
    );
  }
}
