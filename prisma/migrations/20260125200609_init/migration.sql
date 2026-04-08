BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] VARCHAR(255) NOT NULL,
    [password] VARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [role] VARCHAR(20) NOT NULL CONSTRAINT [Users_role_df] DEFAULT 'STUDENT',
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Users_status_df] DEFAULT 'ACTIVE',
    [avatarUrl] VARCHAR(500),
    [phone] VARCHAR(20),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [lastLoginAt] DATETIME2,
    [lastActiveAt] DATETIME2,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[StudentProfiles] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [studentId] VARCHAR(50) NOT NULL,
    [rollNumber] VARCHAR(50),
    [department] NVARCHAR(100) NOT NULL,
    [program] NVARCHAR(100) NOT NULL,
    [batch] INT NOT NULL,
    [semester] INT NOT NULL,
    [admissionYear] INT NOT NULL,
    [totalExamsTaken] INT NOT NULL CONSTRAINT [StudentProfiles_totalExamsTaken_df] DEFAULT 0,
    [completedExams] INT NOT NULL CONSTRAINT [StudentProfiles_completedExams_df] DEFAULT 0,
    [averageScore] FLOAT(53) NOT NULL CONSTRAINT [StudentProfiles_averageScore_df] DEFAULT 0,
    [totalViolations] INT NOT NULL CONSTRAINT [StudentProfiles_totalViolations_df] DEFAULT 0,
    [rank] INT,
    [emergencyContact] VARCHAR(20),
    [address] NVARCHAR(max),
    [metaData] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [StudentProfiles_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [StudentProfiles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [StudentProfiles_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [StudentProfiles_studentId_key] UNIQUE NONCLUSTERED ([studentId])
);

-- CreateTable
CREATE TABLE [dbo].[LecturerProfiles] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [employeeId] VARCHAR(50) NOT NULL,
    [department] NVARCHAR(100) NOT NULL,
    [faculty] NVARCHAR(100) NOT NULL,
    [designation] NVARCHAR(100) NOT NULL,
    [qualification] NVARCHAR(200),
    [specialization] NVARCHAR(200),
    [totalExamsCreated] INT NOT NULL CONSTRAINT [LecturerProfiles_totalExamsCreated_df] DEFAULT 0,
    [activeExams] INT NOT NULL CONSTRAINT [LecturerProfiles_activeExams_df] DEFAULT 0,
    [totalStudents] INT NOT NULL CONSTRAINT [LecturerProfiles_totalStudents_df] DEFAULT 0,
    [averageRating] FLOAT(53) NOT NULL CONSTRAINT [LecturerProfiles_averageRating_df] DEFAULT 0,
    [officeHours] NVARCHAR(max),
    [officeLocation] NVARCHAR(200),
    [officePhone] VARCHAR(20),
    [website] VARCHAR(500),
    [metaData] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LecturerProfiles_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LecturerProfiles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LecturerProfiles_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [LecturerProfiles_employeeId_key] UNIQUE NONCLUSTERED ([employeeId])
);

-- CreateTable
CREATE TABLE [dbo].[AdminProfiles] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [permissions] NVARCHAR(max) NOT NULL CONSTRAINT [AdminProfiles_permissions_df] DEFAULT '[]',
    [accessLevel] INT NOT NULL CONSTRAINT [AdminProfiles_accessLevel_df] DEFAULT 1,
    [adminType] NVARCHAR(50) NOT NULL CONSTRAINT [AdminProfiles_adminType_df] DEFAULT 'SUPER_ADMIN',
    [assignedDepartments] NVARCHAR(max),
    [metaData] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AdminProfiles_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AdminProfiles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AdminProfiles_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Sessions] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [sessionToken] VARCHAR(500) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [ipAddress] VARCHAR(45),
    [userAgent] NVARCHAR(500),
    [deviceInfo] NVARCHAR(max),
    [isActive] BIT NOT NULL CONSTRAINT [Sessions_isActive_df] DEFAULT 1,
    [lastActivityAt] DATETIME2 NOT NULL CONSTRAINT [Sessions_lastActivityAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Sessions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Sessions_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[Exams] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(500) NOT NULL,
    [description] NVARCHAR(max),
    [code] VARCHAR(20) NOT NULL,
    [shortCode] VARCHAR(10) NOT NULL,
    [lecturerId] NVARCHAR(1000) NOT NULL,
    [courseCode] VARCHAR(50) NOT NULL,
    [courseName] NVARCHAR(200) NOT NULL,
    [duration] INT NOT NULL,
    [totalMarks] INT NOT NULL,
    [passingMarks] INT NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [endTime] DATETIME2 NOT NULL,
    [resultPublishAt] DATETIME2,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Exams_status_df] DEFAULT 'DRAFT',
    [isPublished] BIT NOT NULL CONSTRAINT [Exams_isPublished_df] DEFAULT 0,
    [isArchived] BIT NOT NULL CONSTRAINT [Exams_isArchived_df] DEFAULT 0,
    [settings] NVARCHAR(max),
    [instructions] NVARCHAR(max),
    [allowedDevices] NVARCHAR(max),
    [maxAttempts] INT NOT NULL CONSTRAINT [Exams_maxAttempts_df] DEFAULT 1,
    [securityLevel] INT NOT NULL CONSTRAINT [Exams_securityLevel_df] DEFAULT 1,
    [proctoringMode] NVARCHAR(50) NOT NULL CONSTRAINT [Exams_proctoringMode_df] DEFAULT 'NONE',
    [totalAttempts] INT NOT NULL CONSTRAINT [Exams_totalAttempts_df] DEFAULT 0,
    [avgScore] FLOAT(53) CONSTRAINT [Exams_avgScore_df] DEFAULT 0,
    [passRate] FLOAT(53) CONSTRAINT [Exams_passRate_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Exams_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [publishedAt] DATETIME2,
    CONSTRAINT [Exams_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Exams_code_key] UNIQUE NONCLUSTERED ([code]),
    CONSTRAINT [Exams_shortCode_key] UNIQUE NONCLUSTERED ([shortCode])
);

-- CreateTable
CREATE TABLE [dbo].[Questions] (
    [id] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000) NOT NULL,
    [questionText] NVARCHAR(max) NOT NULL,
    [questionType] VARCHAR(30) NOT NULL CONSTRAINT [Questions_questionType_df] DEFAULT 'MULTIPLE_CHOICE',
    [marks] INT NOT NULL CONSTRAINT [Questions_marks_df] DEFAULT 1,
    [order] INT NOT NULL CONSTRAINT [Questions_order_df] DEFAULT 0,
    [difficulty] INT NOT NULL CONSTRAINT [Questions_difficulty_df] DEFAULT 1,
    [options] NVARCHAR(max),
    [correctAnswer] NVARCHAR(max),
    [explanation] NVARCHAR(max),
    [imageUrl] VARCHAR(500),
    [audioUrl] VARCHAR(500),
    [videoUrl] VARCHAR(500),
    [tags] NVARCHAR(max),
    [category] NVARCHAR(100),
    [topic] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Questions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Questions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExamAttempts] (
    [id] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [attemptNumber] INT NOT NULL CONSTRAINT [ExamAttempts_attemptNumber_df] DEFAULT 1,
    [startedAt] DATETIME2 NOT NULL CONSTRAINT [ExamAttempts_startedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [submittedAt] DATETIME2,
    [timeSpent] INT NOT NULL CONSTRAINT [ExamAttempts_timeSpent_df] DEFAULT 0,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [ExamAttempts_status_df] DEFAULT 'NOT_STARTED',
    [score] FLOAT(53),
    [totalMarks] INT NOT NULL,
    [percentage] FLOAT(53),
    [grade] NVARCHAR(10),
    [rank] INT,
    [ipAddress] VARCHAR(45),
    [userAgent] NVARCHAR(500),
    [deviceInfo] NVARCHAR(max),
    [browserInfo] NVARCHAR(max),
    [violationCount] INT NOT NULL CONSTRAINT [ExamAttempts_violationCount_df] DEFAULT 0,
    [isFlagged] BIT NOT NULL CONSTRAINT [ExamAttempts_isFlagged_df] DEFAULT 0,
    [isTerminated] BIT NOT NULL CONSTRAINT [ExamAttempts_isTerminated_df] DEFAULT 0,
    [terminationReason] NVARCHAR(500),
    [proctoringData] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ExamAttempts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ExamAttempts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ExamAttempts_examId_studentId_attemptNumber_key] UNIQUE NONCLUSTERED ([examId],[studentId],[attemptNumber])
);

-- CreateTable
CREATE TABLE [dbo].[Answers] (
    [id] NVARCHAR(1000) NOT NULL,
    [attemptId] NVARCHAR(1000) NOT NULL,
    [questionId] NVARCHAR(1000) NOT NULL,
    [answerText] NVARCHAR(max),
    [selectedOptions] NVARCHAR(max),
    [isCorrect] BIT,
    [marksAwarded] FLOAT(53) NOT NULL CONSTRAINT [Answers_marksAwarded_df] DEFAULT 0,
    [feedback] NVARCHAR(max),
    [autoGraded] BIT NOT NULL CONSTRAINT [Answers_autoGraded_df] DEFAULT 0,
    [timeSpent] INT,
    [answeredAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Answers_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Answers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Answers_attemptId_questionId_key] UNIQUE NONCLUSTERED ([attemptId],[questionId])
);

-- CreateTable
CREATE TABLE [dbo].[ExamViolations] (
    [id] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000) NOT NULL,
    [studentId] NVARCHAR(1000) NOT NULL,
    [attemptId] NVARCHAR(1000),
    [violationType] VARCHAR(30) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [severity] VARCHAR(20) NOT NULL CONSTRAINT [ExamViolations_severity_df] DEFAULT 'MEDIUM',
    [evidence] NVARCHAR(max),
    [actionTaken] NVARCHAR(100),
    [isReviewed] BIT NOT NULL CONSTRAINT [ExamViolations_isReviewed_df] DEFAULT 0,
    [reviewedBy] NVARCHAR(1000),
    [reviewNotes] NVARCHAR(max),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [ExamViolations_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ExamViolations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ExamLogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000) NOT NULL,
    [attemptId] NVARCHAR(1000),
    [studentId] NVARCHAR(1000),
    [action] NVARCHAR(100) NOT NULL,
    [details] NVARCHAR(max),
    [ipAddress] VARCHAR(45),
    [userAgent] NVARCHAR(500),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [ExamLogs_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ExamLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [examId] NVARCHAR(1000),
    [type] VARCHAR(30) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [message] NVARCHAR(max) NOT NULL,
    [data] NVARCHAR(max),
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Notifications_status_df] DEFAULT 'UNREAD',
    [isImportant] BIT NOT NULL CONSTRAINT [Notifications_isImportant_df] DEFAULT 0,
    [isArchived] BIT NOT NULL CONSTRAINT [Notifications_isArchived_df] DEFAULT 0,
    [actionUrl] VARCHAR(500),
    [actionLabel] NVARCHAR(100),
    [expiresAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notifications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [readAt] DATETIME2,
    CONSTRAINT [Notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [action] NVARCHAR(100) NOT NULL,
    [entityType] NVARCHAR(50) NOT NULL,
    [entityId] NVARCHAR(1000),
    [oldData] NVARCHAR(max),
    [newData] NVARCHAR(max),
    [changes] NVARCHAR(max),
    [ipAddress] VARCHAR(45),
    [userAgent] NVARCHAR(500),
    [location] NVARCHAR(max),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [AuditLogs_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [senderId] NVARCHAR(1000) NOT NULL,
    [recipientId] NVARCHAR(1000) NOT NULL,
    [subject] NVARCHAR(200),
    [content] NVARCHAR(max) NOT NULL,
    [attachments] NVARCHAR(max),
    [isRead] BIT NOT NULL CONSTRAINT [Messages_isRead_df] DEFAULT 0,
    [isArchived] BIT NOT NULL CONSTRAINT [Messages_isArchived_df] DEFAULT 0,
    [isImportant] BIT NOT NULL CONSTRAINT [Messages_isImportant_df] DEFAULT 0,
    [parentId] NVARCHAR(1000),
    [threadId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [readAt] DATETIME2,
    CONSTRAINT [Messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[SystemSettings] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] VARCHAR(100) NOT NULL,
    [value] NVARCHAR(max) NOT NULL,
    [description] NVARCHAR(500),
    [category] NVARCHAR(50) NOT NULL,
    [isPublic] BIT NOT NULL CONSTRAINT [SystemSettings_isPublic_df] DEFAULT 0,
    [updatedBy] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SystemSettings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [SystemSettings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [SystemSettings_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_User_Email] ON [dbo].[Users]([email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_User_Role] ON [dbo].[Users]([role]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_User_Status] ON [dbo].[Users]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_StudentProfile_StudentId] ON [dbo].[StudentProfiles]([studentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_LecturerProfile_EmployeeId] ON [dbo].[LecturerProfiles]([employeeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Session_UserId] ON [dbo].[Sessions]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Exam_LecturerId] ON [dbo].[Exams]([lecturerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Exam_Code] ON [dbo].[Exams]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Exam_Status] ON [dbo].[Exams]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Question_ExamId] ON [dbo].[Questions]([examId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ExamAttempt_ExamId] ON [dbo].[ExamAttempts]([examId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ExamAttempt_StudentId] ON [dbo].[ExamAttempts]([studentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Answer_AttemptId] ON [dbo].[Answers]([attemptId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ExamViolation_ExamId] ON [dbo].[ExamViolations]([examId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ExamViolation_StudentId] ON [dbo].[ExamViolations]([studentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ExamLog_ExamId] ON [dbo].[ExamLogs]([examId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Notification_UserId] ON [dbo].[Notifications]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Notification_Type] ON [dbo].[Notifications]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_AuditLog_UserId] ON [dbo].[AuditLogs]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_AuditLog_Action] ON [dbo].[AuditLogs]([action]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Message_SenderId] ON [dbo].[Messages]([senderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Message_RecipientId] ON [dbo].[Messages]([recipientId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_SystemSetting_Key] ON [dbo].[SystemSettings]([key]);

-- AddForeignKey
ALTER TABLE [dbo].[StudentProfiles] ADD CONSTRAINT [StudentProfiles_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LecturerProfiles] ADD CONSTRAINT [LecturerProfiles_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AdminProfiles] ADD CONSTRAINT [AdminProfiles_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Sessions] ADD CONSTRAINT [Sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Exams] ADD CONSTRAINT [Exams_lecturerId_fkey] FOREIGN KEY ([lecturerId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Questions] ADD CONSTRAINT [Questions_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[Exams]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ExamAttempts] ADD CONSTRAINT [ExamAttempts_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[Exams]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Answers] ADD CONSTRAINT [Answers_attemptId_fkey] FOREIGN KEY ([attemptId]) REFERENCES [dbo].[ExamAttempts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Answers] ADD CONSTRAINT [Answers_questionId_fkey] FOREIGN KEY ([questionId]) REFERENCES [dbo].[Questions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExamViolations] ADD CONSTRAINT [ExamViolations_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[Exams]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ExamLogs] ADD CONSTRAINT [ExamLogs_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[Exams]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
