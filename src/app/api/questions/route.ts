import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { questionSchema } from '@/lib/validations';

// POST - Create question for an exam
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, ...questionData } = body;

    // Verify exam belongs to lecturer
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.lecturerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate question data
    const validatedData = questionSchema.parse(questionData);

    // Create question
    const question = await prisma.question.create({
      data: {
        examId,
        questionText: validatedData.questionText,
        questionType: validatedData.questionType,
        marks: validatedData.marks,
        order: exam._count.questions + 1,
        options: JSON.stringify(validatedData.options || []),
        correctAnswer: JSON.stringify(validatedData.correctAnswer),
        explanation: validatedData.explanation,
      },
    });

    // Update exam total marks
    await prisma.exam.update({
      where: { id: examId },
      data: {
        totalMarks: {
          increment: validatedData.marks,
        },
      },
    });

    return NextResponse.json(
      { message: 'Question created successfully', question },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create question error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
