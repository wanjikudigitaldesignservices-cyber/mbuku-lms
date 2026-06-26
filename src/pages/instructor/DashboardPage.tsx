// ============================================================
// mbuku LMS — Instructor Dashboard (Placeholder)
// Full implementation in Phase 2
// ============================================================

import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  BarChart3,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

export function InstructorDashboardPage() {
  const { profile } = useAuthContext();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {profile?.full_name?.split(' ')[0] || 'Instructor'} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your courses and track student progress
        </p>
      </motion.div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: PlusCircle,
            label: 'Create Course',
            desc: 'Build a new course from scratch',
            href: '/instructor/courses/new',
            gradient: 'from-emerald-500 to-emerald-600',
          },
          {
            icon: BookOpen,
            label: 'My Courses',
            desc: 'Manage your existing courses',
            href: '/instructor/courses',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            icon: BarChart3,
            label: 'Analytics',
            desc: 'View enrollment and completion stats',
            href: '/instructor/analytics',
            gradient: 'from-purple-500 to-purple-600',
          },
        ].map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link
              to={item.href}
              className={cn(
                'group flex items-start gap-4 rounded-2xl border border-white/[0.06]',
                'bg-card/30 backdrop-blur-sm p-6 shadow-lg',
                'transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl'
              )}
            >
              <div className={cn('rounded-xl p-2.5 bg-gradient-to-br', item.gradient)}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
