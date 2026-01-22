import { Link } from 'react-router-dom';
import { User, MapPin, Book, Calendar } from 'lucide-react';
import { Student } from '@/types/student';
import { Badge } from '@/components/ui/badge';

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link to={`/students/${student.id}`}>
      <div className="card-elevated p-5 hover:border-primary/30 cursor-pointer animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{student.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Class {student.class}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{student.village}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Book className="h-4 w-4" />
            <span>{student.medium_of_instruction} Medium</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Age: {student.age} years</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Subjects:</p>
          <div className="flex flex-wrap gap-1">
            {student.subjects.slice(0, 4).map((subject) => (
              <span
                key={subject}
                className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground"
              >
                {subject}
              </span>
            ))}
            {student.subjects.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground">
                +{student.subjects.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
