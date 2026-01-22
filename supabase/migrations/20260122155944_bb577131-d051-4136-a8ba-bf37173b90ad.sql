-- Create students table
CREATE TABLE public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    parent_guardian_name TEXT NOT NULL,
    village TEXT NOT NULL,
    medium_of_instruction TEXT NOT NULL,
    subjects TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    teacher_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marks table (subject-wise marks for each exam)
CREATE TABLE public.marks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    marks_obtained INTEGER NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public access for this school management system)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for school management
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on marks" ON public.marks FOR ALL USING (true) WITH CHECK (true);

-- Function to generate unique student ID
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    class_code TEXT;
    sequence_num INTEGER;
    new_student_id TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YY');
    class_code := UPPER(SUBSTRING(NEW.class FROM 1 FOR 2));
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 5) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.students
    WHERE student_id LIKE year_part || class_code || '%';
    
    new_student_id := year_part || class_code || LPAD(sequence_num::TEXT, 4, '0');
    NEW.student_id := new_student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate student ID
CREATE TRIGGER generate_student_id_trigger
    BEFORE INSERT ON public.students
    FOR EACH ROW
    WHEN (NEW.student_id IS NULL OR NEW.student_id = '')
    EXECUTE FUNCTION public.generate_student_id();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updating timestamps on students
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();