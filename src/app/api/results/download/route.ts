import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: Request) {
  try {
    console.log('📥 PDF download request received');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email, session?.user?.role);

    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    // Fetch exam data
    const exam = await prisma.exam.findUnique({
      where: { 
        id: examId,
        lecturerId: session.user.id
      },
      include: {
        lecturer: {
          include: { lecturerProfile: true }
        },
        questions: { orderBy: { order: 'asc' } },
        attempts: {
          include: { answers: { include: { question: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Fetch violations separately
    const attemptsWithViolations = await Promise.all(
      exam.attempts.map(async (attempt) => {
        const violations = await prisma.examViolation.findMany({
          where: { attemptId: attempt.id },
        });
        return { ...attempt, violations };
      })
    );

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    let y = height - 50;

    const addLine = (text: string, size: number = 10, bold: boolean = false, x: number = 50) => {
      if (y < 50) {
        page = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(text, { x, y, size, font: bold ? boldFont : font });
      y -= size + 5;
    };

    // Header
    addLine('Exam Results Report', 20, true);
    y -= 10;
    
    addLine(exam.title, 14, true);
    addLine(`Code: ${exam.code}`);
    addLine(`Date: ${new Date(exam.startTime).toLocaleDateString()}`);
    addLine(`Duration: ${exam.duration} minutes`);
    addLine(`Total Marks: ${exam.totalMarks}`);
    addLine(`Passing Marks: ${exam.passingMarks}`);
    y -= 10;

    // Lecturer
    addLine('Lecturer Information', 12, true);
    addLine(`Name: ${exam.lecturer.name || exam.lecturer.email}`);
    addLine(`Email: ${exam.lecturer.email}`);
    addLine(`Department: ${exam.lecturer.lecturerProfile?.department || 'Not specified'}`);
    y -= 10;

    // Statistics
    const total = attemptsWithViolations.length;
    const completed = attemptsWithViolations.filter(a => ['COMPLETED', 'SUBMITTED'].includes(a.status)).length;
    const passed = attemptsWithViolations.filter(a => 
      ['COMPLETED', 'SUBMITTED'].includes(a.status) && a.score >= (exam.passingMarks || 0)
    ).length;
    const avg = total > 0 ? (attemptsWithViolations.reduce((s, a) => s + (a.score || 0), 0) / total).toFixed(1) : 0;

    addLine('Statistics Summary', 12, true);
    addLine(`Total Attempts: ${total}`);
    addLine(`Completed: ${completed}`);
    addLine(`Passed: ${passed}`);
    addLine(`Pass Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
    addLine(`Average Score: ${avg}%`);
    y -= 10;

    // Results table
    if (attemptsWithViolations.length > 0) {
      addLine('Student Results', 12, true);
      y -= 5;
      
      // Headers
      page.drawText('Student ID', { x: 50, y: y + 5, size: 9, font: boldFont });
      page.drawText('Score', { x: 200, y: y + 5, size: 9, font: boldFont });
      page.drawText('Status', { x: 280, y: y + 5, size: 9, font: boldFont });
      page.drawText('%', { x: 360, y: y + 5, size: 9, font: boldFont });
      page.drawText('Violations', { x: 520, y: y + 5, size: 9, font: boldFont });
      y -= 20;

      attemptsWithViolations.forEach(attempt => {
        if (y < 50) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
        
        page.drawText(attempt.studentId?.substring(0, 20) || 'N/A', { x: 50, y, size: 8, font });
        page.drawText(String(attempt.score || 0), { x: 200, y, size: 8, font });
        page.drawText(attempt.status, { x: 280, y, size: 8, font });
        page.drawText(exam.totalMarks ? `${((attempt.score / exam.totalMarks) * 100).toFixed(0)}%` : '0%', { x: 360, y, size: 8, font });
        page.drawText(String(attempt.violations?.length || 0), { x: 520, y, size: 8, font });
        y -= 15;
      });
    } else {
      addLine('No submissions yet for this exam.', 12);
    }

    // Footer
    const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
    lastPage.drawText(`Generated on ${new Date().toLocaleString()}`, {
      x: 50, y: 30, size: 8, font, color: rgb(0.5, 0.5, 0.5)
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `${exam.title.replace(/[^a-z0-9]/gi, '_')}_results.pdf`;

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}