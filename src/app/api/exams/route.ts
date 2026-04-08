import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST create new exam - UPDATED TO MATCH CREATE PAGE
export async function POST(request: NextRequest) {
  console.log('=== EXAM CREATION API CALLED ===');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user?.id, session?.user?.role);

    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'LECTURER') {
      console.log('User is not a lecturer:', session.user.role);
      return NextResponse.json({ error: 'Only lecturers can create exams' }, { status: 403 });
    }

    const body = await request.json();
    console.log('=== REQUEST BODY ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('Fields present:', Object.keys(body));

    // Check if lecturer profile exists
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!lecturerProfile) {
      console.log('Lecturer profile not found for user:', session.user.id);
      return NextResponse.json({ 
        error: 'Lecturer profile not found. Please complete your profile.' 
      }, { status: 400 });
    }

    // IMPORTANT: Your create page now sends different field names!
    // Validate required fields based on your CREATE PAGE's updated data structure
    const requiredFields = ['title', 'code', 'duration', 'startTime', 'endTime'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate dates
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    console.log('Date validation:', {
      startTime: body.startTime,
      parsedStartTime: startTime.toISOString(),
      endTime: body.endTime,
      parsedEndTime: endTime.toISOString(),
      isValidStart: !isNaN(startTime.getTime()),
      isValidEnd: !isNaN(endTime.getTime())
    });

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Calculate total marks - UPDATED FIELD NAMES
    let totalMarks = 100;
    if (body.totalMarks) {
      totalMarks = parseInt(body.totalMarks);
    } else if (body.maxScore) { // Old field name for backward compatibility
      totalMarks = parseInt(body.maxScore);
    } else if (body.questions && Array.isArray(body.questions)) {
      totalMarks = body.questions.reduce((sum: number, q: any) => sum + (parseInt(q.marks) || 1), 0);
    }

    // Calculate passing marks - UPDATED FIELD NAME
    const passingMarks = body.passingMarks 
      ? parseInt(body.passingMarks) 
      : Math.floor(totalMarks * 0.4);

    if (passingMarks > totalMarks) {
      return NextResponse.json(
        { error: 'Passing marks cannot exceed total marks' },
        { status: 400 }
      );
    }

    // Check if exam code already exists - UPDATED FIELD NAME
    console.log('Checking if exam code exists:', body.code);
    const existingExam = await prisma.exam.findFirst({
      where: { 
        OR: [
          { code: body.code },
          { shortCode: body.code?.substring(0, 10)?.toUpperCase() }
        ]
      }
    });

    if (existingExam) {
      console.log('Exam code already exists:', body.code);
      return NextResponse.json({ 
        error: 'Exam code already exists. Please use a different code.',
        details: existingExam.code === body.code 
          ? 'Main exam code already exists' 
          : 'Short code already exists'
      }, { status: 409 });
    }

    // IMPORTANT: Prepare exam data according to BOTH your Prisma schema AND create page's data structure
    const examData = {
      title: body.title,
      description: body.description || '',
      code: body.code, // Your create page now sends 'code' not 'examCode'
      shortCode: body.shortCode || body.code?.substring(0, 8).toUpperCase() || 'EXAM' + Date.now().toString().slice(-6),
      lecturerId: session.user.id,
      courseCode: body.courseCode || body.subject?.replace(/[^a-zA-Z0-9]/g, '')?.toUpperCase()?.substring(0, 10) || 'GEN101',
      courseName: body.courseName || body.subject || body.title?.substring(0, 200) || 'Untitled Course', // Use courseName from create page
      duration: parseInt(body.duration) || 60,
      totalMarks: totalMarks,
      passingMarks: passingMarks,
      startTime: startTime,
      endTime: endTime,
      isPublished: body.isPublished || false,
      status: body.isPublished ? 'PUBLISHED' : 'DRAFT',
      isArchived: false,
      settings: body.settings || body.securitySettings || '{}', // Your create page now sends 'settings' not 'securitySettings'
      instructions: body.instructions || 'Please read all questions carefully.',
      maxAttempts: body.maxAttempts || 1,
      securityLevel: body.securityLevel || 1,
      proctoringMode: body.proctoringMode || 'NONE',
      avgScore: 0,
      passRate: 0,
      totalAttempts: 0,
      publishedAt: body.isPublished ? new Date() : null,
    };

    console.log('=== PREPARED EXAM DATA ===');
    console.log('Exam data to create:', JSON.stringify(examData, null, 2));

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the exam
      const createdExam = await tx.exam.create({
        data: examData
      });

      console.log('Exam created successfully with ID:', createdExam.id);
      console.log('Exam code:', createdExam.code);
      console.log('Exam shortCode:', createdExam.shortCode);

      // Create questions if provided - UPDATED FIELD NAMES
      if (body.questions && Array.isArray(body.questions) && body.questions.length > 0) {
        console.log(`Creating ${body.questions.length} questions...`);
        
        const questionPromises = body.questions.map(async (question: any, index: number) => {
          console.log(`Processing question ${index}:`, {
            hasText: !!question.questionText,
            type: question.questionType,
            marks: question.marks
          });

          const questionData = {
            examId: createdExam.id,
            questionText: question.questionText || question.text || '',
            questionType: question.questionType || question.type || 'MULTIPLE_CHOICE',
            marks: parseInt(question.marks) || 1,
            order: question.order || index,
            difficulty: question.difficulty || 1,
            options: question.options ? (typeof question.options === 'string' ? question.options : JSON.stringify(question.options)) : null,
            correctAnswer: question.correctAnswer || '',
            explanation: question.explanation || '',
            category: question.category || 'General',
            topic: question.topic || 'General',
          };

          console.log(`Question ${index} data:`, questionData);

          return tx.question.create({
            data: questionData
          });
        });

        const createdQuestions = await Promise.all(questionPromises);
        console.log(`${createdQuestions.length} questions created successfully`);
      } else {
        console.log('No questions provided in request');
      }

      // Update lecturer's exam count
      await tx.lecturerProfile.update({
        where: { userId: session.user.id },
        data: {
          totalExamsCreated: { increment: 1 },
          activeExams: body.isPublished ? { increment: 1 } : undefined,
        }
      });

      console.log('Lecturer profile updated');

      // Get the complete exam with questions for response
      const completeExam = await tx.exam.findUnique({
        where: { id: createdExam.id },
        include: {
          questions: {
            select: {
              id: true,
              questionText: true,
              questionType: true,
              marks: true,
              order: true
            },
            orderBy: { order: 'asc' }
          },
          lecturer: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_EXAM',
          entityType: 'EXAM',
          entityId: createdExam.id,
          newData: JSON.stringify({ 
            title: createdExam.title, 
            code: createdExam.code,
            shortCode: createdExam.shortCode,
            totalQuestions: body.questions?.length || 0 
          }),
        },
      });

      return completeExam;
    });

    console.log('=== EXAM CREATION COMPLETED SUCCESSFULLY ===');
    console.log('Final exam result:', {
      id: result?.id,
      code: result?.code,
      shortCode: result?.shortCode,
      title: result?.title,
      questionCount: result?.questions?.length
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Exam created successfully',
      exam: result
    }, { status: 201 });

  } catch (error: any) {
    console.error('=== EXAM CREATION FAILED ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific errors
    let errorMessage = 'Failed to create exam';
    let statusCode = 500;

    if (error.code === 'P2002') {
      const target = error.meta?.target || '';
      if (target.includes('code')) {
        errorMessage = 'Exam code already exists. Please use a different code.';
      } else if (target.includes('shortCode')) {
        errorMessage = 'Short code already exists. Please use a different code.';
      } else {
        errorMessage = 'Unique constraint violation. Please check your data.';
      }
      statusCode = 409;
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid lecturer ID or foreign key constraint failed.';
      statusCode = 400;
    } else if (error.code === 'P1012') {
      errorMessage = 'Database schema validation failed. Please check your data.';
      statusCode = 400;
    } else if (error.code === 'P2025') {
      errorMessage = 'Required related record not found.';
      statusCode = 400;
    } else if (error.name === 'PrismaClientValidationError') {
      errorMessage = 'Data validation error. Please check all required fields.';
      statusCode = 400;
    }

    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code,
      meta: error.meta
    }, { status: statusCode });
  }
}

// GET all exams (lecturer only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Different queries based on role
    if (session.user.role === 'LECTURER') {
      const exams = await prisma.exam.findMany({
        where: { lecturerId: session.user.id },
        include: {
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
          questions: {
            select: {
              id: true,
              questionType: true,
              marks: true,
              order: true,
            },
            orderBy: { order: 'asc' },
            take: 5, // Limit to 5 questions for preview
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ exams }, { status: 200 });
      
    } else if (session.user.role === 'STUDENT') {
      // For students, return only published exams
      const exams = await prisma.exam.findMany({
        where: { 
          isPublished: true,
          status: 'PUBLISHED',
          // Only show exams that haven't ended yet
          OR: [
            { endTime: { gt: new Date() } },
            { endTime: null }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          code: true,
          shortCode: true,
          courseCode: true,
          courseName: true,
          duration: true,
          totalMarks: true,
          passingMarks: true,
          startTime: true,
          endTime: true,
          maxAttempts: true,
          status: true,
          lecturer: {
            select: {
              name: true,
            }
          },
          _count: {
            select: {
              questions: true,
            }
          }
        },
        orderBy: { startTime: 'asc' },
      });

      return NextResponse.json({ exams }, { status: 200 });
      
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Get exams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}