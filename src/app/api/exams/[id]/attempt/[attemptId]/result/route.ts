// src/app/api/exams/[id]/attempt/[attemptId]/result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attemptId: string } }
) {
  try {
    const { id: examId, attemptId } = params;
    
    // Get attempt with all relations
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            title: true,
            courseName: true,
            totalMarks: true,
            passingMarks: true,
            duration: true,
            maxAttempts: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                correctAnswer: true,
                marks: true
              }
            }
          }
        }
      }
    });
    
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found' },
        { status: 404 }
      );
    }
    
    // Calculate statistics
    const totalQuestions = attempt.answers.length;
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const score = attempt.score || 0;
    const percentage = attempt.percentage || 0;
    const totalMarks = attempt.totalMarks || attempt.exam.totalMarks;
    
    // Format time spent
    const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}h ${mins}m ${secs}s`;
    };
    
    const result = {
      examTitle: attempt.exam.title,
      courseName: attempt.exam.courseName,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      status: attempt.status,
      score,
      totalMarks,
      percentage,
      grade: attempt.grade,
      passingMarks: attempt.exam.passingMarks,
      correctAnswers,
      totalQuestions,
      timeSpent: attempt.timeSpent,
      timeSpentFormatted: formatTime(attempt.timeSpent || 0),
      violationCount: attempt.violationCount,
      terminationReason: attempt.terminationReason,
      maxAttempts: attempt.exam.maxAttempts,
      isPass: attempt.grade === 'PASS'
    };
    
    return NextResponse.json({
      success: true,
      result
    });
    
  } catch (error: any) {
    console.error('Error loading results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load results' },
      { status: 500 }
    );
  }
}