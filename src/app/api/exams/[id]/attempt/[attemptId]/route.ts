// src/app/api/exams/[id]/attempt/[attemptId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attemptId: string } }
) {
  try {
    const { id: examId, attemptId } = params;
    
    console.log('Loading exam attempt:', { examId, attemptId });
    
    // 1. Get the exam attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        id: attemptId,
        examId: examId
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                marks: true,
                order: true,
                options: true,
                difficulty: true
              }
            }
          }
        }
      }
    });
    
    if (!attempt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Exam attempt not found'
        },
        { status: 404 }
      );
    }
    
    // 2. Get the exam details
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            marks: true,
            order: true,
            options: true,
            difficulty: true,
            category: true,
            topic: true
          }
        }
      }
    });
    
    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Exam not found'
        },
        { status: 404 }
      );
    }
    
    // 3. Calculate time remaining
    const now = new Date();
    const startedAt = new Date(attempt.startedAt);
    const durationMs = exam.duration * 60 * 1000;
    const endTime = new Date(startedAt.getTime() + durationMs);
    const timeRemainingMs = Math.max(0, endTime.getTime() - now.getTime());
    const timeRemainingSeconds = Math.floor(timeRemainingMs / 1000);
    
    // 4. Prepare response
    const response = {
      success: true,
      attempt: {
        id: attempt.id,
        examId: attempt.examId,
        studentId: attempt.studentId,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        status: attempt.status,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        grade: attempt.grade,
        violationCount: attempt.violationCount,
        isFlagged: attempt.isFlagged,
        isTerminated: attempt.isTerminated,
        remainingTime: timeRemainingSeconds
      },
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        courseName: exam.courseName,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startTime: exam.startTime,
        endTime: exam.endTime,
        instructions: exam.instructions,
        settings: exam.settings ? JSON.parse(exam.settings) : {},
        totalQuestions: exam.questions.length,
        questions: exam.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks,
          order: q.order,
          options: q.options ? JSON.parse(q.options) : [],
          difficulty: q.difficulty,
          category: q.category,
          topic: q.topic
        }))
      },
      answers: attempt.answers.reduce((acc: any, answer: any) => {
        acc[answer.questionId] = {
          id: answer.id,
          answerText: answer.answerText,
          selectedOptions: answer.selectedOptions ? JSON.parse(answer.selectedOptions) : [],
          marksAwarded: answer.marksAwarded,
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent
        };
        return acc;
      }, {} as Record<string, any>)
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Error loading exam attempt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load exam attempt',
        details: error.message
      },
      { status: 500 }
    );
  }
}