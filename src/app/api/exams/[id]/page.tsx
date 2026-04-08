'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  ChevronLeft,
  Edit,
  Download,
  Calendar,
  Clock,
  Users,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Mail,
  Hash,
  BookOpen,
  Percent,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface Exam {
  id: string;
  title: string;
  description: string;
  code: string;
  shortCode: string;
  courseCode: string;
  courseName: string;
  status: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  isArchived: boolean;
  settings: string;
  instructions: string;
  totalAttempts: number;
  avgScore: number | null;
  passRate: number | null;
  maxAttempts: number;
  securityLevel: number;
  proctoringMode: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  questions: Question[];
  _count?: {
    attempts: number;
    questions: number;
    violations: number;
  };
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  marks: number;
  options: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  order: number;
  difficulty: number;
  category: string | null;
  topic: string | null;
}

export default function ViewExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const fetchExam = async () => {
    console.log('Fetching exam with ID:', examId);
    setLoading(true);
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to fetch exam (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Exam data received:', data);
      
      if (!data.exam) {
        throw new Error('No exam data received');
      }
      
      setExam(data.exam);
    } catch (error: any) {
      console.error('Error fetching exam:', error);
      toast.error(`Failed to load exam: ${error.message}`);
      // Don't redirect immediately, show error message
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (exam) {
      router.push(`/lecturer/exams/${exam.id}/edit`);
    }
  };

  const handleBack = () => {
    router.push('/lecturer/exams');
  };

  const handleExport = () => {
    if (!exam) return;

    const examContent = generateExamContent();
    
    const blob = new Blob([examContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/\s+/g, '_')}_Exam_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Exam exported successfully');
  };

  const generateExamContent = () => {
    if (!exam) return '';
    
    return `
EXAM: ${exam.title}
========================================

EXAM DETAILS:
Code: ${exam.code}
Short Code: ${exam.shortCode}
Course: ${exam.courseName} (${exam.courseCode})
Duration: ${exam.duration} minutes
Total Marks: ${exam.totalMarks}
Passing Marks: ${exam.passingMarks} (${Math.round((exam.passingMarks / exam.totalMarks) * 100)}%)
Status: ${exam.status}
Published: ${exam.isPublished ? 'Yes' : 'No'}
Archived: ${exam.isArchived ? 'Yes' : 'No'}

SCHEDULE:
Start Time: ${formatDate(exam.startTime)}
End Time: ${formatDate(exam.endTime)}
Created: ${formatDate(exam.createdAt)}
Last Updated: ${formatDate(exam.updatedAt)}
${exam.publishedAt ? `Published: ${formatDate(exam.publishedAt)}` : ''}

DESCRIPTION:
${exam.description || 'No description provided.'}

INSTRUCTIONS:
${exam.instructions || 'No special instructions.'}

SECURITY SETTINGS:
Max Attempts: ${exam.maxAttempts}
Security Level: ${exam.securityLevel}
Proctoring Mode: ${exam.proctoringMode}
${exam.settings ? 'Additional Settings: ' + exam.settings : ''}

STATISTICS:
Total Questions: ${exam.questions?.length || 0}
Total Attempts: ${exam.totalAttempts || 0}
Average Score: ${exam.avgScore?.toFixed(1) || 0}%
Pass Rate: ${exam.passRate?.toFixed(1) || 0}%

========================================
QUESTIONS (${exam.questions?.length || 0}):

${exam.questions?.map((q, i) => `
QUESTION ${i + 1} [${q.marks} marks]
Type: ${q.questionType.replace('_', ' ')}
Difficulty: ${q.difficulty}/5
${q.category ? `Category: ${q.category}` : ''}
${q.topic ? `Topic: ${q.topic}` : ''}

${q.questionText}

${q.options ? `OPTIONS:\n${JSON.parse(q.options).map((opt: string, idx: number) => `  ${String.fromCharCode(65 + idx)}) ${opt}${q.correctAnswer === idx.toString() ? ' [CORRECT]' : ''}`).join('\n')}\n` : ''}

${q.explanation ? `EXPLANATION:\n${q.explanation}\n` : ''}
${'-'.repeat(50)}
`).join('')}

========================================
Generated on: ${new Date().toLocaleString()}
Exported from Exam Platform
    `.trim();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    if (!exam) return null;
    
    if (exam.isArchived) {
      return <Badge className="bg-gray-600">Archived</Badge>;
    }
    
    if (!exam.isPublished) {
      return <Badge variant="secondary" className="bg-yellow-500">Draft</Badge>;
    }

    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (now < start) {
      return <Badge className="bg-blue-600">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge className="bg-green-600">Completed</Badge>;
    } else {
      return <Badge className="bg-purple-600">Active</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'MULTIPLE_CHOICE': 'Multiple Choice',
      'TRUE_FALSE': 'True/False',
      'SHORT_ANSWER': 'Short Answer',
      'ESSAY': 'Essay'
    };
    return types[type] || type;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="LECTURER" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading exam details...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="LECTURER" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Exam not found</h3>
                <p className="text-gray-500 mb-6">
                  The exam you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Exams
                  </Button>
                  <Button variant="outline" onClick={fetchExam}>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Success state - exam loaded
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                    {getStatusBadge()}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{exam.courseName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{exam.code}</code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      <span>{formatDuration(exam.duration)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleEdit} className="bg-primary-600 hover:bg-primary-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Exam
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Marks</p>
                      <p className="text-2xl font-bold text-blue-900">{exam.totalMarks}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Percent className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Passing: {exam.passingMarks} ({Math.round((exam.passingMarks / exam.totalMarks) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Questions</p>
                      <p className="text-2xl font-bold text-green-900">{exam.questions?.length || 0}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    {exam._count?.questions || 0} total questions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Duration</p>
                      <p className="text-2xl font-bold text-purple-900">{formatDuration(exam.duration)}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    {exam.duration} minutes total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Attempts</p>
                      <p className="text-2xl font-bold text-orange-900">{exam.totalAttempts || 0}</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    {exam.avgScore?.toFixed(1) || 0}% average score
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions ({exam.questions?.length || 0})</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Overview</CardTitle>
                    <CardDescription>
                      Comprehensive details about this examination
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{exam.description || 'No description provided.'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Instructions for Students</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{exam.instructions || 'No special instructions provided.'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Exam Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Course Code:</span>
                            <span className="font-medium">{exam.courseCode}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Short Code:</span>
                            <code className="font-mono bg-gray-100 px-2 py-1 rounded">{exam.shortCode}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Max Attempts:</span>
                            <span className="font-medium">{exam.maxAttempts}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Security Level:</span>
                            <Badge variant="outline">Level {exam.securityLevel}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Proctoring:</span>
                            <Badge variant="outline">{exam.proctoringMode}</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Performance Statistics</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Attempts:</span>
                            <span className="font-medium">{exam.totalAttempts || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Average Score:</span>
                            <span className="font-medium">{exam.avgScore?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pass Rate:</span>
                            <span className="font-medium">{exam.passRate?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Violations:</span>
                            <span className="font-medium">{exam._count?.violations || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium capitalize">{exam.status.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Questions</CardTitle>
                    <CardDescription>
                      {exam.questions?.length || 0} questions • {exam.totalMarks} total marks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {exam.questions && exam.questions.length > 0 ? (
                      <div className="space-y-6">
                        {exam.questions.sort((a, b) => a.order - b.order).map((question, index) => (
                          <Card key={question.id} className="border-l-4 border-l-primary-500">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">
                                    Question {index + 1} • {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{getQuestionTypeLabel(question.questionType)}</Badge>
                                    {question.difficulty && (
                                      <Badge variant="secondary">
                                        Difficulty: {question.difficulty}/5
                                      </Badge>
                                    )}
                                    {question.category && (
                                      <Badge variant="outline" className="bg-gray-100">
                                        {question.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Question Text</h3>
                                <p className="text-gray-900 whitespace-pre-wrap">{question.questionText}</p>
                              </div>

                              {question.options && (
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">Options</h3>
                                  <div className="space-y-2">
                                    {JSON.parse(question.options).map((option: string, optIndex: number) => (
                                      <div 
                                        key={optIndex} 
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                                          question.correctAnswer === optIndex.toString() 
                                            ? 'border-green-200 bg-green-50' 
                                            : 'border-gray-200 bg-gray-50'
                                        }`}
                                      >
                                        <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-sm font-medium ${
                                          question.correctAnswer === optIndex.toString() 
                                            ? 'bg-green-600 text-white border-green-600' 
                                            : 'bg-white border-gray-300'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span className="flex-1">{option}</span>
                                        {question.correctAnswer === optIndex.toString() && (
                                          <Badge className="bg-green-600">Correct Answer</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {question.explanation && (
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-1">Explanation</h3>
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap">{question.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added</h3>
                        <p className="text-gray-500 mb-6">This exam doesn't have any questions yet.</p>
                        <Button onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Add Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Schedule</CardTitle>
                    <CardDescription>
                      Timing and availability details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium text-blue-900">Start Time</h3>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{formatDate(exam.startTime)}</p>
                          <p className="text-sm text-blue-600 mt-1">
                            Exam becomes available to students at this time
                          </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-green-600" />
                            <h3 className="font-medium text-green-900">End Time</h3>
                          </div>
                          <p className="text-2xl font-bold text-green-900">{formatDate(exam.endTime)}</p>
                          <p className="text-sm text-green-600 mt-1">
                            Exam closes and submissions are no longer accepted
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <h3 className="font-medium text-purple-900">Duration</h3>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{formatDuration(exam.duration)}</p>
                          <p className="text-sm text-purple-600 mt-1">
                            Maximum time allowed per attempt
                          </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            <h3 className="font-medium text-gray-900">Timeline</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{formatDate(exam.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="font-medium">{formatDate(exam.updatedAt)}</span>
                            </div>
                            {exam.publishedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Published:</span>
                                <span className="font-medium">{formatDate(exam.publishedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Status */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          exam.isArchived ? 'bg-gray-400' :
                          !exam.isPublished ? 'bg-yellow-400' :
                          new Date() < new Date(exam.startTime) ? 'bg-blue-400' :
                          new Date() > new Date(exam.endTime) ? 'bg-green-400' :
                          'bg-purple-400'
                        }`}></div>
                        <span className="text-gray-700">
                          {exam.isArchived ? 'This exam is archived' :
                           !exam.isPublished ? 'This exam is in draft mode' :
                           new Date() < new Date(exam.startTime) ? 'Exam has not started yet' :
                           new Date() > new Date(exam.endTime) ? 'Exam has ended' :
                           'Exam is currently active'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Settings</CardTitle>
                    <CardDescription>
                      Configuration and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Security Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Proctoring Mode</p>
                            <p className="text-gray-600">{exam.proctoringMode}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Security Level</p>
                            <p className="text-gray-600">Level {exam.securityLevel}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Maximum Attempts</p>
                            <p className="text-gray-600">{exam.maxAttempts}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">Total Attempts</p>
                            <p className="text-gray-600">{exam.totalAttempts || 0}</p>
                          </div>
                        </div>
                      </div>

                      {exam.settings && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Custom Settings</h3>
                          <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(JSON.parse(exam.settings), null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">Exam Status</h3>
                            <p className="text-sm text-gray-600">
                              {exam.isPublished ? 
                                'This exam is published and visible to students' : 
                                'This exam is in draft mode and not visible to students'}
                            </p>
                          </div>
                          <Badge variant={exam.isPublished ? "default" : "secondary"}>
                            {exam.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}