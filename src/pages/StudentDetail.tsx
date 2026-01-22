import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReportCard } from '@/components/reports/ReportCard';
import { Student, ExamWithMarks, StudentWithExams, Mark } from '@/types/student';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Book,
  Calendar,
  ClipboardList,
  FileText,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentWithExams | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>();

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      // Fetch student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (studentError) throw studentError;

      // Fetch exams for this student
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('student_id', id)
        .order('exam_date', { ascending: false });

      if (examsError) throw examsError;

      // Fetch marks for each exam
      const examsWithMarks: ExamWithMarks[] = await Promise.all(
        (examsData || []).map(async (exam) => {
          const { data: marksData } = await supabase
            .from('marks')
            .select('*')
            .eq('exam_id', exam.id);
          
          return {
            ...exam,
            marks: (marksData || []) as Mark[],
          } as ExamWithMarks;
        })
      );

      setStudent({
        ...(studentData as Student),
        exams: examsWithMarks,
      });

      if (examsWithMarks.length > 0) {
        setSelectedExamId(examsWithMarks[0].id);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The student you're looking for doesn't exist.
          </p>
          <Link to="/students">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          to="/students"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Students
        </Link>

        {/* Student Profile */}
        <div className="card-elevated p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shrink-0">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                  <p className="text-muted-foreground">ID: {student.student_id}</p>
                </div>
                <Badge className="text-sm">Class {student.class}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Age: {student.age} years</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{student.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{student.village}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Book className="h-4 w-4 text-muted-foreground" />
                  <span>{student.medium_of_instruction} Medium</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Guardian: <span className="text-foreground">{student.parent_guardian_name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {student.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/marks">
            <Button className="btn-primary-gradient">
              <ClipboardList className="mr-2 h-4 w-4" />
              Record New Marks
            </Button>
          </Link>
          {student.exams.length > 0 && (
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Download All Reports
            </Button>
          )}
        </div>

        {/* Exam History & Report Card */}
        {student.exams.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exam List */}
            <div className="card-elevated p-6">
              <h2 className="section-title">Exam History</h2>
              <div className="space-y-2">
                {student.exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedExamId === exam.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <p className="font-medium">{exam.exam_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exam.exam_date), 'dd MMM yyyy')}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Card */}
            <div className="lg:col-span-2">
              <ReportCard student={student} examId={selectedExamId} />
            </div>
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Exam Records</h3>
            <p className="text-muted-foreground mb-4">
              This student doesn't have any exam records yet.
            </p>
            <Link to="/marks">
              <Button className="btn-primary-gradient">
                <ClipboardList className="mr-2 h-4 w-4" />
                Record First Exam
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
