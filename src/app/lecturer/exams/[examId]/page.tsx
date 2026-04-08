import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Edit, ArrowLeft } from 'lucide-react';

// This gets the examId from the URL (e.g., 1041d623-f993-...)
type Props = {
  params: Promise<{ examId: string }> | { examId: string };
};

export default async function ExamViewPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'LECTURER') {
    redirect('/auth/login');
  }

  // Handle params as Promise (Next.js 15+) or regular object (Next.js 13-14)
  const resolvedParams = await params;
  const examId = resolvedParams.examId;

  // Validate examId exists
  if (!examId) {
    console.error('No examId provided in URL');
    redirect('/lecturer/exams');
  }

  // Fetch the single exam + its questions
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { order: 'asc' }, // keeps questions sorted
        select: {
          id: true,
          questionText: true,     // changed from "text"
          questionType: true,     // changed from "type"
          marks: true,            // changed from "points"
          order: true,            // optional: for display order
          difficulty: true,       // optional
          explanation: true,      // optional: shows after answer
          imageUrl: true,         // if questions have images
          // Add more if you want: tags: true, category: true, etc.
          // Do NOT add "options" or "correctAnswer" yet—they don't exist directly
        },
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
          <div className="max-w-4xl mx-auto">
            {/* Back button + Edit button */}
            <div className="mb-6 flex items-center justify-between">
              <Link href="/lecturer/exams">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Exams
                </Button>
              </Link>
              <Link href={`/lecturer/exams/${exam.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Exam
                </Button>
              </Link>
            </div>

            {/* Exam details */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{exam.title}</CardTitle>
                <p className="text-gray-600 mt-2">{exam.description || 'No description'}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Code: <code className="bg-gray-100 px-2 py-1 rounded">{exam.code}</code></div>
                  <div>Duration: {exam.duration} minutes</div>
                  <div>Start: {new Date(exam.startTime).toLocaleString()}</div>
                  <div>End: {new Date(exam.endTime).toLocaleString()}</div>
                  <div>Published: {exam.isPublished ? 'Yes' : 'No'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Questions list */}
            <h2 className="text-xl font-bold mb-4">Questions ({exam.questions.length})</h2>
            {exam.questions.length === 0 ? (
              <p className="text-gray-500">No questions added yet.</p>
            ) : (
              <div className="space-y-6">
                {exam.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Question {index + 1} ({question.marks} marks)
                        {question.difficulty && <span className="text-sm text-gray-500 ml-2">• {question.difficulty}</span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={question.imageUrl} alt="Question image" className="mb-4 max-w-md rounded" />
                      )}
                      <p className="mb-4 font-medium">{question.questionText}</p>
                      <p className="text-sm text-gray-600 mb-2">Type: {question.questionType}</p>

                      {/* Placeholder for options/answers – we'll improve this next */}
                      <p className="text-sm italic text-gray-500">
                        (Options/answers will show here once we add them – for now, basic view works)
                      </p>

                      {question.explanation && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium">View Explanation</summary>
                          <p className="mt-2 text-sm">{question.explanation}</p>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}