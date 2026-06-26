import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['courses']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type CourseWithInstructor = Course & { instructor: Profile | null };

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCourses(data as unknown as CourseWithInstructor[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);

    if (!error) {
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !currentStatus } : c));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Course Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor and manage platform courses</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/20">
                  <th className="py-4 pl-6 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Course</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Instructor</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price (KES)</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {courses.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="font-medium text-foreground">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.category || 'Uncategorized'}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {c.instructor?.full_name || 'No Instructor'}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {c.price_kes}
                    </td>
                    <td className="py-4 px-4">
                      {c.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => togglePublish(c.id, c.is_published)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {c.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
