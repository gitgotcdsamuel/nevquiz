// src/app/api/exams/[id]/attempt/[attemptId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const  = await params;
    const body = await request.json();
    const { answers, timeSpent } = body;
    
    // Get attempt and exam
    const [attempt, exam] = await Promise.all([
      prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: { answers: true }
      }),
      prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: true }
      })
    ]);
    
    if (!attempt || !exam) {
      return NextResponse.json(
        { success: false, error: 'Attempt or exam not found' },
        { status: 404 }
      );
    }
    
    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { success: false, error: 'Exam already submitted or terminated' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    
    // 1. Save all answers
    const answerPromises = Object.entries(answers).map(async ([questionId, answerData]: [string, any]) => {
      const question = exam.questions.find(q => q.id === questionId);
      if (!question) return null;
      
      // Calculate marks for multiple choice
      let marksAwarded = 0;
      let isCorrect = false;
      
      if (question.questionType === 'MULTIPLE_CHOICE' && question.correctAnswer) {
        const correctAnswer = JSON.parse(question.correctAnswer);
        const userAnswer = answerData.selectedOptions?.[0];
        isCorrect = correctAnswer.includes(userAnswer);
        marksAwarded = isCorrect ? question.marks : 0;
      }
      
      const existingAnswer = await prisma.answer.findFirst({
        where: { attemptId, questionId }
      });
      
      if (existingAnswer) {
        return prisma.answer.update({
          where: { id: existingAnswer.id },
          data: {
            answerText: answerData.answerText,
            selectedOptions: answerData.selectedOptions ? JSON.stringify(answerData.selectedOptions) : null,
            marksAwarded,
            isCorrect,
            answeredAt: now
          }
        });
      } else {
        return prisma.answer.create({
          data: {
            attemptId,
            questionId,
            answerText: answerData.answerText,
            selectedOptions: answerData.selectedOptions ? JSON.stringify(answerData.selectedOptions) : null,
            marksAwarded,
            isCorrect,
            answeredAt: now
          }
        });
      }
    });
    
    await Promise.all(answerPromises.filter(p => p !== null));
    
    // 2. Calculate total score
    const updatedAnswers = await prisma.answer.findMany({
      where: { attemptId },
      select: { marksAwarded: true }
    });
    
    const totalScore = updatedAnswers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const percentage = (totalScore / exam.totalMarks) * 100;
    const grade = percentage >= exam.passingMarks ? 'PASS' : 'FAIL';
    
    // 3. Update attempt
    const submittedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        timeSpent: timeSpent || attempt.timeSpent,
        score: totalScore,
        percentage,
        grade
      }
    });
    
    // 4. Update exam statistics
    const allAttempts = await prisma.examAttempt.findMany({
      where: { examId, status: 'SUBMITTED', score: { not: null } }
    });
    
    const avgScore = allAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / allAttempts.length;
    const passRate = (allAttempts.filter(a => a.grade === 'PASS').length / allAttempts.length) * 100;
    
    await prisma.exam.update({
      where: { id: examId },
      data: {
        avgScore,
        passRate
      }
    });
    
    // 5. Create log
    await prisma.examLog.create({
      data: {
        examId,
        attemptId,
        studentId: attempt.studentId,
        action: 'EXAM_SUBMITTED',
        details: `Submitted with score: ${totalScore}/${exam.totalMarks} (${percentage.toFixed(1)}%)`,
        timestamp: now
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully',
      result: {
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage: percentage.toFixed(1),
        grade,
        submittedAt: now.toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}