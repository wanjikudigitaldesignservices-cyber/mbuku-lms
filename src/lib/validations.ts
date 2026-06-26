import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  price_kes: z.any().transform(Number),
  thumbnail_url: z.string().optional(),
  is_published: z.boolean().default(false),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const moduleSchema = z.object({
  title: z.string().min(3, 'Title is required'),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content_type: z.enum(['video', 'text', 'quiz']),
  content: z.string().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  duration_minutes: z.coerce.number().min(0).default(0),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
