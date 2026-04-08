// src/app/api/exams/[id]/attempt/[attemptId]/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; attemptId: string } }
) {
  try {
    const { id: examId, attemptId } = params;
    const body = await request.json();
    const { answers } = body;
    
    // Get current attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId }
    });
    
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found' },
        { status: 404 }
      );
    }
    
    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, error: 'Cannot save - exam not in progress' },
        { status: 400 }
      );
    }
    
    // Update or create answers
    const answerPromises = Object.entries(answers).map(async ([questionId, answerData]: [string, any]) => {
      const existingAnswer = await prisma.answer.findFirst({
        where: {
          attemptId,
          questionId
        }
      });
      
      if (existingAnswer) {
        // Update existing answer
        return prisma.answer.update({
          where: { id: existingAnswer.id },
          data: {
            answerText: answerData.answerText,
            selectedOptions: answerData.selectedOptions ? JSON.stringify(answerData.selectedOptions) : null,
            answeredAt: new Date()
          }
        });
      } else {
        // Create new answer
        return prisma.answer.create({
          data: {
            attemptId,
            questionId,
            answerText: answerData.answerText,
            selectedOptions: answerData.selectedOptions ? JSON.stringify(answerData.selectedOptions) : null,
            answeredAt: new Date()
          }
        });
      }
    });
    
    await Promise.all(answerPromises);
    
    // Update last activity
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        lastActivity: new Date()
      }
    });
    
    // Create log entry
    await prisma.examLog.create({
      data: {
        examId,
        attemptId,
        studentId: attempt.studentId,
        action: 'PROGRESS_SAVED',
        details: `Saved ${Object.keys(answers).length} answers`,
        timestamp: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      savedAt: new Date().toISOString(),
      answersSaved: Object.keys(answers).length
    });
    
  } catch (error: any) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}