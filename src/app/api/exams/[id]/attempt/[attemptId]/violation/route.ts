// src/app/api/exams/[id]/attempt/[attemptId]/violation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const  = await params;
    const body = await request.json();
    
    const { type, details, timestamp } = body;
    
    // 1. Create violation record
    const violation = await prisma.examViolation.create({
      data: {
        examId,
        studentId: 'current-user-id', // TODO: Get from auth
        attemptId,
        violationType: type,
        description: details,
        severity: 'HIGH',
        timestamp: new Date(timestamp)
      }
    });
    
    // 2. Update attempt violation count
    const attempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        violationCount: { increment: 1 }
      }
    });
    
    // 3. Check if should terminate (3+ violations)
    if (attempt.violationCount >= 3) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'TERMINATED',
          isTerminated: true,
          terminationReason: 'Exceeded maximum violations'
        }
      });
      
      // Create exam log
      await prisma.examLog.create({
        data: {
          examId,
          attemptId,
          studentId: 'current-user-id',
          action: 'EXAM_TERMINATED',
          details: 'Exam terminated due to excessive violations',
          ipAddress: request.ip,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date()
        }
      });
      
      return NextResponse.json({
        success: true,
        violation,
        terminated: true,
        message: 'Exam terminated due to violations'
      });
    }
    
    return NextResponse.json({
      success: true,
      violation,
      violationCount: attempt.violationCount,
      warning: `Warning: ${attempt.violationCount}/3 violations`
    });
    
  } catch (error: any) {
    console.error('Error recording violation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}