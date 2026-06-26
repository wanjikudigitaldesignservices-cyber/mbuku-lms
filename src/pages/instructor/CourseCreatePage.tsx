import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Link } from 'react-router';

import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { courseSchema, type CourseFormData } from '@/lib/validations';

export function InstructorCourseCreatePage() {
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      category: '',
      level: 'Beginner',
      price_kes: 0,
      is_published: false,
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    if (!profile) return;
    setIsSubmitting(true);
    setError('');

    try {
      const { data: newCourse, error: insertError } = (await supabase
        .from('courses')
        .insert({
          ...(data as any),
          instructor_id: profile.id,
        })
        .select()
        .single()) as any;

      if (insertError) throw insertError;

      // Navigate to the edit page where they can add modules and lessons
      navigate(`/instructor/courses/${newCourse.id}`);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          to="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the basic details to start building your course.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6 sm:p-8 shadow-lg"
      >
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Course Title</label>
              <input
                {...register('title')}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Advanced React Patterns"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL Slug</label>
              <input
                {...register('slug')}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. advanced-react-patterns"
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="What will students learn in this course?"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <input
                {...register('category')}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Frontend Dev"
              />
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Level</label>
              <select
                {...register('level')}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="text-xs text-destructive">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price (KES)</label>
              <input
                type="number"
                {...register('price_kes')}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="0 for free"
              />
              {errors.price_kes && (
                <p className="text-xs text-destructive">{errors.price_kes.message}</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create Course
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
