import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Student, CLASSES } from '@/types/student';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, FileText, Users, Printer } from 'lucide-react';

export default function Reports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('class')
        .order('name');

      if (error) throw error;
      setStudents((data || []) as Student[]);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;

    return matchesSearch && matchesClass;
  });

  // Group students by class
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const cls = student.class;
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-header flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Report Cards
            </h1>
            <p className="text-muted-foreground mt-1">
              View and generate student report cards
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="input-field w-full md:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedClass !== 'all'
                ? 'No students match your search criteria.'
                : 'Add students to generate report cards.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStudents)
              .sort((a, b) => {
                const numA = parseInt(a[0]) || 0;
                const numB = parseInt(b[0]) || 0;
                return numA - numB;
              })
              .map(([cls, classStudents]) => (
                <div key={cls} className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm">
                        {classStudents.length}
                      </span>
                      Class {cls}
                    </h2>
                    <Button variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Print All
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="table-header">
                          <th className="text-left p-3">Student ID</th>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Village</th>
                          <th className="text-left p-3">Guardian</th>
                          <th className="text-center p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student) => (
                          <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                            <td className="p-3 font-mono text-sm">{student.student_id}</td>
                            <td className="p-3 font-medium">{student.name}</td>
                            <td className="p-3 text-muted-foreground">{student.village}</td>
                            <td className="p-3 text-muted-foreground">{student.parent_guardian_name}</td>
                            <td className="p-3 text-center">
                              <Link to={`/students/${student.id}`}>
                                <Button size="sm" variant="outline">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Report
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
