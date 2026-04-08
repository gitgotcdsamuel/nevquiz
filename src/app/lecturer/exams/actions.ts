'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Your existing updateExam function (unchanged)
export async function updateExam(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const examId = formData.get('examId') as string;

  // Security: confirm this exam belongs to the lecturer
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { lecturerId: true },
  });

  if (!exam || exam.lecturerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  // Update main exam fields
  await prisma.exam.update({
    where: { id: examId },
    data: {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      duration: Number(formData.get('duration')),
      // Add more fields here if you want (e.g., startTime, isPublished, etc.)
    },
  });

  // Update questions
  const questionUpdates = new Map<string, any>();

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('questionText-')) {
      const qId = key.replace('questionText-', '');
      const data = questionUpdates.get(qId) || {};
      data.questionText = value as string;
      questionUpdates.set(qId, data);
    } else if (key.startsWith('questionType-')) {
      const qId = key.replace('questionType-', '');
      const data = questionUpdates.get(qId) || {};
      data.questionType = value as string;
      questionUpdates.set(qId, data);
    } else if (key.startsWith('marks-')) {
      const qId = key.replace('marks-', '');
      const data = questionUpdates.get(qId) || {};
      data.marks = Number(value);
      questionUpdates.set(qId, data);
    } else if (key.startsWith('difficulty-')) {
      const qId = key.replace('difficulty-', '');
      const data = questionUpdates.get(qId) || {};
      data.difficulty = value ? Number(value as string) : null;
      questionUpdates.set(qId, data);
    } else if (key.startsWith('explanation-')) {
      const qId = key.replace('explanation-', '');
      const data = questionUpdates.get(qId) || {};
      data.explanation = (value as string) || null;
      questionUpdates.set(qId, data);
    }
    // Add options and correctAnswer updates
    else if (key.startsWith('options-')) {
      const qId = key.replace('options-', '');
      const data = questionUpdates.get(qId) || {};
      data.options = value as string;
      questionUpdates.set(qId, data);
    } else if (key.startsWith('correctAnswer-')) {
      const qId = key.replace('correctAnswer-', '');
      const data = questionUpdates.get(qId) || {};
      data.correctAnswer = value as string;
      questionUpdates.set(qId, data);
    }
  }

  // Apply question updates
  for (const [qId, data] of questionUpdates) {
    await prisma.question.update({
      where: { id: qId },
      data,
    });
  }

  // Redirect to View page
  redirect(`/lecturer/exams/${examId}`);
}

// FIXED: Add a new question
export async function addQuestion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const examId = formData.get('examId') as string;

  // Security: confirm this exam belongs to the lecturer
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, lecturerId: true },
  });

  if (!exam || exam.lecturerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  // Add new question
  const questionCount = await prisma.question.count({
    where: { examId },
  });

  await prisma.question.create({
    data: {
      examId: examId,
      questionText: 'New question text',
      questionType: 'MULTIPLE_CHOICE',
      marks: 1,
      order: questionCount + 1,
      difficulty: 3,
      explanation: null,
      options: JSON.stringify(['Option 1', 'Option 2', 'Option 3', 'Option 4']),
      correctAnswer: 'Option 1',
    },
  });

  revalidatePath(`/lecturer/exams/${examId}/edit`);
  return { success: true };
}

// FIXED: Delete question
export async function deleteQuestion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const examId = formData.get('examId') as string;
  const questionId = formData.get('questionId') as string;

  // Security: confirm this exam belongs to the lecturer
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { lecturerId: true },
  });

  if (!exam || exam.lecturerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  if (questionId) {
    // Delete question with security check
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { exam: { select: { lecturerId: true } } },
    });

    if (!question || question.exam.lecturerId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Delete question (answers will be automatically deleted when a student's attempt is deleted)
    await prisma.question.delete({
      where: { id: questionId },
    });

    // Reorder remaining questions
    const remainingQuestions = await prisma.question.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < remainingQuestions.length; i++) {
      await prisma.question.update({
        where: { id: remainingQuestions[i].id },
        data: { order: i + 1 },
      });
    }
  }

  revalidatePath(`/lecturer/exams/${examId}/edit`);
  return { success: true };
}

// FIXED: Update question (including options and correct answer)
export async function updateQuestion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  const examId = formData.get('examId') as string;
  const questionId = formData.get('questionId') as string;

  // Security: confirm this question belongs to the lecturer's exam
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { exam: { select: { lecturerId: true } } },
  });

  if (!question || question.exam.lecturerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const updateData: any = {};

  for (const [key, value] of formData.entries()) {
    if (key === `questionText-${questionId}`) {
      updateData.questionText = value as string;
    } else if (key === `questionType-${questionId}`) {
      updateData.questionType = value as string;
    } else if (key === `marks-${questionId}`) {
      updateData.marks = Number(value);
    } else if (key === `difficulty-${questionId}`) {
      updateData.difficulty = value ? Number(value as string) : null;
    } else if (key === `explanation-${questionId}`) {
      updateData.explanation = (value as string) || null;
    } else if (key === `order-${questionId}`) {
      updateData.order = Number(value);
    } else if (key === `options-${questionId}`) {
      updateData.options = value as string;
    } else if (key === `correctAnswer-${questionId}`) {
      updateData.correctAnswer = value as string;
    }
  }

  await prisma.question.update({
    where: { id: questionId },
    data: updateData,
  });

  revalidatePath(`/lecturer/exams/${examId}/edit`);
  return { success: true };
}