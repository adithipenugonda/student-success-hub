import { StudentWithExams, calculateGrade, getGradeColor } from '@/types/student';
import { format } from 'date-fns';
import { Printer, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportCardProps {
  student: StudentWithExams;
  examId?: string;
}

export function ReportCard({ student, examId }: ReportCardProps) {
  const exam = examId 
    ? student.exams.find(e => e.id === examId) 
    : student.exams[0];

  if (!exam || !exam.marks || exam.marks.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground">No exam records found for this student.</p>
      </div>
    );
  }

  const totalObtained = exam.marks.reduce((sum, m) => sum + m.marks_obtained, 0);
  const totalMax = exam.marks.reduce((sum, m) => sum + m.max_marks, 0);
  const percentage = (totalObtained / totalMax) * 100;
  const grade = calculateGrade(percentage);

  // Generate performance summary based on grade level
  const getPerformanceSummary = () => {
    const classNum = parseInt(student.class);
    
    if (classNum <= 5) {
      // Simpler feedback for lower grades
      if (percentage >= 80) return 'Bahut accha kaam! Keep it up! 🌟';
      if (percentage >= 60) return 'Good effort! Practice more. 📚';
      if (percentage >= 40) return 'Try harder. You can do it! 💪';
      return 'Need more practice. Don\'t give up! 🎯';
    } else {
      // Analytical feedback for higher grades
      if (percentage >= 80) return 'Excellent performance! Shows strong conceptual understanding and analytical skills.';
      if (percentage >= 60) return 'Good academic progress. Focus on weak areas to improve further.';
      if (percentage >= 40) return 'Average performance. Requires dedicated study time and practice.';
      return 'Below expectations. Needs immediate attention and remedial classes.';
    }
  };

  // Identify strengths and areas for improvement
  const sortedMarks = [...exam.marks].sort(
    (a, b) => (b.marks_obtained / b.max_marks) - (a.marks_obtained / a.max_marks)
  );
  const strengths = sortedMarks.slice(0, 2).map(m => m.subject);
  const improvements = sortedMarks.slice(-2).map(m => m.subject);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      {/* Report Card */}
      <div className="card-elevated p-8 print:shadow-none print:border-2 print:border-foreground">
        {/* Header */}
        <div className="text-center border-b border-border pb-6 mb-6">
          <div className="flex justify-center mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Sahayak School</h1>
          <p className="text-muted-foreground">Student Report Card</p>
          <p className="text-sm text-muted-foreground mt-1">
            {exam.exam_name} • {format(new Date(exam.exam_date), 'MMMM yyyy')}
          </p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
          <div>
            <p className="text-muted-foreground">Student Name</p>
            <p className="font-semibold">{student.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Student ID</p>
            <p className="font-semibold">{student.student_id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class</p>
            <p className="font-semibold">{student.class}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Guardian</p>
            <p className="font-semibold">{student.parent_guardian_name}</p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="mb-8">
          <h3 className="section-title">Subject-wise Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3 border border-border">Subject</th>
                  <th className="text-center p-3 border border-border">Marks Obtained</th>
                  <th className="text-center p-3 border border-border">Maximum Marks</th>
                  <th className="text-center p-3 border border-border">Percentage</th>
                  <th className="text-center p-3 border border-border">Grade</th>
                </tr>
              </thead>
              <tbody>
                {exam.marks.map((mark) => {
                  const pct = (mark.marks_obtained / mark.max_marks) * 100;
                  const subjectGrade = calculateGrade(pct);
                  return (
                    <tr key={mark.id} className="hover:bg-muted/30">
                      <td className="p-3 border border-border font-medium">{mark.subject}</td>
                      <td className="text-center p-3 border border-border">{mark.marks_obtained}</td>
                      <td className="text-center p-3 border border-border">{mark.max_marks}</td>
                      <td className="text-center p-3 border border-border">{pct.toFixed(1)}%</td>
                      <td className="text-center p-3 border border-border">
                        <span className={getGradeColor(subjectGrade)}>{subjectGrade}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 font-semibold">
                  <td className="p-3 border border-border">Total</td>
                  <td className="text-center p-3 border border-border">{totalObtained}</td>
                  <td className="text-center p-3 border border-border">{totalMax}</td>
                  <td className="text-center p-3 border border-border">{percentage.toFixed(1)}%</td>
                  <td className="text-center p-3 border border-border">
                    <span className={getGradeColor(grade)}>{grade}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-success/10 rounded-lg">
            <h4 className="font-semibold text-success mb-2">Strengths</h4>
            <ul className="text-sm space-y-1">
              {strengths.map((subject) => (
                <li key={subject}>• {subject}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg">
            <h4 className="font-semibold text-warning-foreground mb-2">Areas for Improvement</h4>
            <ul className="text-sm space-y-1">
              {improvements.map((subject) => (
                <li key={subject}>• {subject}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary & Remarks */}
        <div className="space-y-4 border-t border-border pt-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Performance Summary</h4>
            <p className="text-sm">{getPerformanceSummary()}</p>
          </div>

          {exam.teacher_remarks && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Teacher's Remarks</h4>
              <p className="text-sm italic">"{exam.teacher_remarks}"</p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <div className="border-t border-foreground w-48 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Class Teacher's Signature</p>
          </div>
          <div className="text-center">
            <div className="border-t border-foreground w-48 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Principal's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
