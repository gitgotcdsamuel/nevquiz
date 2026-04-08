import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePercentage } from '@/lib/utils';

// POST - Submit exam attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const { attemptId, answers, timeSpent } = body;

    // Verify attempt belongs to student
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    if (attempt.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'This attempt has already been submitted' },
        { status: 400 }
      );
    }

    // Calculate score
    let totalScore = 0;
    const answerRecords = [];

    for (const answer of answers) {
      const question = attempt.exam.questions.find(
        (q) => q.id === answer.questionId
      );

      if (!question) continue;

      let isCorrect = false;
      let marksAwarded = 0;

      if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
        const correctAnswer = JSON.parse(question.correctAnswer);
        if (Array.isArray(correctAnswer)) {
          isCorrect = correctAnswer.includes(answer.answerText);
        } else {
          isCorrect = correctAnswer === answer.answerText;
        }

        if (isCorrect) {
          marksAwarded = question.marks;
          totalScore += marksAwarded;
        }
      } else {
        marksAwarded = 0;
        isCorrect = null;
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionId: question.id,
        answerText: answer.answerText,
        isCorrect,
        marksAwarded,
      });
    }

    // Save answers
    await prisma.answer.createMany({
      data: answerRecords,
    });

    // Calculate percentage
    const percentage = calculatePercentage(totalScore, attempt.totalMarks);

    // Update attempt
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        timeSpent: timeSpent || 0,
        score: totalScore,
        percentage,
      },
    });

    // Update student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (studentProfile) {
      const newTotalExams = studentProfile.totalExamsTaken + 1;
      const newAverageScore =
        (studentProfile.averageScore * studentProfile.totalExamsTaken + percentage) /
        newTotalExams;

      await prisma.studentProfile.update({
        where: { userId: session.user.id },
        data: {
          totalExamsTaken: newTotalExams,
          averageScore: newAverageScore,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SUBMIT',
        entity: 'EXAM_ATTEMPT',
        entityId: attempt.id,
        details: JSON.stringify({
          examId: attempt.examId,
          score: totalScore,
          percentage,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Exam submitted successfully',
        attempt: {
          id: updatedAttempt.id,
          score: updatedAttempt.score,
          percentage: updatedAttempt.percentage,
          totalMarks: updatedAttempt.totalMarks,
          status: updatedAttempt.status,
        },
        showResults: attempt.exam.showResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json(
      { error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
