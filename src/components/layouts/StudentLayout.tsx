// ============================================================
// mbuku LMS — Student Layout
// ============================================================

import { Outlet } from 'react-router';
import { Sidebar, type SidebarItem } from './Sidebar';
import { DemoBanner } from './DemoBanner';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Award,
  Bot,
} from 'lucide-react';

const studentNavItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/learn', icon: LayoutDashboard },
  { label: 'Browse Catalog', href: '/courses', icon: Compass },
  { label: 'Certificates', href: '/learn/certificates', icon: Award },
];

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={studentNavItems} brandColor="from-emerald-500 to-emerald-600" />
      <main className="ml-[260px] min-h-screen transition-all duration-300">
        <DemoBanner />
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
