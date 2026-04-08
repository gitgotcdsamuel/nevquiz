import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role = 'STUDENT',
      studentId,
      employeeId,
      department
    } = body;

    console.log('📝 Registration attempt for:', email);

    // Validate required fields
    if (!email || !password || !name) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password - THIS IS CRITICAL
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Store HASHED password
        name,
        role,
        status: 'ACTIVE',
      },
    });

    console.log('✅ User created:', user.email);

    // Create profile based on role
    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentId: studentId || `STU${Date.now().toString().slice(-6)}`,
          rollNumber: studentId || `STU${Date.now().toString().slice(-6)}`,
          department: department || 'Computer Science',
          program: 'BSc Computer Science',
          batch: new Date().getFullYear(),
          semester: 1,
          admissionYear: new Date().getFullYear(),
        },
      });
      console.log('📚 Student profile created');
    } else if (role === 'LECTURER') {
      await prisma.lecturerProfile.create({
        data: {
          userId: user.id,
          employeeId: employeeId || `LEC${Date.now().toString().slice(-6)}`,
          department: department || 'Computer Science',
          faculty: 'Engineering',
          designation: 'Lecturer',
        },
      });
      console.log('🎓 Lecturer profile created');
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}