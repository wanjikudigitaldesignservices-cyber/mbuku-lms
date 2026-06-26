// ============================================================
// mbuku LMS — Student Dashboard (Placeholder)
// Full implementation in Phase 3
// ============================================================

import { motion } from 'framer-motion';
import {
  BookOpen,
  Compass,
  Award,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

export function StudentDashboardPage() {
  const { profile } = useAuthContext();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {profile?.full_name?.split(' ')[0] || 'Learner'} 🎓
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue your learning journey
        </p>
      </motion.div>

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={cn(
          'mt-8 relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10',
          'border border-primary/20 p-8'
        )}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-foreground">
            Welcome to mbuku LMS
          </h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Explore courses in Cloud Computing (AWS re/Start style), Frontend Development,
            and Mobile Development. Start building your tech career today.
          </p>
          <Link
            to="/courses"
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-xl',
              'bg-primary px-5 py-2.5 text-sm font-semibold text-white',
              'shadow-lg shadow-primary/25 transition-all duration-200',
              'hover:shadow-xl hover:shadow-primary/30 hover:brightness-110'
            )}
          >
            Browse Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />
      </motion.div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: Compass,
            label: 'Browse Catalog',
            desc: 'Find new courses',
            href: '/courses',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            icon: Award,
            label: 'My Certificates',
            desc: 'View your achievements',
            href: '/learn/certificates',
            gradient: 'from-amber-500 to-amber-600',
          },
          {
            icon: Bot,
            label: 'AI Tutor',
            desc: 'Get help anytime',
            href: '/learn/tutor',
            gradient: 'from-purple-500 to-purple-600',
          },
        ].map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
          >
            <Link
              to={item.href}
              className={cn(
                'group flex items-start gap-4 rounded-2xl border border-white/[0.06]',
                'bg-card/30 backdrop-blur-sm p-5',
                'transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg'
              )}
            >
              <div className={cn('rounded-xl p-2.5 bg-gradient-to-br', item.gradient)}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {item.label}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Enrolled courses placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-2xl border border-dashed border-white/[0.1] p-12 text-center"
      >
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          📖 Course catalog & enrollment coming in <strong>Phase 3</strong>
        </p>
      </motion.div>
    </div>
  );
}
