import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { PlusCircle, BookOpen, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['courses']['Row'];

export function InstructorCourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your course catalog
          </p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Link>
      </motion.div>

      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl border border-dashed border-white/[0.1] p-12 text-center"
        >
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground mb-4">
            Get started by creating your first course.
          </p>
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Create Course
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl"
            >
              <div className="aspect-video w-full bg-black/40 overflow-hidden relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <BookOpen className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-md",
                    course.is_published 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                  )}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-md bg-black/50 text-white border border-white/10">
                    {course.level}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-lg font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {course.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                    {course.price_kes === 0 ? 'Free' : `KES ${course.price_kes}`}
                  </div>
                  <Link
                    to={`/instructor/courses/${course.id}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
