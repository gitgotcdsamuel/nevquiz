import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Exam Validation Endpoint Called ===');
    
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    console.log('Received code:', code);
    console.log('All params:', Object.fromEntries(searchParams.entries()));

    if (!code || code.trim() === '') {
      console.log('No exam code provided');
      return NextResponse.json(
        { 
          valid: false,
          error: 'VALIDATION_ERROR',
          message: 'Exam code is required',
          suggestions: [
            'Enter the exam code provided by your lecturer',
            'Check for any typos',
            'Ensure you have the correct code'
          ]
        },
        { status: 400 }
      );
    }

    // Clean and format the code
    const cleanCode = code.trim().toUpperCase();
    console.log('Searching for exam with code:', cleanCode);

    // Find exam by code - check both code and shortCode
    const exam = await prisma.exam.findFirst({
      where: { 
        OR: [
          { code: cleanCode },
          { shortCode: cleanCode }
        ]
      },
      include: {
        lecturer: {
          select: {
            name: true,
            email: true
          }
        },
        questions: {
          select: {
            id: true
          }
        }
      }
    });

    console.log('Exam found:', !!exam);
    
    if (!exam) {
      console.log('No exam found with code:', cleanCode);
      return NextResponse.json({
        valid: false,
        error: 'NOT_FOUND',
        message: 'No exam matches the code you entered.',
        status: 'NOT_FOUND',
        suggestions: [
          'Check for typos in the code',
          'Ensure you\'re using the right exam code',
          'Contact your lecturer for the correct code'
        ]
      }, { status: 404 });
    }

    console.log('Exam details:', {
      id: exam.id,
      title: exam.title,
      code: exam.code,
      shortCode: exam.shortCode,
      isPublished: exam.isPublished,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      questionCount: exam.questions.length
    });

    // Check if exam is published
    if (!exam.isPublished) {
      console.log('Exam is not published');
      return NextResponse.json({
        valid: false,
        error: 'NOT_PUBLISHED',
        message: 'This exam is not published yet.',
        status: 'DRAFT',
        exam: {
          id: exam.id,
          title: exam.title,
          code: exam.code,
          lecturerName: exam.lecturer.name,
          lecturerEmail: exam.lecturer.email,
          isPublished: exam.isPublished,
          status: exam.status
        }
      }, { status: 403 });
    }

    // Check if exam has questions
    if (!exam.questions || exam.questions.length === 0) {
      console.log('Exam has no questions');
      return NextResponse.json({
        valid: false,
        error: 'NO_QUESTIONS',
        message: 'This exam has no questions yet.',
        status: 'INCOMPLETE',
        exam: {
          id: exam.id,
          title: exam.title,
          code: exam.code
        }
      }, { status: 403 });
    }

    // Check exam timing
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    console.log('Timing check:', {
      now: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isBeforeStart: now < startTime,
      isAfterEnd: now > endTime
    });

    // Check if exam has started
    if (now < startTime) {
      const timeUntilStart = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60)); // minutes
      console.log('Exam has not started yet. Time until start:', timeUntilStart, 'minutes');
      
      return NextResponse.json({
        valid: false,
        error: 'NOT_STARTED',
        message: `Exam starts in ${timeUntilStart} minutes`,
        status: 'UPCOMING',
        exam: {
          id: exam.id,
          title: exam.title,
          code: exam.code,
          shortCode: exam.shortCode,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          lecturerName: exam.lecturer.name,
          courseCode: exam.courseCode,
          courseName: exam.courseName,
          canStart: false,
          timeUntilStart
        }
      });
    }

    // Check if exam has ended
    if (now > endTime) {
      console.log('Exam has ended');
      return NextResponse.json({
        valid: false,
        error: 'ENDED',
        message: 'Exam has ended',
        status: 'COMPLETED',
        exam: {
          id: exam.id,
          title: exam.title,
          code: exam.code,
          endTime: exam.endTime,
          canStart: false
        }
      });
    }

    // Exam is active and available
    console.log('Exam is available to take');
    
    // Parse security settings if they exist
    let securitySettings = {};
    try {
      if (exam.settings) {
        securitySettings = JSON.parse(exam.settings);
      }
    } catch (e) {
      console.error('Error parsing security settings:', e);
    }

    return NextResponse.json({
      valid: true,
      message: 'Exam is available',
      status: 'AVAILABLE',
      exam: {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        shortCode: exam.shortCode,
        courseCode: exam.courseCode,
        courseName: exam.courseName,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        startTime: exam.startTime,
        endTime: exam.endTime,
        instructions: exam.instructions,
        status: exam.status,
        isPublished: exam.isPublished,
        securitySettings: securitySettings,
        maxAttempts: exam.maxAttempts,
        proctoringMode: exam.proctoringMode,
        lecturerName: exam.lecturer.name,
        lecturerEmail: exam.lecturer.email,
        questionCount: exam.questions.length,
        canStart: true
      },
      instructions: [
        'Copying and pasting is disabled',
        'Your activity will be monitored for violations',
        'Save your answers regularly',
        'Do not switch tabs or windows during the exam'
      ]
    });

  } catch (error: any) {
    console.error('=== Exam validation error ===');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific database errors
    if (error.code === 'P2025' || error.code === 'P2001') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'DATABASE_ERROR',
          message: 'Database connection error',
          status: 'ERROR'
        },
        { status: 500 }
      );
    }

    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'DATABASE_CONNECTION',
          message: 'Cannot connect to database'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        valid: false,
        error: 'SERVER_ERROR',
        message: 'An error occurred while checking the exam',
        status: 'ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log('=== CORS OPTIONS request ===');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}