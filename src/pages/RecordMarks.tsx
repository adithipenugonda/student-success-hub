import { MainLayout } from '@/components/layout/MainLayout';
import { ExamForm } from '@/components/marks/ExamForm';
import { ClipboardList } from 'lucide-react';

export default function RecordMarks() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Record Exam Marks
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter subject-wise marks for a student's exam
          </p>
        </div>

        {/* Form */}
        <ExamForm />
      </div>
    </MainLayout>
  );
}
