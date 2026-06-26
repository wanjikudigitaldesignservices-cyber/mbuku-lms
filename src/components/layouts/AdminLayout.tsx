// ============================================================
// mbuku LMS — Admin Layout
// ============================================================

import { Outlet } from 'react-router';
import { Sidebar, type SidebarItem } from './Sidebar';
import { DemoBanner } from './DemoBanner';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Bot,
  Settings,
} from 'lucide-react';

const adminNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Certificates', href: '/admin/certificates', icon: Award },
  { label: 'AI Usage', href: '/admin/ai-usage', icon: Bot },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={adminNavItems} brandColor="from-red-500 to-red-600" />
      <main className="ml-[260px] min-h-screen transition-all duration-300">
        <DemoBanner />
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
