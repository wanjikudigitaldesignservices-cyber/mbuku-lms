// ============================================================
// mbuku LMS — Route Definitions
// ============================================================

import { createBrowserRouter, Navigate } from 'react-router';

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
import { StudentDashboardPage } from '@/pages/learn/DashboardPage';

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
      // Phase 2: Courses CRUD, Create Course
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
      // Phase 3: My Courses, Certificates, AI Tutor
    ],
  },

  // ----- Public course catalog (Phase 3) -----
  // { path: '/courses', ... }
  // { path: '/courses/:slug', ... }

  // ----- Certificate verification (Phase 6) -----
  // { path: '/verify/:code', ... }

  // ----- Catch-all: redirect to learn portal -----
  {
    path: '*',
    element: <Navigate to="/learn" replace />,
  },
]);
