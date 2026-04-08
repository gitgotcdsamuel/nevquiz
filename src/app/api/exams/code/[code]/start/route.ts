import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { shuffleArray, isExamActive } from '@/lib/utils';
import { getClientIp } from '@/lib/rate-limit';

// POST - Start exam attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (!exam.isActive || !exam.isPublished) {
      return NextResponse.json(
        { error: 'This exam is not available' },
        { status: 400 }
      );
    }

    if (!isExamActive(exam.startTime, exam.endTime)) {
      return NextResponse.json(
        { error: 'Exam is not currently active' },
        { status: 400 }
      );
    }

    // Check if student has already attempted
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
        // Return existing attempt
        const questions = exam.shuffleQuestions
          ? shuffleArray(exam.questions)
          : exam.questions;

        const questionsWithShuffledOptions = questions.map((q) => {
          const options = JSON.parse(q.options);
          return {
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            marks: q.marks,
            order: q.order,
            options: exam.shuffleOptions && Array.isArray(options)
              ? shuffleArray(options)
              : options,
          };
        });

        return NextResponse.json(
          {
            message: 'Resuming existing attempt',
            attemptId: existingAttempt.id,
            questions: questionsWithShuffledOptions,
            exam: {
              id: exam.id,
              title: exam.title,
              duration: exam.duration,
              totalMarks: exam.totalMarks,
              preventCopyPaste: exam.preventCopyPaste,
              preventTabSwitch: exam.preventTabSwitch,
              preventScreenshot: exam.preventScreenshot,
              maxViolations: exam.maxViolations,
            },
            startedAt: existingAttempt.startedAt,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'You have already completed this exam' },
          { status: 400 }
        );
      }
    }

    // Create new attempt
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: session.user.id,
        totalMarks: exam.totalMarks,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    // Prepare questions
    const questions = exam.shuffleQuestions
      ? shuffleArray(exam.questions)
      : exam.questions;

    const questionsWithShuffledOptions = questions.map((q) => {
      const options = JSON.parse(q.options);
      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        order: q.order,
        options: exam.shuffleOptions && Array.isArray(options)
          ? shuffleArray(options)
          : options,
      };
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'START',
        entity: 'EXAM_ATTEMPT',
        entityId: attempt.id,
        details: JSON.stringify({ examId: exam.id, examTitle: exam.title }),
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    return NextResponse.json(
      {
        message: 'Exam started successfully',
        attemptId: attempt.id,
        questions: questionsWithShuffledOptions,
        exam: {
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          preventCopyPaste: exam.preventCopyPaste,
          preventTabSwitch: exam.preventTabSwitch,
          preventScreenshot: exam.preventScreenshot,
          maxViolations: exam.maxViolations,
        },
        startedAt: attempt.startedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Start exam error:', error);
    return NextResponse.json(
      { error: 'Failed to start exam' },
      { status: 500 }
    );
  }
}
