import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> | { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params properly
    const resolvedParams = await params;
    const examId = resolvedParams.examId;

    // Fetch exam with all related data - NO 'student' field
    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        lecturerId: session.user.id,
      },
      include: {
        lecturer: {
          include: {
            lecturerProfile: true,
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        attempts: {
          include: {
            answers: {
              include: {
                question: true,
              },
            },
            violations: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    
    // Helper function to add new page when needed
    const checkPageSpace = (spaceNeeded: number = 30) => {
      if (yPosition < 50) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
    };
    
    // Title
    page.drawText(exam.title, {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Exam details
    page.drawText(`Exam Code: ${exam.code}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`Course: ${exam.courseName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`Duration: ${exam.duration} minutes`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`Total Marks: ${exam.totalMarks}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`Passing Marks: ${exam.passingMarks}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`Start Time: ${new Date(exam.startTime).toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 20;
    
    page.drawText(`End Time: ${new Date(exam.endTime).toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    
    yPosition -= 30;
    
    // Divider
    page.drawText('─'.repeat(80), {
      x: 50,
      y: yPosition,
      size: 10,
      font,
    });
    
    yPosition -= 30;
    
    // Questions section
    page.drawText(`QUESTIONS (${exam.questions.length})`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.5),
    });
    
    yPosition -= 25;
    
    for (let i = 0; i < exam.questions.length; i++) {
      const question = exam.questions[i];
      checkPageSpace(40);
      
      page.drawText(`${i + 1}. ${question.questionText}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
      });
      
      yPosition -= 15;
      
      page.drawText(`   Marks: ${question.marks} | Type: ${question.questionType}`, {
        x: 60,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      yPosition -= 20;
    }
    
    yPosition -= 20;
    
    // Attempts section
    if (exam.attempts.length > 0) {
      checkPageSpace(40);
      
      page.drawText(`ATTEMPTS SUMMARY (${exam.attempts.length} total attempts)`, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0.5),
      });
      
      yPosition -= 25;
      
      // Calculate statistics
      const completedAttempts = exam.attempts.filter((a: { status: string; }) => a.status === 'COMPLETED' || a.status === 'SUBMITTED');
      const averageScore = completedAttempts.length > 0 
        ? completedAttempts.reduce((sum: any, a: { score: any; }) => sum + (a.score || 0), 0) / completedAttempts.length 
        : 0;
      
      page.drawText(`Total Attempts: ${exam.attempts.length}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
      });
      
      yPosition -= 18;
      
      page.drawText(`Completed Attempts: ${completedAttempts.length}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
      });
      
      yPosition -= 18;
      
      page.drawText(`Average Score: ${averageScore.toFixed(2)} / ${exam.totalMarks} (${((averageScore / exam.totalMarks) * 100).toFixed(1)}%)`, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
      });
      
      yPosition -= 18;
      
      const violationCount = exam.attempts.reduce((sum: any, a: { violationCount: any; }) => sum + (a.violationCount || 0), 0);
      page.drawText(`Total Violations: ${violationCount}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
        color: violationCount > 0 ? rgb(1, 0, 0) : rgb(0, 0.5, 0),
      });
      
      yPosition -= 30;
      
      // Individual attempts (first 20)
      page.drawText(`Recent Attempts:`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      
      yPosition -= 20;
      
      const attemptsToShow = exam.attempts.slice(0, 20);
      
      for (const attempt of attemptsToShow) {
        checkPageSpace(15);
        
        const date = new Date(attempt.createdAt).toLocaleDateString();
        const scoreText = attempt.score !== null 
          ? `${attempt.score}/${attempt.totalMarks} (${((attempt.score / attempt.totalMarks) * 100).toFixed(0)}%)` 
          : 'Not graded';
        const statusText = attempt.status;
        
        page.drawText(`• ${date} - Score: ${scoreText} - Status: ${statusText} - Violations: ${attempt.violationCount}`, {
          x: 50,
          y: yPosition,
          size: 9,
          font,
        });
        
        yPosition -= 15;
      }
      
      if (exam.attempts.length > 20) {
        page.drawText(`... and ${exam.attempts.length - 20} more attempts`, {
          x: 50,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    
    // Footer
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const lastPageHeight = lastPage.getSize().height;
    
    lastPage.drawText(`Generated on ${new Date().toLocaleString()}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    const pdfBytes = await pdfDoc.save();
    
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="exam-${exam.code}-report.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}