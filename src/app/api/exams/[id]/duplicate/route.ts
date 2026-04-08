import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.lecturerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: { 
        isPublished: true,
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Exam published successfully',
      exam: updatedExam
    });
  } catch (error) {
    console.error('Error publishing exam:', error);
    return NextResponse.json(
      { error: 'Failed to publish exam' },
      { status: 500 }
    );
  }
}