"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  Sparkles,
  AlertCircle,
  Bell,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ExamResult {
  id: string;
  examTitle: string;
  course: string;
  courseCode: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'passed' | 'failed';
  duration: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  rank?: number;
  classAverage: number;
  instructor: string;
}

export default function StudentResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);
  const [user, setUser] = useState({
    name: 'John Student',
    email: 'john.student@university.edu',
    role: 'STUDENT'
  });

  // Mock data - Replace with API call
  const [results, setResults] = useState<ExamResult[]>([
    {
      id: '1',
      examTitle: 'Final Examination - Semester 1',
      course: 'Mathematics',
      courseCode: 'MATH101',
      date: '2024-01-15T10:30:00',
      score: 85,
      totalMarks: 100,
      percentage: 85,
      grade: 'A',
      status: 'passed',
      duration: 120,
      timeSpent: 105,
      correctAnswers: 42,
      totalQuestions: 50,
      rank: 3,
      classAverage: 72,
      instructor: 'Dr. Sarah Williams'
    },
    {
      id: '2',
      examTitle: 'Mid-Term Assessment',
      course: 'Physics',
      courseCode: 'PHY201',
      date: '2024-01-20T14:00:00',
      score: 92,
      totalMarks: 100,
      percentage: 92,
      grade: 'A+',
      status: 'passed',
      duration: 90,
      timeSpent: 85,
      correctAnswers: 46,
      totalQuestions: 50,
      rank: 1,
      classAverage: 78,
      instructor: 'Prof. Robert Davis'
    },
    {
      id: '3',
      examTitle: 'Weekly Quiz - Week 5',
      course: 'Chemistry',
      courseCode: 'CHEM101',
      date: '2024-01-10T09:15:00',
      score: 65,
      totalMarks: 100,
      percentage: 65,
      grade: 'C',
      status: 'passed',
      duration: 45,
      timeSpent: 40,
      correctAnswers: 13,
      totalQuestions: 20,
      rank: 15,
      classAverage: 68,
      instructor: 'Dr. Michael Chen'
    },
    {
      id: '4',
      examTitle: 'Practical Examination',
      course: 'Computer Science',
      courseCode: 'CSC301',
      date: '2024-01-25T11:45:00',
      score: 78,
      totalMarks: 100,
      percentage: 78,
      grade: 'B+',
      status: 'passed',
      duration: 180,
      timeSpent: 165,
      correctAnswers: 39,
      totalQuestions: 50,
      rank: 8,
      classAverage: 75,
      instructor: 'Prof. James Wilson'
    },
    {
      id: '5',
      examTitle: 'Literature Analysis Test',
      course: 'English',
      courseCode: 'ENG201',
      date: '2024-01-18T13:30:00',
      score: 42,
      totalMarks: 100,
      percentage: 42,
      grade: 'F',
      status: 'failed',
      duration: 90,
      timeSpent: 90,
      correctAnswers: 21,
      totalQuestions: 50,
      rank: 28,
      classAverage: 65,
      instructor: 'Dr. Emily Johnson'
    }
  ]);

  // Statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => r.status === 'passed').length;
  const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalExams;
  const highestScore = Math.max(...results.map(r => r.percentage));
  const lowestScore = Math.min(...results.map(r => r.percentage));
  const totalTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const overallAccuracy = (totalCorrect / totalQuestions) * 100;

  // Get unique courses for filter
  const courses = ['all', ...new Set(results.map(r => r.course))];

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      const matchesSearch = result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'all' || result.course === filterCourse;
      const matchesStatus = filterStatus === 'all' || result.status === filterStatus;

      return matchesSearch && matchesCourse && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'score':
          comparison = b.percentage - a.percentage;
          break;
        case 'course':
          comparison = a.course.localeCompare(b.course);
          break;
        case 'title':
          comparison = a.examTitle.localeCompare(b.examTitle);
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-50 text-green-700 border-green-100',
      'B+': 'bg-blue-100 text-blue-800 border-blue-200',
      'B': 'bg-blue-50 text-blue-700 border-blue-100',
      'C+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return gradeColors[grade] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // ✅ PDF Export Function for individual exam
  const exportExamToPDF = async (result: ExamResult) => {
    setDownloadingExamId(result.id);
    
    try {
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
      addLine('Individual Exam Results Report', 20, true);
      y -= 10;
      addLine(`Student: ${user.name}`, 12);
      addLine(`Email: ${user.email}`, 10);
      addLine(`Generated: ${format(new Date(), 'MMMM dd, yyyy hh:mm a')}`, 10);
      y -= 15;

      // Divider
      page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 550, y: y + 5 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 15;

      // Exam Title
      addLine(result.examTitle, 16, true);
      y -= 5;
      addLine(`${result.course} (${result.courseCode})`, 11);
      addLine(`Instructor: ${result.instructor}`, 10);
      addLine(`Date: ${format(new Date(result.date), 'MMMM dd, yyyy hh:mm a')}`, 10);
      y -= 10;

      // Score Summary Card
      addLine('Score Summary', 14, true);
      addLine(`Score: ${result.score} / ${result.totalMarks} (${result.percentage}%)`, 11);
      addLine(`Grade: ${result.grade}`, 11);
      addLine(`Status: ${result.status.toUpperCase()}`, 11);
      addLine(`Class Average: ${result.classAverage}%`, 11);
      if (result.rank) {
        addLine(`Rank in Class: #${result.rank}`, 11);
      }
      y -= 10;

      // Performance Details
      addLine('Performance Details', 14, true);
      addLine(`Correct Answers: ${result.correctAnswers} / ${result.totalQuestions}`, 11);
      addLine(`Accuracy: ${((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%`, 11);
      addLine(`Time Spent: ${result.timeSpent} / ${result.duration} minutes`, 11);
      addLine(`Time Efficiency: ${((result.timeSpent / result.duration) * 100).toFixed(1)}%`, 11);
      y -= 10;

      // Performance Bar
      const barWidth = 400;
      const barHeight = 20;
      const barX = 50;
      const barY = y;
      
      page.drawRectangle({ x: barX, y: barY, width: barWidth, height: barHeight, color: rgb(0.9, 0.9, 0.9) });
      page.drawRectangle({ 
        x: barX, 
        y: barY, 
        width: (result.percentage / 100) * barWidth, 
        height: barHeight, 
        color: result.percentage >= 80 ? rgb(0.2, 0.8, 0.2) : result.percentage >= 60 ? rgb(0.2, 0.5, 0.9) : rgb(0.9, 0.3, 0.3) 
      });
      
      page.drawText(`${result.percentage}%`, { x: barX + barWidth + 10, y: barY + 5, size: 10, font: boldFont });
      y -= 35;

      // Comparison with Class
      addLine('Comparison with Class Average', 14, true);
      
      const classBarWidth = 400;
      const classBarX = 50;
      const classBarY = y;
      
      page.drawRectangle({ x: classBarX, y: classBarY, width: classBarWidth, height: barHeight, color: rgb(0.9, 0.9, 0.9) });
      page.drawRectangle({ 
        x: classBarX, 
        y: classBarY, 
        width: (result.classAverage / 100) * classBarWidth, 
        height: barHeight, 
        color: rgb(0.5, 0.5, 0.8) 
      });
      
      page.drawText(`Class Avg: ${result.classAverage}%`, { x: classBarX + classBarWidth + 10, y: classBarY + 5, size: 10, font: font });
      y -= 35;

      // Comparison indicator
      const difference = result.percentage - result.classAverage;
      const comparisonText = difference >= 0 ? `+${difference}% above class average` : `${difference}% below class average`;
      const comparisonColor = difference >= 0 ? rgb(0.2, 0.8, 0.2) : rgb(0.9, 0.3, 0.3);
      page.drawText(comparisonText, { x: 50, y: y, size: 11, font: boldFont, color: comparisonColor });
      y -= 25;

      // Performance Message
      addLine('Performance Assessment', 14, true);
      
      let message = '';
      if (result.percentage >= 90) {
        message = 'Outstanding performance! You have demonstrated exceptional understanding of the material.';
      } else if (result.percentage >= 80) {
        message = 'Excellent work! Keep up the good study habits.';
      } else if (result.percentage >= 70) {
        message = 'Good job! Review the areas where you lost points for improvement.';
      } else if (result.percentage >= 60) {
        message = 'Satisfactory performance. Consider additional practice in challenging topics.';
      } else if (result.percentage >= 50) {
        message = 'Needs improvement. Schedule a meeting with your instructor to discuss strategies.';
      } else {
        message = 'Requires significant improvement. Please reach out to your instructor for additional support.';
      }
      
      addLine(message, 10);
      y -= 10;

      // Recommendations
      addLine('Recommendations', 12, true);
      
      if (result.correctAnswers / result.totalQuestions < 0.7) {
        addLine('• Review the questions you answered incorrectly', 10);
        addLine('• Practice similar problems before the next exam', 10);
      }
      
      if (result.timeSpent > result.duration * 0.9) {
        addLine('• Work on time management strategies', 10);
        addLine('• Take timed practice tests to improve speed', 10);
      }
      
      if (result.percentage < result.classAverage) {
        addLine('• Join study groups to learn from peers', 10);
        addLine('• Attend office hours for additional help', 10);
      }
      
      if (result.percentage >= result.classAverage && result.percentage < 80) {
        addLine('• Continue your current study habits', 10);
        addLine('• Focus on challenging topics for improvement', 10);
      }

      y -= 15;

      // Footer
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      lastPage.drawText(`Generated by Exam Platform • This report is for ${user.name} only`, {
        x: 50,
        y: 30,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.examTitle.replace(/[^a-z0-9]/gi, '_')}_${result.courseCode}_results.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingExamId(null);
    }
  };

  // Full Report Export (all exams)
  const exportFullReportToPDF = async () => {
    setDownloadingExamId('all');
    
    try {
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

      // Title
      addLine('Student Exam Results Report', 20, true);
      y -= 10;
      addLine(`Student: ${user.name}`, 12);
      addLine(`Email: ${user.email}`, 10);
      addLine(`Generated: ${format(new Date(), 'MMMM dd, yyyy hh:mm a')}`, 10);
      y -= 15;

      // Statistics Summary
      addLine('Performance Summary', 14, true);
      addLine(`Total Exams: ${totalExams}`);
      addLine(`Passed: ${passedExams} (${((passedExams / totalExams) * 100).toFixed(1)}%)`);
      addLine(`Average Score: ${averageScore.toFixed(1)}%`);
      addLine(`Highest Score: ${highestScore}%`);
      addLine(`Overall Accuracy: ${overallAccuracy.toFixed(1)}%`);
      addLine(`Total Study Time: ${totalTimeSpent} minutes`);
      y -= 15;

      // Exam Results Table
      addLine('Exam Results Details', 14, true);
      y -= 10;

      // Table Headers
      const headers = ['Exam', 'Course', 'Date', 'Score', 'Grade', 'Status'];
      const headerX = [50, 120, 220, 320, 380, 440];
      
      headers.forEach((header, i) => {
        page.drawText(header, { x: headerX[i], y, size: 9, font: boldFont });
      });
      
      y -= 15;
      page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 550, y: y + 5 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 10;

      // Table Rows
      for (const result of filteredResults.slice(0, 20)) {
        if (y < 60) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
        
        page.drawText(result.examTitle.substring(0, 25), { x: 50, y, size: 8, font });
        page.drawText(result.course.substring(0, 15), { x: 120, y, size: 8, font });
        page.drawText(format(new Date(result.date), 'MM/dd/yyyy'), { x: 220, y, size: 8, font });
        page.drawText(`${result.score}/${result.totalMarks} (${result.percentage}%)`, { x: 320, y, size: 8, font });
        page.drawText(result.grade, { x: 380, y, size: 8, font });
        page.drawText(result.status.toUpperCase(), { x: 440, y, size: 8, font });
        
        y -= 12;
      }

      // Footer
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      lastPage.drawText(`Generated by Exam Platform • ${new Date().toLocaleString()}`, {
        x: 50,
        y: 30,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full-exam-results-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate full report. Please try again.');
    } finally {
      setDownloadingExamId(null);
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding performance!";
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 70) return "Good job!";
    if (percentage >= 60) return "Satisfactory performance";
    if (percentage >= 50) return "Needs improvement";
    return "Requires significant improvement";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
                  <p className="mt-2 text-gray-600">
                    View your exam performance and track academic progress
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </div>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={exportFullReportToPDF}
                    disabled={downloadingExamId === 'all'}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadingExamId === 'all' ? 'Generating...' : 'Download Full Report'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Award className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Overall Average</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {averageScore.toFixed(1)}%
                      </p>
                      <div className="flex items-center mt-1">
                        {averageScore >= 80 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Excellent</span>
                          </>
                        ) : averageScore >= 70 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-sm text-blue-600">Good</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-yellow-600">Needs Work</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Exams Passed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {passedExams} / {totalExams}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Success Rate: {((passedExams / totalExams) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Accuracy Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overallAccuracy.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-blue-600 rounded-full h-1.5" 
                          style={{ width: `${overallAccuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Study Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalTimeSpent} min
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Avg: {(totalTimeSpent / totalExams).toFixed(0)} min/exam
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by exam, course, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="All Courses" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course} value={course}>
                            {course === 'all' ? 'All Courses' : course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="passed">Passed Only</SelectItem>
                        <SelectItem value="failed">Failed Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Most Recent</SelectItem>
                        <SelectItem value="score">Highest Score</SelectItem>
                        <SelectItem value="course">Course Name</SelectItem>
                        <SelectItem value="title">Exam Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Exam Results ({filteredResults.length} exams)
                </h2>
                <p className="text-sm text-gray-600">
                  {filterCourse !== 'all' && `Filtered by: ${filterCourse} • `}
                  {filterStatus !== 'all' && `${filterStatus} exams only • `}
                  Sorted by: {sortBy === 'date' ? 'Most Recent' : 
                            sortBy === 'score' ? 'Highest Score' : 
                            sortBy === 'course' ? 'Course Name' : 'Exam Title'}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                Last Updated: {format(new Date(), 'MMM dd, yyyy')}
              </Badge>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterCourse !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'No exam results available yet. Results will appear here after exams are graded.'}
                    </p>
                    {(searchTerm || filterCourse !== 'all' || filterStatus !== 'all') && (
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setFilterCourse('all');
                        setFilterStatus('all');
                      }}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${result.status === 'passed' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {result.status === 'passed' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{result.examTitle}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-medium text-gray-700">{result.course} ({result.courseCode})</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{result.instructor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.score}/{result.totalMarks}
                            </div>
                            <div className="text-sm text-gray-600">{result.percentage}%</div>
                          </div>
                          <Badge className={`${getGradeColor(result.grade)} border px-3 py-1 text-base font-semibold`}>
                            {result.grade}
                          </Badge>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {format(new Date(result.date), 'MMM dd, yyyy • hh:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {result.timeSpent} / {result.duration} minutes
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {result.correctAnswers} / {result.totalQuestions} correct
                            ({((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            Rank: {result.rank ? `#${result.rank}` : 'N/A'} • Class Avg: {result.classAverage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar and Actions */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Your Performance</span>
                            <span className="font-medium">{getPerformanceMessage(result.percentage)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${result.percentage >= 80 ? 'bg-green-600' : result.percentage >= 60 ? 'bg-blue-600' : 'bg-red-600'}`}
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>Class Average: {result.classAverage}%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {expandedResult === result.id ? 'Hide Details' : 'View Detailed Analysis'}
                            {expandedResult === result.id ? 
                              <ChevronUp className="h-4 w-4 ml-2" /> : 
                              <ChevronDown className="h-4 w-4 ml-2" />
                            }
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Exam
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => exportExamToPDF(result)}
                              disabled={downloadingExamId === result.id}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {downloadingExamId === result.id ? 'Generating...' : 'Download Report'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Analysis */}
                      {expandedResult === result.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Strengths
                              </h4>
                              <ul className="space-y-2">
                                {result.percentage >= 80 && (
                                  <>
                                    <li className="text-sm text-green-600 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      Excellent time management
                                    </li>
                                    <li className="text-sm text-green-600 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      High accuracy rate
                                    </li>
                                    <li className="text-sm text-green-600 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      Top performer in class
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Target className="h-4 w-4 mr-2" />
                                Areas for Improvement
                              </h4>
                              <ul className="space-y-2">
                                {result.percentage < 80 && (
                                  <li className="text-sm text-yellow-600 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-2" />
                                    Focus on topic areas with lower scores
                                  </li>
                                )}
                                {result.timeSpent > result.duration * 0.9 && (
                                  <li className="text-sm text-yellow-600 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-2" />
                                    Practice time management skills
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                              <div className="space-y-2">
                                {result.percentage >= 80 ? (
                                  <p className="text-sm text-green-600">
                                    Continue current study habits. Consider advanced topics.
                                  </p>
                                ) : result.percentage >= 60 ? (
                                  <p className="text-sm text-blue-600">
                                    Review missed questions. Practice similar problems.
                                  </p>
                                ) : (
                                  <p className="text-sm text-red-600">
                                    Schedule tutoring sessions. Review fundamental concepts.
                                  </p>
                                )}
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Request Detailed Feedback
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Performance Summary */}
            {filteredResults.length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                      Track your academic progress over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-4">Score Trend</h4>
                        <div className="h-64 flex items-end space-x-1 p-4 bg-gray-50 rounded-lg">
                          {results
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((result, index) => (
                              <div key={result.id} className="flex-1 flex flex-col items-center">
                                <div className="flex flex-col items-center w-full">
                                  <div 
                                    className={`w-8 ${result.percentage >= 80 ? 'bg-green-500' : result.percentage >= 60 ? 'bg-blue-500' : 'bg-red-500'} rounded-t`}
                                    style={{ height: `${result.percentage * 1.5}px` }}
                                  ></div>
                                  <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                                    {format(new Date(result.date), 'MM/dd')}
                                  </div>
                                  <div className="text-xs font-medium mt-1">
                                    {result.percentage}%
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Performance by Course</h4>
                        <div className="space-y-4">
                          {Array.from(new Set(results.map(r => r.course))).map(course => {
                            const courseResults = results.filter(r => r.course === course);
                            const avgScore = courseResults.reduce((sum, r) => sum + r.percentage, 0) / courseResults.length;
                            const bestScore = Math.max(...courseResults.map(r => r.percentage));
                            
                            return (
                              <div key={course} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">{course}</span>
                                  <span className="text-sm font-bold text-gray-900">{avgScore.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-blue-500' : 'bg-red-500'}`}
                                    style={{ width: `${avgScore}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Avg: {avgScore.toFixed(1)}%</span>
                                  <span>Best: {bestScore}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}