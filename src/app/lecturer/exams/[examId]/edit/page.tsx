import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react';
import { updateExam, addQuestion, deleteQuestion, updateQuestion } from '../../actions';

// ✅ FIX: Updated Props type to handle Next.js 15+ async params
type Props = {
  params: Promise<{ examId: string }> | { examId: string };
};

export default async function ExamEditPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  // ✅ FIX: Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await params;
  const examId = resolvedParams.examId;

  // ✅ FIX: Validate examId exists
  if (!examId) {
    redirect('/lecturer/exams');
  }

  // ✅ FIX: Use resolved examId
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exam) {
    return <div className="p-8 text-center">Exam not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="LECTURER" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Link href={`/lecturer/exams/${exam.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to View
                </Button>
              </Link>
            </div>

            {/* Main exam form */}
            <form action={updateExam}>
              <input type="hidden" name="examId" value={exam.id} />

              <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl">Edit Exam: {exam.title}</CardTitle>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Exam Details
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" id="title" defaultValue={exam.title} className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" defaultValue={exam.description || ''} className="mt-1" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Code (read-only)</Label>
                      <Input id="code" defaultValue={exam.code} readOnly className="bg-gray-100" />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input name="duration" id="duration" type="number" defaultValue={exam.duration} required />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Questions Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Questions ({exam.questions.length})</CardTitle>
                <div className="text-sm text-gray-600">
                  Add and manage questions for your exam
                </div>
              </CardHeader>
              <CardContent>
                {/* Question Type Buttons */}
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <form action={addQuestion}>
                    <input type="hidden" name="examId" value={exam.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center w-full"
                    >
                      <div className="text-lg mb-1">A/B/C/D</div>
                      <span className="text-sm">Multiple Choice</span>
                    </Button>
                  </form>
                  
                  <form action={addQuestion}>
                    <input type="hidden" name="examId" value={exam.id} />
                    <input type="hidden" name="questionType" value="TRUE_FALSE" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center w-full"
                    >
                      <div className="text-lg mb-1">T/F</div>
                      <span className="text-sm">True/False</span>
                    </Button>
                  </form>
                  
                  <form action={addQuestion}>
                    <input type="hidden" name="examId" value={exam.id} />
                    <input type="hidden" name="questionType" value="SHORT_ANSWER" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center w-full"
                    >
                      <div className="text-lg mb-1">___</div>
                      <span className="text-sm">Short Answer</span>
                    </Button>
                  </form>
                  
                  <form action={addQuestion}>
                    <input type="hidden" name="examId" value={exam.id} />
                    <input type="hidden" name="questionType" value="ESSAY" />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center w-full"
                    >
                      <div className="text-lg mb-1">Essay</div>
                      <span className="text-sm">Essay</span>
                    </Button>
                  </form>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {exam.questions.map((question, index) => {
                    // Parse options from JSON string if they exist
                    let options: string[] = [];
                    try {
                      options = question.options ? JSON.parse(question.options) : [];
                    } catch (e) {
                      options = [];
                    }
                    
                    // Initialize with default options if empty
                    if (options.length === 0 && (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE')) {
                      options = question.questionType === 'TRUE_FALSE' 
                        ? ['True', 'False'] 
                        : ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                    }
                    
                    return (
                      <Card key={question.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              Question {index + 1} • {question.marks} mark{question.marks !== 1 ? 's' : ''}
                            </CardTitle>
                            <form action={deleteQuestion}>
                              <input type="hidden" name="questionId" value={question.id} />
                              <input type="hidden" name="examId" value={exam.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <form action={updateQuestion} className="space-y-4">
                            <input type="hidden" name="examId" value={exam.id} />
                            <input type="hidden" name="questionId" value={question.id} />

                            {/* Question Type */}
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select name={`questionType-${question.id}`} defaultValue={question.questionType}>
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
                                name={`questionText-${question.id}`}
                                defaultValue={question.questionText}
                                placeholder="Enter your question here..."
                                rows={2}
                                required
                              />
                            </div>

                            {/* Marks */}
                            <div className="space-y-2">
                              <Label>Marks</Label>
                              <Input
                                name={`marks-${question.id}`}
                                type="number"
                                defaultValue={question.marks}
                                min="1"
                                required
                              />
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                              <Label>Order</Label>
                              <Input
                                name={`order-${question.id}`}
                                type="number"
                                defaultValue={question.order}
                                min="1"
                                required
                              />
                            </div>

                            {/* Options and Correct Answer for MCQ and True/False */}
                            {(question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') && (
                              <>
                                <div className="space-y-3">
                                  <Label>Options</Label>
                                  {options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <div className="flex-1 flex items-center gap-2">
                                        <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs ${question.correctAnswer === optIndex.toString() ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-300'}`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <Input
                                          name={`option-${question.id}-${optIndex}`}
                                          defaultValue={option}
                                          placeholder={`Option ${optIndex + 1}`}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correctAnswer-${question.id}`}
                                          value={optIndex.toString()}
                                          defaultChecked={question.correctAnswer === optIndex.toString()}
                                          className="h-4 w-4"
                                        />
                                        <span className="text-sm">Correct</span>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Hidden field to store all options as JSON */}
                                  <input 
                                    type="hidden" 
                                    name={`options-${question.id}`} 
                                    id={`options-${question.id}`} 
                                    value={JSON.stringify(options)}
                                  />
                                </div>
                              </>
                            )}

                            {/* Explanation */}
                            <div className="space-y-2">
                              <Label>Explanation (Optional)</Label>
                              <Textarea
                                name={`explanation-${question.id}`}
                                defaultValue={question.explanation || ''}
                                placeholder="Explain the correct answer..."
                                rows={2}
                              />
                            </div>

                            <Button type="submit" variant="secondary" size="sm">
                              <Save className="h-3 w-3 mr-2" />
                              Update Question
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {exam.questions.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                      <p className="text-gray-500 mb-6">Add questions using the buttons above</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}