import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, Loader2, Menu, X, Check } from 'lucide-react';
import { AiTutorChat } from '@/components/learn/AiTutorChat';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['courses']['Row'];
type Module = Database['public']['Tables']['modules']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

type CurriculumData = Module & {
  lessons: Lesson[];
};

export function LessonPlayerPage() {
  const { slug, lesson_id } = useParams<{ slug: string; lesson_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumData[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    async function fetchLessonData() {
      if (!slug || !user) {
        navigate('/courses');
        return;
      }
      setLoading(true);

      // 1. Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!courseData) {
        navigate('/courses');
        return;
      }
      setCourse(courseData);

      // 2. Verify enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!enrollment) {
        // Not enrolled -> block access
        navigate(`/courses/${slug}`);
        return;
      }

      // 3. Fetch Curriculum
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('position', { ascending: true });

      let assembled: CurriculumData[] = [];
      if (modulesData) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .in('module_id', modulesData.map(m => m.id))
          .order('position', { ascending: true });

        assembled = modulesData.map(m => ({
          ...m,
          lessons: (lessonsData || []).filter(l => l.module_id === m.id),
        }));
        setCurriculum(assembled);

        if (lesson_id && lesson_id !== 'resume') {
          const found = lessonsData?.find(l => l.id === lesson_id);
          if (found) setCurrentLesson(found);
        } else if (lessonsData && lessonsData.length > 0) {
          // If 'resume' or no lesson_id, we need to find the first uncompleted lesson
          // We will do this after we fetch progress data
        }
      }

      // 4. Fetch Progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressData) {
        const completedIds = new Set(progressData.map(p => p.lesson_id));
        setCompletedLessonIds(completedIds);
        
        // Handle 'resume' routing
        if (lesson_id === 'resume' || !lesson_id) {
          const allLessons = assembled.flatMap((m: any) => m.lessons);
          const firstUncompleted = allLessons.find((l: any) => !completedIds.has(l.id));
          const targetLesson = firstUncompleted || allLessons[0];
          if (targetLesson) {
            navigate(`/learn/courses/${slug}/lessons/${targetLesson.id}`, { replace: true });
          }
        }
      }

      setLoading(false);
    }

    fetchLessonData();
  }, [slug, lesson_id, user, navigate]);

  const handleMarkComplete = async () => {
    if (!currentLesson || !user) return;
    
    setMarkingComplete(true);
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: 60, // Dummy tracking for now
        } as any, { onConflict: 'user_id, lesson_id' });

      if (error) throw error;

      setCompletedLessonIds(prev => new Set(prev).add(currentLesson.id));
      
      // Navigate to next lesson logic
      const flatLessons = curriculum.flatMap(m => m.lessons);
      const currentIndex = flatLessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) {
        navigate(`/learn/courses/${slug}/lessons/${flatLessons[currentIndex + 1].id}`);
      }

    } catch (err) {
      console.error('Error marking complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;

  return (
    <div className="flex h-screen bg-background overflow-hidden pt-16">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden absolute top-20 left-4 z-50 p-2 bg-card border border-white/[0.1] rounded-md shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-white/[0.06] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block pt-16 lg:pt-0 overflow-y-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/[0.04]">
          <Link to={`/courses/${slug}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </Link>
          <h2 className="font-bold text-lg text-foreground line-clamp-2">{course?.title}</h2>
          
          {/* Progress Bar Mini */}
          {curriculum.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {Math.round((completedLessonIds.size / curriculum.reduce((acc, curr) => acc + curr.lessons.length, 0)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(completedLessonIds.size / Math.max(1, curriculum.reduce((acc, curr) => acc + curr.lessons.length, 0))) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {curriculum.map((module, mIdx) => (
            <div key={module.id}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                Module {mIdx + 1}: {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons.map((lesson, lIdx) => {
                  const isCurrent = lesson.id === currentLesson?.id;
                  const isDone = completedLessonIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      to={`/learn/courses/${slug}/lessons/${lesson.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        isCurrent 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground hover:bg-white/5"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className={cn("w-4 h-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground/50")} />
                      )}
                      <span className="line-clamp-2 flex-1">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          {currentLesson ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentLesson.id}
            >
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">{currentLesson.title}</h1>
              </div>

              {/* Player / Content */}
              <div className="rounded-xl overflow-hidden bg-card border border-white/[0.06] mb-8 shadow-xl">
                {currentLesson.content_type === 'video' && currentLesson.video_url ? (
                  <div className="aspect-video w-full bg-black">
                    {/* Basic YouTube embed support - in reality, use a robust player */}
                    {currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${currentLesson.video_url.split(/[v=|\/]/).pop()}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-black/50">
                        <PlayCircle className="w-16 h-16 opacity-50 mb-2" />
                        <span>Video Source: {currentLesson.video_url}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 prose prose-invert max-w-none">
                    {/* Render Text/Markdown Content */}
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content || 'No content available.' }} />
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between p-6 bg-card border border-white/[0.06] rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next up: {curriculum.flatMap(m => m.lessons)[curriculum.flatMap(m => m.lessons).findIndex(l => l.id === currentLesson.id) + 1]?.title || 'End of Course'}
                  </p>
                </div>
                
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleted || markingComplete}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  )}
                >
                  {markingComplete ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select a lesson from the sidebar to begin.
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* AI Tutor Chat */}
      {course && currentLesson && (
        <AiTutorChat 
          courseId={course.id}
          courseTitle={course.title}
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
          lessonContent={currentLesson.content || currentLesson.video_url || ''}
        />
      )}
    </div>
  );
}
