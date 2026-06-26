import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { courseSchema, type CourseFormData } from '@/lib/validations';
import type { Database } from '@/lib/types/database';

// We will build this next
import { CourseCurriculum } from './CourseCurriculum';

type Course = Database['public']['Tables']['courses']['Row'];

export function InstructorCourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const isPublished = watch('is_published');
  const thumbnailUrl = watch('thumbnail_url');

  useEffect(() => {
    async function fetchCourse() {
      if (!id) return;
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching course:', error);
        navigate('/instructor/courses');
        return;
      }

      setCourse(data);
      // Populate form
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('description', data.description || '');
      setValue('category', data.category || '');
      setValue('level', data.level as any || 'Beginner');
      setValue('price_kes', Number(data.price_kes) || 0);
      setValue('thumbnail_url', data.thumbnail_url || '');
      setValue('is_published', data.is_published || false);
      
      setLoading(false);
    }
    fetchCourse();
  }, [id, navigate, setValue]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');
      
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course_thumbnails')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('course_thumbnails')
        .getPublicUrl(filePath);

      setValue('thumbnail_url', data.publicUrl, { shouldDirty: true });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          title: data.title,
          slug: data.slug,
          description: data.description,
          category: data.category,
          level: data.level,
          price_kes: data.price_kes,
          thumbnail_url: data.thumbnail_url,
          is_published: data.is_published,
        } as any)
        .eq('id', id);

      if (updateError) throw updateError;
      
      setSuccessMsg('Course saved successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Error updating course:', err);
      setError(err.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course content, modules, and lessons.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setValue('is_published', !isPublished, { shouldDirty: true });
              handleSubmit(onSubmit as any)();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isPublished 
                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isPublished ? 'Published' : 'Draft'}
          </button>
          
          <button
            onClick={handleSubmit(onSubmit as any)}
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="mb-6 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-500 border border-emerald-500/20">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Basics */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-6">Course Details</h2>
            <form className="space-y-5">
              
              {/* Thumbnail Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Course Thumbnail</label>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-white/[0.1] bg-black/40 hover:border-primary/50 transition-colors group">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-xs">No thumbnail</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-md flex items-center gap-2">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? 'Uploading...' : 'Change Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  {...register('title')}
                  className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Slug</label>
                <input
                  {...register('slug')}
                  className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <input
                  {...register('category')}
                  className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Level</label>
                  <select
                    {...register('level')}
                    className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price (KES)</label>
                  <input
                    type="number"
                    {...register('price_kes')}
                    className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Curriculum (Modules & Lessons) */}
        <div className="lg:col-span-2">
          {course && <CourseCurriculum courseId={course.id} />}
        </div>
      </div>
    </div>
  );
}
