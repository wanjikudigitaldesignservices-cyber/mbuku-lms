// ============================================================
// mbuku LMS — Route Definitions
// ============================================================

import { createBrowserRouter, Navigate, Outlet } from 'react-router';

// Guards
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';

// Layouts
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { InstructorLayout } from '@/components/layouts/InstructorLayout';
import { StudentLayout } from '@/components/layouts/StudentLayout';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

// Dashboard pages
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';
import { InstructorDashboardPage } from '@/pages/instructor/DashboardPage';
import { InstructorCourseListPage } from '@/pages/instructor/CourseListPage';
import { InstructorCourseCreatePage } from '@/pages/instructor/CourseCreatePage';
import { InstructorCourseEditPage } from '@/pages/instructor/CourseEditPage';
import { StudentDashboardPage } from '@/pages/learn/DashboardPage';

// Learn/Public pages
import { CourseCatalogPage } from '@/pages/learn/CourseCatalogPage';
import { CourseDetailPage } from '@/pages/learn/CourseDetailPage';
import { LessonPlayerPage } from '@/pages/learn/LessonPlayerPage';

export const router = createBrowserRouter([
  // ----- Public routes -----
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/courses',
    element: (
      <div>
        {/* Simple wrapper for public catalog */}
        <Outlet />
      </div>
    ),
    children: [
      { index: true, element: <CourseCatalogPage /> },
      { path: ':slug', element: <CourseDetailPage /> },
    ],
  },

  // ----- Admin portal -----
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={['admin']}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      // Phase 7: Users, Courses, Certificates, AI Usage, Settings
    ],
  },

  // ----- Instructor portal -----
  {
    path: '/instructor',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={['instructor', 'admin']}>
          <InstructorLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <InstructorDashboardPage /> },
      { path: 'courses', element: <InstructorCourseListPage /> },
      { path: 'courses/new', element: <InstructorCourseCreatePage /> },
      { path: 'courses/:id', element: <InstructorCourseEditPage /> },
    ],
  },

  // ----- Student portal -----
  {
    path: '/learn',
    element: (
      <AuthGuard>
        <StudentLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <StudentDashboardPage /> },
      { path: 'courses/:slug/lessons/:lesson_id', element: <LessonPlayerPage /> },
      // Phase 3: My Courses, Certificates, AI Tutor
    ],
  },

  // ----- Certificate verification (Phase 6) -----
  // { path: '/verify/:code', ... }

  // ----- Catch-all: redirect to learn portal -----
  {
    path: '*',
    element: <Navigate to="/learn" replace />,
  },
]);
