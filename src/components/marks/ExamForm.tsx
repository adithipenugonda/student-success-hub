import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { ClipboardCheck, Loader2, Search } from 'lucide-react';

export function ExamForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    exam_name: '',
    exam_date: new Date().toISOString().split('T')[0],
    max_marks: '100',
    teacher_remarks: '',
  });
  const [subjectMarks, setSubjectMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setStudents(data as Student[]);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      // Initialize marks for each subject
      const marks: Record<string, string> = {};
      student.subjects.forEach((subject) => {
        marks[subject] = '';
      });
      setSubjectMarks(marks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !formData.exam_name || !formData.exam_date) {
      toast({
        title: 'Missing Information',
        description: 'Please select a student and fill in exam details.',
        variant: 'destructive',
      });
      return;
    }

    // Check if all subjects have marks
    const hasAllMarks = selectedStudent.subjects.every(
      (subject) => subjectMarks[subject] && subjectMarks[subject] !== ''
    );

    if (!hasAllMarks) {
      toast({
        title: 'Missing Marks',
        description: 'Please enter marks for all subjects.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create exam record
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          student_id: selectedStudent.id,
          exam_name: formData.exam_name,
          exam_date: formData.exam_date,
          max_marks: parseInt(formData.max_marks),
          teacher_remarks: formData.teacher_remarks || null,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create marks records
      const marksData = selectedStudent.subjects.map((subject) => ({
        exam_id: exam.id,
        subject,
        marks_obtained: parseInt(subjectMarks[subject]),
        max_marks: parseInt(formData.max_marks),
      }));

      const { error: marksError } = await supabase.from('marks').insert(marksData);

      if (marksError) throw marksError;

      toast({
        title: 'Marks Recorded Successfully!',
        description: `${formData.exam_name} marks saved for ${selectedStudent.name}.`,
      });

      navigate(`/students/${selectedStudent.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record marks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Student Selection */}
      <div className="card-elevated p-6">
        <h3 className="section-title">Select Student</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <Select
          value={selectedStudent?.id || ''}
          onValueChange={handleStudentSelect}
        >
          <SelectTrigger className="input-field">
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {filteredStudents.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} ({student.student_id}) - Class {student.class}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStudent && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{selectedStudent.name}</p>
            <p className="text-xs text-muted-foreground">
              Class {selectedStudent.class} • {selectedStudent.village}
            </p>
          </div>
        )}
      </div>

      {/* Exam Details */}
      <div className="card-elevated p-6">
        <h3 className="section-title">Exam Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="exam_name">Exam Name *</Label>
            <Input
              id="exam_name"
              placeholder="e.g., Mid-Term Exam"
              value={formData.exam_name}
              onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam_date">Exam Date *</Label>
            <Input
              id="exam_date"
              type="date"
              value={formData.exam_date}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_marks">Maximum Marks</Label>
            <Input
              id="max_marks"
              type="number"
              min="1"
              value={formData.max_marks}
              onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Subject-wise Marks */}
      {selectedStudent && (
        <div className="card-elevated p-6">
          <h3 className="section-title">Subject-wise Marks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedStudent.subjects.map((subject) => (
              <div key={subject} className="space-y-2">
                <Label htmlFor={subject}>{subject} *</Label>
                <Input
                  id={subject}
                  type="number"
                  min="0"
                  max={formData.max_marks}
                  placeholder={`Out of ${formData.max_marks}`}
                  value={subjectMarks[subject] || ''}
                  onChange={(e) =>
                    setSubjectMarks({ ...subjectMarks, [subject]: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Remarks */}
      <div className="card-elevated p-6">
        <h3 className="section-title">Teacher Remarks (Optional)</h3>
        <Textarea
          placeholder="Add any comments or observations about the student's performance..."
          value={formData.teacher_remarks}
          onChange={(e) => setFormData({ ...formData, teacher_remarks: e.target.value })}
          className="input-field min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/students')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !selectedStudent}
          className="btn-primary-gradient px-8"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Save Marks
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
