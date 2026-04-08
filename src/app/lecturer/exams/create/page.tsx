'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Plus, 
  Trash2, 
  ChevronLeft,
  Save,
  Eye,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: string;
  text: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface ExamDetails {
  title: string;
  description: string;
  subject: string;
  code: string;
  duration: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  allowLateSubmission: boolean;
}

interface SecuritySettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  preventCopyPaste: boolean;
  preventTabSwitch: boolean;
  preventScreenshot: boolean;
  maxViolations: number;
}

export default function CreateExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Helper function to generate random exam code
  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Helper function to format date to ISO string
  const formatDateToISO = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString();
  };

  // Initialize questions with a default question
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      type: 'MULTIPLE_CHOICE',
      text: '',
      marks: 1,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: '0'
    }
  ]);

  // Exam details with initial random code
  const [examDetails, setExamDetails] = useState<ExamDetails>({
    title: '',
    description: '',
    subject: 'Computer Science',
    code: generateRandomCode(),
    duration: 60,
    passingMarks: 40,
    startTime: '',
    endTime: '',
    isPublished: false,
    allowLateSubmission: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    shuffleQuestions: true,
    shuffleOptions: true,
    showResults: false,
    preventCopyPaste: true,
    preventTabSwitch: true,
    preventScreenshot: true,
    maxViolations: 3,
  });

  // Add a new question
  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      text: '',
      marks: 1,
    };

    if (type === 'MULTIPLE_CHOICE') {
      newQuestion.options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      newQuestion.correctAnswer = '0';
    } else if (type === 'TRUE_FALSE') {
      newQuestion.options = ['True', 'False'];
      newQuestion.correctAnswer = '0';
    }

    setQuestions([...questions, newQuestion]);
  };

  // Remove a question
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
      toast.success('Question removed');
    } else {
      toast.error('Exam must have at least one question');
    }
  };

  // Update question field
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Update option text
  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Add option to question
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  // Remove option from question
  const removeOption = (questionId: string, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== index);
        // Adjust correctAnswer if needed
        let correctAnswer = q.correctAnswer;
        if (correctAnswer === index.toString()) {
          correctAnswer = '0'; // Reset to first option
        } else if (parseInt(correctAnswer || '0') > index) {
          correctAnswer = (parseInt(correctAnswer || '0') - 1).toString();
        }
        return { ...q, options: newOptions, correctAnswer };
      }
      return q;
    }));
  };

  // Validate exam data
  const validateExamData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!examDetails.title.trim()) {
      errors.push('Exam title is required');
    }
    if (!examDetails.startTime) {
      errors.push('Start time is required');
    }
    if (!examDetails.endTime) {
      errors.push('End time is required');
    }
    
    // Validate dates
    if (examDetails.startTime && examDetails.endTime) {
      const start = new Date(examDetails.startTime);
      const end = new Date(examDetails.endTime);
      if (start >= end) {
        errors.push('End time must be after start time');
      }
    }

    // Validate questions
    if (questions.length === 0) {
      errors.push('At least one question is required');
    } else {
      const emptyQuestions = questions.filter(q => !q.text.trim());
      if (emptyQuestions.length > 0) {
        errors.push('All questions must have text');
      }
    }

    // Validate passing marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    if (examDetails.passingMarks > totalMarks) {
      errors.push(`Passing marks (${examDetails.passingMarks}) cannot exceed total marks (${totalMarks})`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Main submit handler - UPDATED TO MATCH SCHEMA
  const handleSubmit = async (publishStatus?: boolean) => {
    console.log('=== Starting exam creation ===');
    console.log('Publish status:', publishStatus !== undefined ? publishStatus : examDetails.isPublished);
    
    // Validate data
    const validation = validateExamData();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    
    try {
      // Calculate total marks
      const calculatedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      
      // Determine final publish status
      const finalIsPublished = publishStatus !== undefined ? publishStatus : examDetails.isPublished;

      // Prepare exam data matching the Prisma schema - UPDATED FIELDS
      const examData = {
        title: examDetails.title,
        description: examDetails.description,
        code: examDetails.code, // Changed from examCode to code
        shortCode: examDetails.code.substring(0, 8).toUpperCase(), // Generate short code (max 10 chars)
        courseCode: examDetails.subject
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .substring(0, 10), // Create course code from subject (max 50 chars)
        courseName: examDetails.subject, // Changed from subject to courseName
        duration: parseInt(examDetails.duration.toString()),
        totalMarks: calculatedTotalMarks, // Changed from maxScore to totalMarks
        passingMarks: parseInt(examDetails.passingMarks.toString()),
        startTime: formatDateToISO(examDetails.startTime),
        endTime: formatDateToISO(examDetails.endTime),
        isPublished: finalIsPublished,
        status: finalIsPublished ? 'PUBLISHED' : 'DRAFT',
        settings: JSON.stringify(securitySettings), // Changed from securitySettings to settings
        instructions: examDetails.allowLateSubmission ? 'Late submission allowed' : '',
        proctoringMode: 'BASIC',
        maxAttempts: 1,
        securityLevel: 1,
        // lecturerId will be added by the API from the session
        questions: questions.map((q, index) => ({
          questionText: q.text,
          questionType: q.type,
          marks: q.marks,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          order: index,
          difficulty: 1
        }))
      };

      console.log('=== DEBUG: Sending exam data (UPDATED FOR SCHEMA) ===');
      console.log('API Endpoint:', '/api/exams');
      console.log('Request Method:', 'POST');
      console.log('Exam data:', examData);
      console.log('Questions count:', questions.length);

      // Make API call
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
        credentials: 'include'
      });

      console.log('=== DEBUG: Got response ===');
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('API Error:', data);
        
        // Extract detailed error message
        let errorMessage = data.error || `Failed to create exam (Status: ${response.status})`;
        if (data.details) {
          errorMessage += `: ${data.details}`;
        }
        if (data.code === 'P2002') {
          if (data.meta?.target?.includes('code')) {
            errorMessage = 'Exam code already exists. Please use a different code.';
          } else if (data.meta?.target?.includes('shortCode')) {
            errorMessage = 'Short code already exists. Please use a different code.';
          }
        }
        
        throw new Error(errorMessage);
      }

      // Success
      const successMessage = finalIsPublished 
        ? 'Exam published successfully!' 
        : 'Exam saved as draft successfully!';
      
      toast.success(
        <div>
          <div className="font-semibold">{successMessage}</div>
          <div className="text-sm mt-1">Code: {data.exam?.code || examDetails.code}</div>
          <div className="text-xs mt-1">Redirecting to exams page...</div>
        </div>
      );
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/lecturer/exams');
        router.refresh(); // Refresh to show the new exam
      }, 2000);

    } catch (error: any) {
      console.error('=== CRITICAL ERROR: Exam creation failed ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Complete error object:', error);
      
      // Show detailed error
      toast.error(
        <div>
          <div className="font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to create exam
          </div>
          <div className="text-sm mt-1">{error.message || 'Unknown error occurred'}</div>
          <div className="text-xs mt-1">Check console for details</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    console.log('=== Save as draft clicked ===');
    await handleSubmit(false);
  };

  // Handle publish exam
  const handlePublishExam = async () => {
    console.log('=== Publish exam clicked ===');
    await handleSubmit(true);
  };

  // Handle next/previous tab navigation
  const handleNextTab = () => {
    if (activeTab === 'details') {
      // Validate required fields
      if (!examDetails.title || !examDetails.startTime || !examDetails.endTime) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate dates
      const start = new Date(examDetails.startTime);
      const end = new Date(examDetails.endTime);
      if (start >= end) {
        toast.error('End time must be after start time');
        return;
      }
      
      setActiveTab('questions');
    } else if (activeTab === 'questions') {
      // Validate questions
      if (questions.length === 0) {
        toast.error('Please add at least one question');
        return;
      }
      const emptyQuestions = questions.filter(q => !q.text.trim());
      if (emptyQuestions.length > 0) {
        toast.error('Please fill in all question texts');
        return;
      }
      setActiveTab('security');
    }
  };

  const handlePreviousTab = () => {
    if (activeTab === 'questions') setActiveTab('details');
    if (activeTab === 'security') setActiveTab('questions');
  };

  // Calculate total marks for display
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  // Update passing marks max when total marks change
  useEffect(() => {
    if (examDetails.passingMarks > totalMarks) {
      setExamDetails(prev => ({
        ...prev,
        passingMarks: totalMarks
      }));
    }
  }, [totalMarks, examDetails.passingMarks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.back()}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
                  <p className="mt-2 text-gray-600">
                    Set up a new examination with customizable settings
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/lecturer/exams')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePublishExam} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save & Publish
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeTab === 'details' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  1
                </div>
                <span className={activeTab === 'details' ? 'font-medium text-primary-700' : 'text-gray-600'}>
                  Details
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeTab === 'questions' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  2
                </div>
                <span className={activeTab === 'questions' ? 'font-medium text-primary-700' : 'text-gray-600'}>
                  Questions
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeTab === 'security' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  3
                </div>
                <span className={activeTab === 'security' ? 'font-medium text-primary-700' : 'text-gray-600'}>
                  Security
                </span>
              </div>
            </div>

            {/* Tabs for Details, Questions, and Security */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details" disabled={loading}>Exam Details</TabsTrigger>
                <TabsTrigger value="questions" disabled={loading}>Questions ({questions.length})</TabsTrigger>
                <TabsTrigger value="security" disabled={loading}>Security Settings</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Details</CardTitle>
                    <CardDescription>
                      Basic information about your exam
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Exam Title *</Label>
                      <Input
                        id="title"
                        value={examDetails.title}
                        onChange={(e) => setExamDetails({...examDetails, title: e.target.value})}
                        placeholder="e.g., Mid-Term Examination - Computer Science 101"
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={examDetails.description}
                        onChange={(e) => setExamDetails({...examDetails, description: e.target.value})}
                        placeholder="Brief description of the exam..."
                        rows={3}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject/Course *</Label>
                        <Input
                          id="subject"
                          value={examDetails.subject}
                          onChange={(e) => setExamDetails({...examDetails, subject: e.target.value})}
                          placeholder="e.g., Computer Science 101"
                          required
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                          Will be saved as Course Name in database
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="code">Access Code *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="code"
                            value={examDetails.code}
                            onChange={(e) => setExamDetails({...examDetails, code: e.target.value.toUpperCase()})}
                            placeholder="Enter access code"
                            className="font-mono uppercase"
                            maxLength={20}
                            required
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExamDetails({...examDetails, code: generateRandomCode()})}
                            disabled={loading}
                          >
                            Generate
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Students will use this code to access the exam. Short code (first 8 characters) will also be generated.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={examDetails.duration}
                          onChange={(e) => setExamDetails({...examDetails, duration: parseInt(e.target.value) || 60})}
                          min="1"
                          max="300"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="passingMarks">Passing Marks</Label>
                        <Input
                          id="passingMarks"
                          type="number"
                          value={examDetails.passingMarks}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 40;
                            const max = questions.reduce((sum, q) => sum + q.marks, 0);
                            if (value > max) {
                              toast.error(`Passing marks cannot exceed total marks (${max})`);
                              setExamDetails({...examDetails, passingMarks: max});
                            } else {
                              setExamDetails({...examDetails, passingMarks: value});
                            }
                          }}
                          min="0"
                          max={totalMarks}
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500">
                          Maximum allowed: {totalMarks} (calculated from questions)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Date & Time *</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={examDetails.startTime}
                          onChange={(e) => setExamDetails({...examDetails, startTime: e.target.value})}
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Date & Time *</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={examDetails.endTime}
                          onChange={(e) => setExamDetails({...examDetails, endTime: e.target.value})}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalMarks">Total Marks (auto-calculated)</Label>
                        <Input
                          id="totalMarks"
                          type="number"
                          value={totalMarks}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">
                          Sum of all question marks
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center h-10">
                          <div className={`px-4 py-2 rounded-md ${examDetails.isPublished ? 'bg-primary-100 text-primary-800 border border-primary-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                            {examDetails.isPublished ? 'Published' : 'Draft'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publishNow"
                        checked={examDetails.isPublished}
                        onCheckedChange={(checked) => setExamDetails({...examDetails, isPublished: checked})}
                        disabled={loading}
                      />
                      <Label htmlFor="publishNow" className="cursor-pointer">
                        Publish immediately (students can see it)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowLateSubmission"
                        checked={examDetails.allowLateSubmission}
                        onCheckedChange={(checked) => setExamDetails({...examDetails, allowLateSubmission: checked})}
                        disabled={loading}
                      />
                      <Label htmlFor="allowLateSubmission" className="cursor-pointer">
                        Allow late submission
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions ({questions.length})</CardTitle>
                    <CardDescription>
                      Add and manage questions for your exam
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Question Type Buttons */}
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center"
                        onClick={() => addQuestion('MULTIPLE_CHOICE')}
                        disabled={loading}
                      >
                        <div className="text-lg mb-1">A/B/C/D</div>
                        <span className="text-sm">Multiple Choice</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center"
                        onClick={() => addQuestion('TRUE_FALSE')}
                        disabled={loading}
                      >
                        <div className="text-lg mb-1">T/F</div>
                        <span className="text-sm">True/False</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center"
                        onClick={() => addQuestion('SHORT_ANSWER')}
                        disabled={loading}
                      >
                        <div className="text-lg mb-1">___</div>
                        <span className="text-sm">Short Answer</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center"
                        onClick={() => addQuestion('ESSAY')}
                        disabled={loading}
                      >
                        <div className="text-lg mb-1">Essay</div>
                        <span className="text-sm">Essay</span>
                      </Button>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">
                                Question {index + 1} • {question.marks} mark{question.marks !== 1 ? 's' : ''}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(question.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Question Type */}
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                                disabled={loading}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                  <SelectItem value="ESSAY">Essay</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-2">
                              <Label>Question Text *</Label>
                              <Textarea
                                value={question.text}
                                onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                placeholder="Enter your question here..."
                                rows={2}
                                disabled={loading}
                              />
                            </div>

                            {/* Marks */}
                            <div className="space-y-2">
                              <Label>Marks</Label>
                              <Input
                                type="number"
                                value={question.marks}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  updateQuestion(question.id, 'marks', value);
                                }}
                                min="1"
                                disabled={loading}
                              />
                            </div>

                            {/* Options for MCQ and True/False */}
                            {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && (
                              <div className="space-y-3">
                                <Label>Options</Label>
                                {question.options?.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-2">
                                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs ${question.correctAnswer === optIndex.toString() ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300'}`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </div>
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                        placeholder={`Option ${optIndex + 1}`}
                                        disabled={loading}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant={question.correctAnswer === optIndex.toString() ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => updateQuestion(question.id, 'correctAnswer', optIndex.toString())}
                                      disabled={loading}
                                    >
                                      {question.correctAnswer === optIndex.toString() ? 'Correct' : 'Set Correct'}
                                    </Button>
                                    {question.options && question.options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(question.id, optIndex)}
                                        className="text-red-600 hover:text-red-700"
                                        disabled={loading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(question.id)}
                                  className="mt-2"
                                  disabled={loading}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            )}

                            {/* Explanation */}
                            <div className="space-y-2">
                              <Label>Explanation (Optional)</Label>
                              <Textarea
                                value={question.explanation || ''}
                                onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                                placeholder="Explain the correct answer..."
                                rows={2}
                                disabled={loading}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {questions.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                        <p className="text-gray-500 mb-6">Add questions using the buttons above</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure anti-cheating measures for your exam
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Display Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Eye className="h-5 w-5 mr-2" />
                        Question Display
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                              Shuffle Questions
                            </Label>
                            <p className="text-sm text-gray-500">
                              Questions appear in random order for each student
                            </p>
                          </div>
                          <Switch
                            id="shuffleQuestions"
                            checked={securitySettings.shuffleQuestions}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, shuffleQuestions: checked})}
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="shuffleOptions" className="cursor-pointer">
                              Shuffle Options
                            </Label>
                            <p className="text-sm text-gray-500">
                              Multiple choice options appear in random order
                            </p>
                          </div>
                          <Switch
                            id="shuffleOptions"
                            checked={securitySettings.shuffleOptions}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, shuffleOptions: checked})}
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="showResults" className="cursor-pointer">
                              Show Results Immediately
                            </Label>
                            <p className="text-sm text-gray-500">
                              Students see their scores right after submission
                            </p>
                          </div>
                          <Switch
                            id="showResults"
                            checked={securitySettings.showResults}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, showResults: checked})}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Anti-Cheating Measures */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        Anti-Cheating Measures
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="preventCopyPaste" className="cursor-pointer">
                              Prevent Copy/Paste
                            </Label>
                            <p className="text-sm text-gray-500">
                              Disable copy and paste functionality
                            </p>
                          </div>
                          <Switch
                            id="preventCopyPaste"
                            checked={securitySettings.preventCopyPaste}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, preventCopyPaste: checked})}
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="preventTabSwitch" className="cursor-pointer">
                              Prevent Tab Switching
                            </Label>
                            <p className="text-sm text-gray-500">
                              Auto-submit if student switches tabs/windows
                            </p>
                          </div>
                          <Switch
                            id="preventTabSwitch"
                            checked={securitySettings.preventTabSwitch}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, preventTabSwitch: checked})}
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="preventScreenshot" className="cursor-pointer">
                              Prevent Screenshots
                            </Label>
                            <p className="text-sm text-gray-500">
                              Detect screenshot attempts (desktop only)
                            </p>
                          </div>
                          <Switch
                            id="preventScreenshot"
                            checked={securitySettings.preventScreenshot}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, preventScreenshot: checked})}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Violation Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        Violation Settings
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="maxViolations">
                            Maximum Violations Allowed
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="maxViolations"
                              type="range"
                              min="0"
                              max="10"
                              value={securitySettings.maxViolations}
                              onChange={(e) => setSecuritySettings({...securitySettings, maxViolations: parseInt(e.target.value)})}
                              className="flex-1"
                              disabled={loading}
                            />
                            <span className="w-12 text-center font-medium">
                              {securitySettings.maxViolations}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Exam auto-submits after this many violations (0 = no limit)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousTab}
                disabled={activeTab === 'details' || loading}
              >
                Previous
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
                <Button
                  onClick={activeTab === 'security' ? handlePublishExam : handleNextTab}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : activeTab === 'security' ? (
                    'Publish Exam'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}