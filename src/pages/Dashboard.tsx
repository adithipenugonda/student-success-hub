import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Student } from '@/types/student';
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  FileText,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    classDistribution: {} as Record<string, number>,
    recentStudents: [] as Student[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all students
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate class distribution
      const distribution: Record<string, number> = {};
      (students || []).forEach((student: Student) => {
        distribution[student.class] = (distribution[student.class] || 0) + 1;
      });

      setStats({
        totalStudents: students?.length || 0,
        classDistribution: distribution,
        recentStudents: (students || []).slice(0, 5) as Student[],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: UserPlus,
      label: 'Add New Student',
      description: 'Register a new admission',
      href: '/students/new',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: ClipboardList,
      label: 'Record Marks',
      description: 'Enter exam results',
      href: '/marks',
      color: 'bg-accent/10 text-accent-foreground',
    },
    {
      icon: FileText,
      label: 'Generate Reports',
      description: 'View report cards',
      href: '/reports',
      color: 'bg-success/10 text-success',
    },
    {
      icon: Users,
      label: 'All Students',
      description: 'View student list',
      href: '/students',
      color: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-header flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              AI Sahayak Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Student Academic Management System
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : stats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-accent">
                <TrendingUp className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes Active</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : Object.keys(stats.classDistribution).length}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
                <FileText className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Admissions</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? '...' : stats.recentStudents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <div className="card-elevated p-5 hover:border-primary/30 cursor-pointer group">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Class Distribution & Recent Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Distribution */}
          <div className="card-elevated p-6">
            <h2 className="section-title">Students by Class</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : Object.keys(stats.classDistribution).length === 0 ? (
              <p className="text-muted-foreground">No students enrolled yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.classDistribution)
                  .sort((a, b) => {
                    const numA = parseInt(a[0]) || 0;
                    const numB = parseInt(b[0]) || 0;
                    return numA - numB;
                  })
                  .map(([cls, count]) => (
                    <div key={cls} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-20">Class {cls}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / stats.totalStudents) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent Students */}
          <div className="card-elevated p-6">
            <h2 className="section-title">Recent Admissions</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : stats.recentStudents.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No students yet.</p>
                <Link
                  to="/students/new"
                  className="text-primary text-sm hover:underline"
                >
                  Add your first student →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    to={`/students/${student.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {student.class} • {student.village}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{student.student_id}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
