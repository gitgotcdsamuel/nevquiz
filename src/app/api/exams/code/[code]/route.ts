import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single exam by ID (for lecturers/admins to view details)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId },
      include: {
        questions: true,
        lecturer: {
          select: {
            name: true,
            lecturerProfile: {
              select: {
                department: true,
              },
            },
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Permission check: only the creator (lecturer) or admins can view full details
    if (session.user.role === 'LECTURER' && exam.lecturerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this exam' }, { status: 403 });
    }

    return NextResponse.json({ exam }, { status: 200 });
  } catch (error) {
    console.error('Get exam error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    );
  }
}

// PUT update exam (lecturer only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingExam = await prisma.exam.findUnique({
      where: { id: params.examId },
    });

    if (!existingExam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (existingExam.lecturerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this exam' }, { status: 403 });
    }

    const body = await request.json();

    // Optional: Add validation here (e.g., with Zod) before updating

    const updatedExam = await prisma.exam.update({
      where: { id: params.examId },
      data: body,
    });

    // Create audit log with correct field names
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'EXAM',
        entityId: updatedExam.id,
        changes: JSON.stringify({
          title: updatedExam.title,
          previousData: existingExam,
          updatedFields: Object.keys(body),
        }),
      },
    });

    return NextResponse.json(
      { message: 'Exam updated successfully', exam: updatedExam },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json(
      { error: 'Failed to update exam' },
      { status: 500 }
    );
  }
}

// DELETE exam (lecturer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.lecturerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this exam' }, { status: 403 });
    }

    await prisma.exam.delete({
      where: { id: params.examId },
    });

    // Create audit log with correct field names
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'EXAM',
        entityId: exam.id,
        changes: JSON.stringify({ title: exam.title }),
      },
    });

    return NextResponse.json(
      { message: 'Exam deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}