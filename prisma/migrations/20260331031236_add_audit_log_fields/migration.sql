/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `AuditLogs` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AuditLogs] ALTER COLUMN [entityType] NVARCHAR(50) NULL;
ALTER TABLE [dbo].[AuditLogs] DROP COLUMN [ipAddress];
ALTER TABLE [dbo].[AuditLogs] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[description] NVARCHAR(max),
[ip] VARCHAR(45),
[metadata] NVARCHAR(max),
[severity] VARCHAR(20) CONSTRAINT [AuditLogs_severity_df] DEFAULT 'low',
[status] VARCHAR(20) CONSTRAINT [AuditLogs_status_df] DEFAULT 'success',
[updatedAt] DATETIME2;

-- CreateTable
CREATE TABLE [dbo].[courses] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [code] VARCHAR(50) NOT NULL,
    [description] NVARCHAR(max),
    [credits] INT,
    [department] NVARCHAR(100),
    [semester] INT,
    [isActive] BIT NOT NULL CONSTRAINT [courses_isActive_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [courses_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [courses_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [courses_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[announcements] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [targetAudience] NVARCHAR(1000) NOT NULL,
    [course_id] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [announcements_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [expires_at] DATETIME2,
    [created_by] NVARCHAR(1000) NOT NULL,
    [is_active] BIT NOT NULL CONSTRAINT [announcements_is_active_df] DEFAULT 1,
    CONSTRAINT [announcements_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Course_Code] ON [dbo].[courses]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_AuditLog_Status] ON [dbo].[AuditLogs]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_AuditLog_Severity] ON [dbo].[AuditLogs]([severity]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_AuditLog_Timestamp] ON [dbo].[AuditLogs]([timestamp]);

-- AddForeignKey
ALTER TABLE [dbo].[announcements] ADD CONSTRAINT [announcements_course_id_fkey] FOREIGN KEY ([course_id]) REFERENCES [dbo].[courses]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[announcements] ADD CONSTRAINT [announcements_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Exams] ADD CONSTRAINT [Exams_courseCode_fkey] FOREIGN KEY ([courseCode]) REFERENCES [dbo].[courses]([code]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLogs] ADD CONSTRAINT [AuditLogs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
