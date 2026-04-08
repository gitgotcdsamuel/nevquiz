// src/app/api/exams/[id]/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const examId = params.id;
    const userId = 'test-user-123'; // TODO: Replace with actual auth
    
    console.log('Starting exam for user:', userId, 'exam:', examId);
    
    // 1. Find the exam (model is "Exam" singular)
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId
      },
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
            difficulty: true
          }
        }
      }
    });
    
    if (!exam) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Exam not found',
          exists: false 
        },
        { status: 404 }
      );
    }
    
    console.log('Exam found:', exam.title);
    
    // 2. Check if exam is currently available
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (now < startTime) {
      return NextResponse.json({
        success: false,
        error: 'Exam has not started yet',
        startTime: startTime.toISOString(),
        currentTime: now.toISOString()
      });
    }
    
    if (now > endTime) {
      return NextResponse.json({
        success: false,
        error: 'Exam has ended',
        endTime: endTime.toISOString(),
        currentTime: now.toISOString()
      });
    }
    
    // 3. Check if user already has an active attempt
    // Note: In your schema, it's "ExamAttempt" not "ExamSession"
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: {
        examId: examId,
        studentId: userId, // Using userId as studentId for now
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS']
        }
      }
    });
    
    if (activeAttempt) {
      return NextResponse.json({
        success: false,
        error: 'You already have an active exam attempt',
        attemptId: activeAttempt.id,
        status: activeAttempt.status,
        redirectTo: `/exam/attempt/${activeAttempt.id}`
      });
    }
    
    // 4. Check max attempts
    const userAttempts = await prisma.examAttempt.count({
      where: {
        examId: examId,
        studentId: userId
      }
    });
    
    if (userAttempts >= exam.maxAttempts) {
      return NextResponse.json({
        success: false,
        error: `Maximum attempts (${exam.maxAttempts}) reached for this exam`
      });
    }
    
    // 5. Create a new exam attempt
    const attemptNumber = userAttempts + 1;
    const newAttempt = await prisma.examAttempt.create({
      data: {
        examId: examId,
        studentId: userId,
        attemptNumber: attemptNumber,
        startedAt: now,
        status: 'IN_PROGRESS',
        totalMarks: exam.totalMarks,
        timeSpent: 0,
        violationCount: 0,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        deviceInfo: JSON.stringify({
          platform: 'web',
          timestamp: now.toISOString()
        })
      }
    });
    
    console.log('Created new attempt:', newAttempt.id);
    
    // 6. Create exam log entry
    await prisma.examLog.create({
      data: {
        examId: examId,
        attemptId: newAttempt.id,
        studentId: userId,
        action: 'EXAM_STARTED',
        details: `Started exam attempt #${attemptNumber}`,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: now
      }
    });
    
    // 7. Update exam statistics
    await prisma.exam.update({
      where: { id: examId },
      data: {
        totalAttempts: { increment: 1 }
      }
    });
    
    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: 'Exam started successfully',
      attempt: {
        id: newAttempt.id,
        examId: newAttempt.examId,
        studentId: newAttempt.studentId,
        attemptNumber: newAttempt.attemptNumber,
        startedAt: newAttempt.startedAt,
        status: newAttempt.status,
        remainingTime: exam.duration * 60, // Convert minutes to seconds
        expiresAt: new Date(now.getTime() + exam.duration * 60000)
      },
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        courseName: exam.courseName,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        totalQuestions: exam.questions.length,
        questions: exam.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks,
          order: q.order,
          difficulty: q.difficulty
        }))
      },
      redirectTo: `/exam/attempt/${newAttempt.id}`,
      warnings: []
    });
    
  } catch (error) {
    console.error('Detailed error starting exam:', error);
    
    // Log specific Prisma errors
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    if (error.meta) {
      console.error('Prisma error meta:', error.meta);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to start exam',
        details: error.message,
        code: error.code,
        meta: error.meta
      },
      { status: 500 }
    );
  }
}

// Also add GET method for testing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        code: true,
        duration: true,
        totalMarks: true,
        startTime: true,
        endTime: true,
        status: true,
        isPublished: true,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });
    
    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      exam: exam,
      currentTime: new Date().toISOString(),
      isAvailable: exam.isPublished && exam.status === 'ACTIVE' // Adjust based on your needs
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}