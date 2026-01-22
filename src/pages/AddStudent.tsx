import { MainLayout } from '@/components/layout/MainLayout';
import { StudentForm } from '@/components/students/StudentForm';
import { UserPlus } from 'lucide-react';

export default function AddStudent() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-header flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            New Student Admission
          </h1>
          <p className="text-muted-foreground mt-1">
            Register a new student with their academic details
          </p>
        </div>

        {/* Form */}
        <StudentForm />
      </div>
    </MainLayout>
  );
}
