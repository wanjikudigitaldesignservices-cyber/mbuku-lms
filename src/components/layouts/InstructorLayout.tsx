// ============================================================
// mbuku LMS — Instructor Layout
// ============================================================

import { Outlet } from 'react-router';
import { Sidebar, type SidebarItem } from './Sidebar';
import { DemoBanner } from './DemoBanner';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const instructorNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { label: 'My Courses', href: '/instructor/courses', icon: BookOpen },
  { label: 'Create Course', href: '/instructor/courses/new', icon: PlusCircle },
  { label: 'Students', href: '/instructor/students', icon: GraduationCap },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
];

export function InstructorLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={instructorNavItems} brandColor="from-amber-500 to-amber-600" />
      <main className="ml-[260px] min-h-screen transition-all duration-300">
        <DemoBanner />
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
