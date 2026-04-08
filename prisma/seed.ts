import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for SQL Server...');

  // Clear existing data (in correct order for foreign keys)
  console.log('🧹 Cleaning existing data...');
  
  // Reorder models to respect foreign key constraints
  const models = [
    'ExamViolation',
    'ExamLog',
    'ExamAttempt',
    'Answer',
    'Question',
    'Exam',
    'Notification',
    'AuditLog',
    'Message',
    'Session',
    'StudentProfile',
    'LecturerProfile',
    'AdminProfile',
    'User',
    'SystemSetting'
  ];

  for (const model of models) {
    try {
      const modelName = model.toLowerCase();
      // Check if the model exists in prisma client
      if ((prisma as any)[modelName]) {
        await (prisma as any)[modelName].deleteMany({});
        console.log(`✅ Cleared ${model}`);
      } else {
        console.log(`⚠️  Model ${model} not found in Prisma client, skipping...`);
      }
    } catch (error: any) {
      if (error.code === 'P2003') {
        console.log(`⚠️  Foreign key constraint for ${model}, but continuing...`);
      } else {
        console.log(`⚠️  Could not clear ${model}: ${error.message}`);
      }
    }
  }

  // Helper function to create or update user
  async function createOrUpdateUser(email: string, userData: any) {
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.log(`👤 User ${email} already exists, updating...`);
      
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: userData.password,
          name: userData.name,
          role: userData.role,
          status: userData.status,
        }
      });

      // Update or create related profile based on role
      if (userData.role === 'ADMIN' && userData.adminProfile) {
        const existingProfile = await prisma.adminProfile.findFirst({
          where: { userId: existingUser.id }
        });
        
        if (existingProfile) {
          await prisma.adminProfile.update({
            where: { id: existingProfile.id },
            data: userData.adminProfile.create
          });
        } else {
          await prisma.adminProfile.create({
            data: {
              ...userData.adminProfile.create,
              userId: existingUser.id
            }
          });
        }
      } else if (userData.role === 'LECTURER' && userData.lecturerProfile) {
        const existingProfile = await prisma.lecturerProfile.findFirst({
          where: { userId: existingUser.id }
        });
        
        if (existingProfile) {
          await prisma.lecturerProfile.update({
            where: { id: existingProfile.id },
            data: userData.lecturerProfile.create
          });
        } else {
          await prisma.lecturerProfile.create({
            data: {
              ...userData.lecturerProfile.create,
              userId: existingUser.id
            }
          });
        }
      } else if (userData.role === 'STUDENT' && userData.studentProfile) {
        const existingProfile = await prisma.studentProfile.findFirst({
          where: { userId: existingUser.id }
        });
        
        if (existingProfile) {
          await prisma.studentProfile.update({
            where: { id: existingProfile.id },
            data: userData.studentProfile.create
          });
        } else {
          await prisma.studentProfile.create({
            data: {
              ...userData.studentProfile.create,
              userId: existingUser.id
            }
          });
        }
      }

      return existingUser;
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: userData
      });
      console.log(`✅ Created user: ${email}`);
      return newUser;
    }
  }

  // Create admin user
  const adminHashedPassword = await bcrypt.hash('Admin@123456', 12);
  
  const admin = await createOrUpdateUser('admin@example.com', {
    email: 'admin@example.com',
    password: adminHashedPassword,
    name: 'System Administrator',
    role: 'ADMIN',
    status: 'ACTIVE',
    adminProfile: {
      create: {
        permissions: JSON.stringify({
          manageUsers: true,
          manageExams: true,
          viewReports: true,
          systemSettings: true,
        }),
        accessLevel: 10,
        adminType: 'SUPER_ADMIN'
      },
    },
  });

  console.log('✅ Admin user ready:', admin.email);

  // Create sample lecturer
  const lecturerHashedPassword = await bcrypt.hash('Lecturer@123', 12);
  
  const lecturer = await createOrUpdateUser('lecturer@example.com', {
    email: 'lecturer@example.com',
    password: lecturerHashedPassword,
    name: 'Dr. John Smith',
    role: 'LECTURER',
    status: 'ACTIVE',
    lecturerProfile: {
      create: {
        employeeId: 'LEC001',
        department: 'Computer Science',
        faculty: 'Engineering',
        designation: 'Associate Professor',
        qualification: 'PhD in Computer Science',
        specialization: 'Software Engineering, Database Systems',
        totalExamsCreated: 0,
        activeExams: 0,
        totalStudents: 0,
        averageRating: 0
      },
    },
  });

  console.log('✅ Lecturer user ready:', lecturer.email);

  // Create demo student (matches login page credentials)
  const demoStudentHashedPassword = await bcrypt.hash('Student@123', 12);
  
  const demoStudent = await createOrUpdateUser('student@example.com', {
    email: 'student@example.com',
    password: demoStudentHashedPassword,
    name: 'Demo Student',
    role: 'STUDENT',
    status: 'ACTIVE',
    studentProfile: {
      create: {
        studentId: 'STU000',
        rollNumber: 'STU000',
        department: 'Computer Science',
        program: 'BSc Computer Science',
        batch: 2022,
        semester: 1,
        admissionYear: 2022,
        totalExamsTaken: 0,
        completedExams: 0,
        averageScore: 0,
        totalViolations: 0
      },
    },
  });

  console.log('✅ Demo student ready: student@example.com');

  // Create additional sample students
  const studentsData = [
    {
      email: 'student1@example.com',
      name: 'Alice Johnson',
      studentId: 'STU001',
      year: 3,
      semester: 1
    },
    {
      email: 'student2@example.com',
      name: 'Bob Williams',
      studentId: 'STU002', 
      year: 2,
      semester: 2
    },
    {
      email: 'student3@example.com',
      name: 'Charlie Brown',
      studentId: 'STU003',
      year: 4,
      semester: 1
    }
  ];

  const students = [demoStudent];
  for (const studentData of studentsData) {
    const studentHashedPassword = await bcrypt.hash('Student@123', 12);
    
    const student = await createOrUpdateUser(studentData.email, {
      email: studentData.email,
      password: studentHashedPassword,
      name: studentData.name,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProfile: {
        create: {
          studentId: studentData.studentId,
          rollNumber: studentData.studentId,
          department: 'Computer Science',
          program: 'BSc Computer Science',
          batch: 2022,
          semester: studentData.semester,
          admissionYear: 2022,
          totalExamsTaken: 0,
          completedExams: 0,
          averageScore: 0,
          totalViolations: 0
        },
      },
    });
    
    students.push(student);
    console.log(`✅ Student ready: ${student.email}`);
  }

  // Check if exam already exists to avoid duplicates
  const existingExam = await prisma.exam.findFirst({
    where: {
      code: 'CS301-MID-2024'
    }
  });

  let exam;
  if (!existingExam) {
    // Create sample exam
    const examStartDate = new Date();
    examStartDate.setDate(examStartDate.getDate() + 7); // 7 days from now
    
    const examEndDate = new Date(examStartDate);
    examEndDate.setHours(examEndDate.getHours() + 3); // 3 hour exam window

    exam = await prisma.exam.create({
      data: {
        title: 'Mid-Term Examination: Database Systems',
        description: 'Covers chapters 1-5 on relational database concepts, SQL, and normalization.',
        code: 'CS301-MID-2024',
        shortCode: 'DBMID24',
        lecturerId: lecturer.id,
        courseCode: 'CS301',
        courseName: 'Database Management Systems',
        duration: 120, // 2 hours
        totalMarks: 100,
        passingMarks: 50,
        startTime: examStartDate,
        endTime: examEndDate,
        resultPublishAt: new Date(examEndDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after exam
        status: 'SCHEDULED',
        isPublished: true,
        settings: JSON.stringify({
          proctoringLevel: 'BASIC',
          allowReview: true,
          showResults: true,
          shuffleQuestions: true,
          shuffleOptions: true,
          timeStrict: true
        }),
        instructions: '1. This exam contains 20 questions.\n2. Duration: 2 hours.\n3. Each question carries 5 marks.\n4. Do not refresh or close the browser during the exam.\n5. Ensure stable internet connection.',
        allowedDevices: JSON.stringify(['desktop', 'laptop']),
        maxAttempts: 1,
        securityLevel: 2,
        proctoringMode: 'BASIC',
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0,
        questions: {
          create: [
            {
              questionText: 'What does SQL stand for?',
              questionType: 'MULTIPLE_CHOICE',
              marks: 5,
              order: 1,
              difficulty: 1,
              options: JSON.stringify([
                { id: '1', text: 'Structured Query Language', isCorrect: true },
                { id: '2', text: 'Simple Query Language', isCorrect: false },
                { id: '3', text: 'Standard Query Language', isCorrect: false },
                { id: '4', text: 'Sequential Query Language', isCorrect: false }
              ]),
              correctAnswer: JSON.stringify(['1']),
              explanation: 'SQL stands for Structured Query Language, which is used to communicate with databases.',
              category: 'Basics',
              topic: 'SQL Introduction'
            },
            {
              questionText: 'Which of the following is NOT a valid SQL constraint?',
              questionType: 'MULTIPLE_CHOICE',
              marks: 5,
              order: 2,
              difficulty: 2,
              options: JSON.stringify([
                { id: '1', text: 'PRIMARY KEY', isCorrect: false },
                { id: '2', text: 'FOREIGN KEY', isCorrect: false },
                { id: '3', text: 'UNIQUE', isCorrect: false },
                { id: '4', text: 'JOIN', isCorrect: true }
              ]),
              correctAnswer: JSON.stringify(['4']),
              explanation: 'JOIN is a clause used to combine rows from two or more tables, not a constraint.',
              category: 'Constraints',
              topic: 'Database Constraints'
            },
            {
              questionText: 'Explain the difference between DELETE and TRUNCATE commands.',
              questionType: 'ESSAY',
              marks: 10,
              order: 3,
              difficulty: 3,
              explanation: 'DELETE is a DML command that removes rows one by one and can be rolled back. TRUNCATE is a DDL command that removes all rows instantly and cannot be rolled back.',
              category: 'Commands',
              topic: 'Data Manipulation'
            },
            {
              questionText: 'What is database normalization?',
              questionType: 'SHORT_ANSWER',
              marks: 5,
              order: 4,
              difficulty: 2,
              correctAnswer: JSON.stringify(['Process of organizing data to reduce redundancy']),
              explanation: 'Normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity.',
              category: 'Design',
              topic: 'Normalization'
            },
            {
              questionText: 'A foreign key must always reference a primary key in another table.',
              questionType: 'TRUE_FALSE',
              marks: 5,
              order: 5,
              difficulty: 1,
              options: JSON.stringify([
                { id: '1', text: 'True', isCorrect: true },
                { id: '2', text: 'False', isCorrect: false }
              ]),
              correctAnswer: JSON.stringify(['1']),
              explanation: 'A foreign key establishes a relationship between tables by referencing the primary key of another table.',
              category: 'Relations',
              topic: 'Foreign Keys'
            }
          ]
        }
      },
      include: {
        questions: true
      }
    });

    console.log(`✅ Exam created: ${exam.title} with ${exam.questions.length} questions`);

    // Create notifications for users
    const notifications = [
      {
        userId: students[0].id,
        type: 'EXAM_CREATED',
        title: 'New Exam Scheduled',
        message: 'Mid-Term Examination: Database Systems has been scheduled. Please check your exams dashboard.',
        data: JSON.stringify({ examId: exam.id })
      },
      {
        userId: lecturer.id,
        type: 'EXAM_CREATED',
        title: 'Exam Published Successfully',
        message: 'Your exam "Mid-Term Examination: Database Systems" has been published and is now visible to students.',
        data: JSON.stringify({ examId: exam.id })
      }
    ];

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification
      });
    }

    console.log('✅ Notifications created');
  } else {
    exam = existingExam;
    console.log(`ℹ️ Exam already exists, skipping creation`);
  }

  // Create system settings
  const systemSettings = [
    {
      key: 'exam.default_duration',
      value: JSON.stringify(120),
      description: 'Default exam duration in minutes',
      category: 'exams',
      isPublic: false
    },
    {
      key: 'security.max_login_attempts',
      value: JSON.stringify(5),
      description: 'Maximum failed login attempts before lockout',
      category: 'security',
      isPublic: false
    },
    {
      key: 'email.smtp_enabled',
      value: JSON.stringify(true),
      description: 'Enable/disable email notifications',
      category: 'email',
      isPublic: false
    },
    {
      key: 'proctoring.enabled',
      value: JSON.stringify(true),
      description: 'Enable proctoring features',
      category: 'proctoring',
      isPublic: true
    }
  ];

  for (const setting of systemSettings) {
    try {
      await prisma.systemSetting.create({
        data: setting
      });
      console.log(`✅ Created system setting: ${setting.key}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        // If duplicate key error, update the existing record
        await prisma.systemSetting.update({
          where: { key: setting.key },
          data: {
            value: setting.value,
            description: setting.description,
            category: setting.category,
            isPublic: setting.isPublic
          }
        });
        console.log(`↻ Updated existing system setting: ${setting.key}`);
      } else {
        throw error;
      }
    }
  }

  console.log('✅ System settings created/updated');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@example.com / Admin@123456');
  console.log('Lecturer: lecturer@example.com / Lecturer@123');
  console.log('Demo Student: student@example.com / Student@123');
  console.log('Other Students: student1@example.com / Student@123');
  console.log('                 student2@example.com / Student@123');
  console.log('                 student3@example.com / Student@123');
  console.log('\n📊 Statistics:');
  console.log(`- Users: ${1 + 1 + students.length} (1 Admin, 1 Lecturer, ${students.length} Students)`);
  console.log(`- Exams: ${exam ? 1 : 0} (${exam?.title || 'None'})`);
  console.log(`- Questions: ${exam?.questions?.length || 0} (Multiple choice, essay, short answer, true/false)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });