import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentDetail from "./pages/StudentDetail";
import RecordMarks from "./pages/RecordMarks";
import Reports from "./pages/Reports";
import LessonPlanner from "./pages/LessonPlanner";
import VisualAidDesign from "./pages/VisualAidDesign";
import QuizGenerator from "./pages/QuizGenerator";
import WorksheetGenerator from "./pages/WorksheetGenerator";
import QuestionPaperGenerator from "./pages/QuestionPaperGenerator";
import KnowledgeBase from "./pages/KnowledgeBase";
import StoryGenerator from "./pages/StoryGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ai-sahayak-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/students" element={<ProtectedPage><Students /></ProtectedPage>} />
              <Route path="/students/new" element={<ProtectedPage><AddStudent /></ProtectedPage>} />
              <Route path="/students/:id" element={<ProtectedPage><StudentDetail /></ProtectedPage>} />
              <Route path="/marks" element={<ProtectedPage><RecordMarks /></ProtectedPage>} />
              <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
              <Route path="/lesson-planner" element={<ProtectedPage><LessonPlanner /></ProtectedPage>} />
              <Route path="/visual-aid" element={<ProtectedPage><VisualAidDesign /></ProtectedPage>} />
              <Route path="/quiz-generator" element={<ProtectedPage><QuizGenerator /></ProtectedPage>} />
              <Route path="/worksheet-generator" element={<ProtectedPage><WorksheetGenerator /></ProtectedPage>} />
              <Route path="/question-paper" element={<ProtectedPage><QuestionPaperGenerator /></ProtectedPage>} />
              <Route path="/knowledge-base" element={<ProtectedPage><KnowledgeBase /></ProtectedPage>} />
              <Route path="/story-generator" element={<ProtectedPage><StoryGenerator /></ProtectedPage>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
