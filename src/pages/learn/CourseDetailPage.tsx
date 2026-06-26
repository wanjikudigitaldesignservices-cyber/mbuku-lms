import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Lock, Loader2, PlayCircle } from 'lucide-react';
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

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumData[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourseData() {
      if (!slug) return;
      setLoading(true);

      // 1. Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (courseError || !courseData) {
        console.error('Course not found:', courseError);
        navigate('/courses');
        return;
      }
      setCourse(courseData);

      // 2. Fetch enrollment status if logged in
      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseData.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsEnrolled(!!enrollment);
      }

      // 3. Fetch Curriculum
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('position', { ascending: true });

      if (modulesData && modulesData.length > 0) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .in('module_id', modulesData.map(m => m.id))
          .order('position', { ascending: true });

        const assembled = modulesData.map(m => ({
          ...m,
          lessons: (lessonsData || []).filter(l => l.module_id === m.id),
        }));
        setCurriculum(assembled);
      }

      setLoading(false);
    }

    fetchCourseData();
  }, [slug, user, navigate]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/courses/${slug}` } });
      return;
    }

    if (!course) return;

    if (course.price_kes > 0) {
      setEnrolling(true);
      setError('');
      try {
        const { data, error: funcErr } = await supabase.functions.invoke('intasend-checkout', {
          body: {
            course_id: course.id,
            user_id: user.id,
          }
        });

        if (funcErr) throw funcErr;

        if (data && data.url) {
          // Redirect to IntaSend payment page
          window.location.href = data.url;
          return;
        } else {
          throw new Error('Failed to generate payment link');
        }
      } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.message || 'Failed to initiate payment.');
        setEnrolling(false);
      }
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          course_id: course.id,
          user_id: user.id,
          status: 'active',
        } as any);

      if (error) throw error;
      
      setIsEnrolled(true);
      
      // Auto-navigate to the first lesson if it exists
      if (curriculum.length > 0 && curriculum[0].lessons.length > 0) {
        navigate(`/learn/courses/${course.slug}/lessons/${curriculum[0].lessons[0].id}`);
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Failed to enroll in the course.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = curriculum.reduce((acc, curr) => acc + curr.lessons.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Catalog
            </Link>
            
            <div className="flex gap-3">
              {course.category && (
                <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-primary/10 text-primary border border-primary/20">
                  {course.category}
                </span>
              )}
              <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-white/5 text-muted-foreground border border-white/10">
                {course.level}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {course.title}
            </h1>
            
            <p className="text-lg text-muted-foreground">
              {course.description}
            </p>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{totalLessons} Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Self-paced</span>
              </div>
            </div>

            <div className="pt-6">
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                  {error}
                </div>
              )}
              
              {isEnrolled ? (
                <Link
                  to={`/learn/courses/${course.slug}/lessons/${curriculum[0]?.lessons[0]?.id || ''}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <PlayCircle className="h-5 w-5" />
                  Continue Learning
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {enrolling && <Loader2 className="h-5 w-5 animate-spin" />}
                    {course.price_kes === 0 ? 'Enroll for Free' : `Enroll for KES ${course.price_kes.toLocaleString()}`}
                  </button>
                  {course.price_kes > 0 && (
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Secure payment via M-Pesa. Instant access after payment.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl bg-black/40">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                  <BookOpen className="h-16 w-16 mb-4" />
                  <span>No preview available</span>
                </div>
              )}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8">Course Syllabus</h2>
        
        {curriculum.length === 0 ? (
          <p className="text-muted-foreground">Syllabus is being prepared for this course.</p>
        ) : (
          <div className="space-y-6">
            {curriculum.map((module, i) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-6 bg-white/[0.02] border-b border-white/[0.04]">
                  <h3 className="text-xl font-bold text-foreground">
                    Module {i + 1}: {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {module.lessons.length} lessons
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {module.lessons.map((lesson, j) => (
                    <div key={lesson.id} className="flex items-center p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground mr-4">
                        {j + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{lesson.content_type}</p>
                      </div>
                      {isEnrolled ? (
                        <Link
                          to={`/learn/courses/${course.slug}/lessons/${lesson.id}`}
                          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          <PlayCircle className="h-4 w-4" /> Start
                        </Link>
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
