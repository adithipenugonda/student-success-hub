export interface Student {
  id: string;
  student_id: string;
  name: string;
  class: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  parent_guardian_name: string;
  village: string;
  medium_of_instruction: string;
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  student_id: string;
  exam_name: string;
  exam_date: string;
  max_marks: number;
  teacher_remarks?: string;
  created_at: string;
}

export interface Mark {
  id: string;
  exam_id: string;
  subject: string;
  marks_obtained: number;
  max_marks: number;
  created_at: string;
}

export interface ExamWithMarks extends Exam {
  marks: Mark[];
}

export interface StudentWithExams extends Student {
  exams: ExamWithMarks[];
}

export type GradeLevel = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export const calculateGrade = (percentage: number): GradeLevel => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const getGradeColor = (grade: GradeLevel): string => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'badge-grade-a';
    case 'B':
      return 'badge-grade-b';
    case 'C':
      return 'badge-grade-c';
    case 'D':
      return 'badge-grade-d';
    case 'F':
      return 'badge-grade-f';
    default:
      return 'badge-grade-c';
  }
};

export const CLASSES = [
  '1st', '2nd', '3rd', '4th', '5th', 
  '6th', '7th', '8th', '9th', '10th',
  '11th', '12th'
];

export const MEDIUMS = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati'];

export const DEFAULT_SUBJECTS = [
  'Hindi', 'English', 'Mathematics', 'Science', 'Social Studies',
  'Computer Science', 'Physical Education', 'Art'
];
