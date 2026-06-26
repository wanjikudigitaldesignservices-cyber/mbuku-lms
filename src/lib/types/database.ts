// ============================================================
// mbuku LMS — Database TypeScript Types
// Manually authored to match the SQL schema exactly
// ============================================================

export type UserRole = 'admin' | 'instructor' | 'student';
export type LessonContentType = 'video' | 'text' | 'quiz';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';
export type AiMessageRole = 'user' | 'assistant';

// ----- Profiles -----
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// ----- Courses -----
export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  price_kes: number;
  thumbnail_url: string | null;
  is_published: boolean;
  instructor_id: string | null;
  created_at: string;
}

// ----- Modules -----
export interface Module {
  id: string;
  course_id: string;
  title: string;
  position: number;
}

// ----- Lessons -----
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: LessonContentType;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  position: number;
}

// ----- Enrollments -----
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percent: number;
  enrolled_at: string;
}

// ----- Lesson Progress -----
export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
}

// ----- Quizzes -----
export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[]; // jsonb array
  correct_answer: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number | null;
  passed: boolean | null;
  answers: Record<string, string> | null; // jsonb
  attempted_at: string;
}

// ----- Certificates -----
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  verification_code: string;
  pdf_path: string | null;
  issued_at: string;
}

export interface CertificatePublicView {
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  course_title: string;
  learner_name: string;
}

// ----- AI Tutor -----
export interface AiTutorSession {
  id: string;
  user_id: string;
  course_id: string | null;
  lesson_id: string | null;
  created_at: string;
}

export interface AiTutorMessage {
  id: string;
  session_id: string;
  role: AiMessageRole;
  content: string;
  created_at: string;
}

export interface AiTutorUsage {
  user_id: string;
  usage_date: string;
  message_count: number;
}

// ----- Payments -----
export interface Payment {
  id: string;
  user_id: string;
  course_id: string | null;
  amount_kes: number;
  intasend_invoice_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// ----- Supabase Database type helper -----
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Course, 'id'>>;
      };
      modules: {
        Row: Module;
        Insert: Omit<Module, 'id'> & { id?: string };
        Update: Partial<Omit<Module, 'id'>>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, 'id'> & { id?: string };
        Update: Partial<Omit<Lesson, 'id'>>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, 'id' | 'enrolled_at' | 'status' | 'progress_percent'> & {
          id?: string;
          enrolled_at?: string;
          status?: EnrollmentStatus;
          progress_percent?: number;
        };
        Update: Partial<Omit<Enrollment, 'id'>>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, 'id'> & { id?: string };
        Update: Partial<Omit<LessonProgress, 'id'>>;
      };
      quizzes: {
        Row: Quiz;
        Insert: Omit<Quiz, 'id'> & { id?: string };
        Update: Partial<Omit<Quiz, 'id'>>;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Omit<QuizQuestion, 'id'> & { id?: string };
        Update: Partial<Omit<QuizQuestion, 'id'>>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, 'id' | 'attempted_at'> & { id?: string; attempted_at?: string };
        Update: Partial<Omit<QuizAttempt, 'id'>>;
      };
      certificates: {
        Row: Certificate;
        Insert: Omit<Certificate, 'id' | 'issued_at'> & { id?: string; issued_at?: string };
        Update: Partial<Omit<Certificate, 'id'>>;
      };
      ai_tutor_sessions: {
        Row: AiTutorSession;
        Insert: Omit<AiTutorSession, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AiTutorSession, 'id'>>;
      };
      ai_tutor_messages: {
        Row: AiTutorMessage;
        Insert: Omit<AiTutorMessage, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AiTutorMessage, 'id'>>;
      };
      ai_tutor_usage: {
        Row: AiTutorUsage;
        Insert: AiTutorUsage;
        Update: Partial<AiTutorUsage>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Payment, 'id'>>;
      };
    };
    Views: {
      certificate_public_view: {
        Row: CertificatePublicView;
      };
    };
  };
}
