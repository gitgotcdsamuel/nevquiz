/*
  Warnings:

  - You are about to drop the column `lastHeartbeat` on the `ExamAttempts` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ExamAttempts] DROP COLUMN [lastHeartbeat];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
