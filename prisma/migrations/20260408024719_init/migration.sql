-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(500) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" VARCHAR(500),
    "phone" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "credits" INTEGER,
    "department" VARCHAR(100),
    "semester" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "course_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" VARCHAR(50) NOT NULL,
    "rollNumber" VARCHAR(50),
    "department" VARCHAR(100) NOT NULL,
    "program" VARCHAR(100) NOT NULL,
    "batch" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "totalExamsTaken" INTEGER NOT NULL DEFAULT 0,
    "completedExams" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalViolations" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "emergencyContact" VARCHAR(20),
    "address" TEXT,
    "metaData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturerProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" VARCHAR(50) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "faculty" VARCHAR(100) NOT NULL,
    "designation" VARCHAR(100) NOT NULL,
    "qualification" VARCHAR(200),
    "specialization" VARCHAR(200),
    "totalExamsCreated" INTEGER NOT NULL DEFAULT 0,
    "activeExams" INTEGER NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "officeHours" TEXT,
    "officeLocation" VARCHAR(200),
    "officePhone" VARCHAR(20),
    "website" VARCHAR(500),
    "metaData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LecturerProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "accessLevel" INTEGER NOT NULL DEFAULT 1,
    "adminType" VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
    "assignedDepartments" TEXT,
    "metaData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" VARCHAR(500) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "deviceInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exams" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "code" VARCHAR(20) NOT NULL,
    "shortCode" VARCHAR(10) NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "courseCode" VARCHAR(50) NOT NULL,
    "courseName" VARCHAR(200) NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "passingMarks" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "resultPublishAt" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT,
    "instructions" TEXT,
    "allowedDevices" TEXT,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "securityLevel" INTEGER NOT NULL DEFAULT 1,
    "proctoringMode" VARCHAR(50) NOT NULL DEFAULT 'NONE',
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION DEFAULT 0,
    "passRate" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" VARCHAR(30) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "marks" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "options" TEXT,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "imageUrl" VARCHAR(500),
    "audioUrl" VARCHAR(500),
    "videoUrl" VARCHAR(500),
    "tags" TEXT,
    "category" VARCHAR(100),
    "topic" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "totalMarks" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION,
    "grade" VARCHAR(10),
    "rank" INTEGER,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "deviceInfo" TEXT,
    "browserInfo" TEXT,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isTerminated" BOOLEAN NOT NULL DEFAULT false,
    "terminationReason" VARCHAR(500),
    "proctoringData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptions" TEXT,
    "isCorrect" BOOLEAN,
    "marksAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "autoGraded" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamViolations" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptId" TEXT,
    "violationType" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "evidence" TEXT,
    "actionTaken" VARCHAR(100),
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamViolations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamLogs" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "attemptId" TEXT,
    "studentId" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" VARCHAR(500),
    "actionLabel" VARCHAR(100),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "entityType" VARCHAR(100),
    "entityId" VARCHAR(255),
    "metadata" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" VARCHAR(200),
    "content" TEXT NOT NULL,
    "attachments" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "threadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" VARCHAR(500),
    "category" VARCHAR(50) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "IDX_User_Email" ON "Users"("email");

-- CreateIndex
CREATE INDEX "IDX_User_Role" ON "Users"("role");

-- CreateIndex
CREATE INDEX "IDX_User_Status" ON "Users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE INDEX "IDX_Course_Code" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfiles_userId_key" ON "StudentProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfiles_studentId_key" ON "StudentProfiles"("studentId");

-- CreateIndex
CREATE INDEX "IDX_StudentProfile_StudentId" ON "StudentProfiles"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturerProfiles_userId_key" ON "LecturerProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturerProfiles_employeeId_key" ON "LecturerProfiles"("employeeId");

-- CreateIndex
CREATE INDEX "IDX_LecturerProfile_EmployeeId" ON "LecturerProfiles"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfiles_userId_key" ON "AdminProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_sessionToken_key" ON "Sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "IDX_Session_UserId" ON "Sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exams_code_key" ON "Exams"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Exams_shortCode_key" ON "Exams"("shortCode");

-- CreateIndex
CREATE INDEX "IDX_Exam_LecturerId" ON "Exams"("lecturerId");

-- CreateIndex
CREATE INDEX "IDX_Exam_Code" ON "Exams"("code");

-- CreateIndex
CREATE INDEX "IDX_Exam_Status" ON "Exams"("status");

-- CreateIndex
CREATE INDEX "IDX_Question_ExamId" ON "Questions"("examId");

-- CreateIndex
CREATE INDEX "IDX_ExamAttempt_ExamId" ON "ExamAttempts"("examId");

-- CreateIndex
CREATE INDEX "IDX_ExamAttempt_StudentId" ON "ExamAttempts"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttempts_examId_studentId_attemptNumber_key" ON "ExamAttempts"("examId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "IDX_Answer_AttemptId" ON "Answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Answers_attemptId_questionId_key" ON "Answers"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "IDX_ExamViolation_ExamId" ON "ExamViolations"("examId");

-- CreateIndex
CREATE INDEX "IDX_ExamViolation_StudentId" ON "ExamViolations"("studentId");

-- CreateIndex
CREATE INDEX "IDX_ExamLog_ExamId" ON "ExamLogs"("examId");

-- CreateIndex
CREATE INDEX "IDX_Notification_UserId" ON "Notifications"("userId");

-- CreateIndex
CREATE INDEX "IDX_Notification_Type" ON "Notifications"("type");

-- CreateIndex
CREATE INDEX "IDX_AuditLog_UserId" ON "AuditLogs"("userId");

-- CreateIndex
CREATE INDEX "IDX_AuditLog_Action" ON "AuditLogs"("action");

-- CreateIndex
CREATE INDEX "IDX_AuditLog_CreatedAt" ON "AuditLogs"("createdAt");

-- CreateIndex
CREATE INDEX "IDX_AuditLog_Entity" ON "AuditLogs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "IDX_Message_SenderId" ON "Messages"("senderId");

-- CreateIndex
CREATE INDEX "IDX_Message_RecipientId" ON "Messages"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "IDX_SystemSetting_Key" ON "SystemSettings"("key");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfiles" ADD CONSTRAINT "StudentProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturerProfiles" ADD CONSTRAINT "LecturerProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfiles" ADD CONSTRAINT "AdminProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "courses"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempts" ADD CONSTRAINT "ExamAttempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ExamViolations" ADD CONSTRAINT "ExamViolations_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamLogs" ADD CONSTRAINT "ExamLogs_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogs" ADD CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
