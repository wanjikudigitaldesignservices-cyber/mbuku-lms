import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Award, Bot, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['courses']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];

type EnrolledCourseData = Enrollment & {
  course: Course;
};

export function StudentDashboardPage() {
  const { profile, user } = useAuthContext();
  const [enrollments, setEnrollments] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (!error && data) {
        setEnrollments(data as unknown as EnrolledCourseData[]);
      }
      setLoading(false);
    }
    
    fetchEnrollments();
  }, [user]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {profile?.full_name?.split(' ')[0] || 'Learner'} 🎓
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue your learning journey
        </p>
      </motion.div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: Compass,
            label: 'Browse Catalog',
            desc: 'Find new courses',
            href: '/courses',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            icon: Award,
            label: 'My Certificates',
            desc: 'View your achievements',
            href: '/learn/certificates',
            gradient: 'from-amber-500 to-amber-600',
          },
          {
            icon: Bot,
            label: 'AI Tutor',
            desc: 'Get help anytime',
            href: '/learn/tutor',
            gradient: 'from-purple-500 to-purple-600',
          },
        ].map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
          >
            <Link
              to={item.href}
              className={cn(
                'group flex items-start gap-4 rounded-2xl border border-white/[0.06]',
                'bg-card/30 backdrop-blur-sm p-5',
                'transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg'
              )}
            >
              <div className={cn('rounded-xl p-2.5 bg-gradient-to-br', item.gradient)}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {item.label}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">My Learning</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-card/30"
        >
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't enrolled in any courses yet. Explore our catalog to start learning.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            Browse Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr, i) => (
            <motion.div
              key={enr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl"
            >
              <div className="aspect-video w-full bg-black/40 relative">
                {enr.course.thumbnail_url ? (
                  <img src={enr.course.thumbnail_url} alt={enr.course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <BookOpen className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-md bg-black/60 text-white border border-white/10">
                  {enr.progress_percent}% Complete
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2">
                  {enr.course.title}
                </h3>
                
                {/* Progress Bar */}
                <div className="mb-6 mt-auto">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${enr.progress_percent}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/learn/courses/${enr.course.slug}/lessons/resume`}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
                    enr.progress_percent === 100 
                      ? "bg-white/5 hover:bg-white/10 text-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  )}
                >
                  <PlayCircle className="w-4 h-4" />
                  {enr.progress_percent === 0 ? 'Start Course' : enr.progress_percent === 100 ? 'Review Course' : 'Resume Learning'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
