// app/api/exams/reconduct/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { originalExamId, startTime, endTime, duration } = await request.json();

    // Fetch the original exam with its questions
    const originalExam = await prisma.exam.findUnique({
      where: { 
        id: originalExamId,
        lecturerId: session.user.id // Ensure lecturer owns this exam
      },
      include: { 
        questions: true,
        lecturer: true
      }
    });

    if (!originalExam) {
      return NextResponse.json(
        { error: 'Original exam not found' },
        { status: 404 }
      );
    }

    // Generate new unique code
    const newCode = `${originalExam.code}-R${Date.now().toString().slice(-6)}`;

    // Create new exam based on original
    const newExam = await prisma.exam.create({
      data: {
        title: `${originalExam.title} (Reconduct)`,
        description: originalExam.description,
        code: newCode,
        shortCode: originalExam.shortCode,
        lecturerId: originalExam.lecturerId,
        courseCode: originalExam.courseCode,
        courseName: originalExam.courseName,
        duration: duration || originalExam.duration,
        totalMarks: originalExam.totalMarks,
        passingMarks: originalExam.passingMarks,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        resultPublishAt: new Date(new Date(endTime).getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        isPublished: true,
        settings: originalExam.settings,
        instructions: originalExam.instructions,
        allowedDevices: originalExam.allowedDevices,
        maxAttempts: originalExam.maxAttempts,
        securityLevel: originalExam.securityLevel,
        proctoringMode: originalExam.proctoringMode,
        questions: {
          create: originalExam.questions.map(q => ({
            questionText: q.questionText,
            questionType: q.questionType,
            marks: q.marks,
            order: q.order,
            difficulty: q.difficulty,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            category: q.category,
            topic: q.topic,
          }))
        }
      },
      include: {
        questions: true
      }
    });

    // Create notification for the lecturer
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'EXAM_CREATED',
        title: 'Exam Reconducted Successfully',
        message: `Your exam "${originalExam.title}" has been reconducted as "${newExam.title}".`,
        data: JSON.stringify({ examId: newExam.id })
      }
    });

    return NextResponse.json({ 
      message: 'Exam reconducted successfully',
      exam: {
        id: newExam.id,
        title: newExam.title,
        code: newExam.code
      }
    });
  } catch (error) {
    console.error('Failed to reconduct exam:', error);
    return NextResponse.json(
      { error: 'Failed to reconduct exam' },
      { status: 500 }
    );
  }
}