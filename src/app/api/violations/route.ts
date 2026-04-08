import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { violationSchema } from '@/lib/validations';

// POST - Report a violation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = violationSchema.parse(body);

    // Verify exam exists and student has an active attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId: validatedData.examId,
          studentId: session.user.id,
        },
      },
      include: {
        exam: true,
      },
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'No active exam attempt found' },
        { status: 400 }
      );
    }

    // Create violation record
    const violation = await prisma.examViolation.create({
      data: {
        examId: validatedData.examId,
        studentId: session.user.id,
        violationType: validatedData.violationType,
        description: validatedData.description,
        severity: validatedData.severity,
      },
    });

    // Update attempt violation count
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        violationCount: {
          increment: 1,
        },
      },
    });

    // Check if max violations exceeded
    let terminated = false;
    if (updatedAttempt.violationCount >= attempt.exam.maxViolations) {
      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'TERMINATED',
          isTerminated: true,
          terminationReason: `Exceeded maximum allowed violations (${attempt.exam.maxViolations})`,
          submittedAt: new Date(),
        },
      });
      terminated = true;
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VIOLATION',
        entity: 'EXAM_ATTEMPT',
        entityId: attempt.id,
        details: JSON.stringify({
          violationType: validatedData.violationType,
          severity: validatedData.severity,
          count: updatedAttempt.violationCount,
        }),
      },
    });

    return NextResponse.json(
      {
        message: 'Violation recorded',
        violation,
        violationCount: updatedAttempt.violationCount,
        maxViolations: attempt.exam.maxViolations,
        terminated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Report violation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to report violation' },
      { status: 500 }
    );
  }
}
