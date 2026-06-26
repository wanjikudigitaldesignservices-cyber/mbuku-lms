// ============================================================
// mbuku LMS — Admin Dashboard
// Full dashboard with charts and management panels
// ============================================================

import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Bot,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Shield,
  Server,
  CreditCard,
  UserCog,
  Banknote,
  ShieldAlert,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------- Stat Card ----------
interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  gradient: string;
  delay: number;
}

function StatCard({ label, value, change, trend, icon: Icon, gradient, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm',
        'p-6 shadow-lg hover:border-white/[0.1] transition-colors duration-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className={cn('rounded-xl p-3 bg-gradient-to-br', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Mini Bar Chart ----------
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
          className={cn('flex-1 rounded-sm min-h-[3px]', color)}
        />
      ))}
    </div>
  );
}

// ---------- System Log Item ----------
interface SystemLogItem {
  event: string;
  user: string;
  time: string;
  type: 'security' | 'system' | 'billing' | 'admin';
}

function SystemLogRow({ item, index }: { item: SystemLogItem; index: number }) {
  const typeColors = {
    security: 'bg-red-500/15 text-red-400',
    system: 'bg-blue-500/15 text-blue-400',
    billing: 'bg-emerald-500/15 text-emerald-400',
    admin: 'bg-purple-500/15 text-purple-400',
  };

  const typeIcons = {
    security: Shield,
    system: Server,
    billing: CreditCard,
    admin: UserCog,
  };

  const Icon = typeIcons[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
      className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
    >
      <div className={cn('rounded-lg p-2', typeColors[item.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          <strong>{item.event}</strong> by {item.user}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3" /> {item.time}
        </p>
      </div>
    </motion.div>
  );
}

// ---------- Top Instructor Row ----------
interface InstructorOverview {
  name: string;
  courses: number;
  revenue: string;
  rating: number;
}

function InstructorRow({ instructor, index }: { instructor: InstructorOverview; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.08, duration: 0.3 }}
      className="border-b border-white/[0.04] last:border-0"
    >
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {instructor.name.charAt(0)}
          </div>
          <p className="text-sm font-medium text-foreground">{instructor.name}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-foreground text-center">{instructor.courses}</td>
      <td className="py-3 px-4 text-sm font-medium text-emerald-400 text-center">{instructor.revenue}</td>
      <td className="py-3 pl-4 text-sm text-foreground text-center">
        <div className="flex items-center justify-center gap-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span>{instructor.rating}</span>
        </div>
      </td>
    </motion.tr>
  );
}

// ---------- Demo Data ----------
const stats: StatCardProps[] = [
  { label: 'Total Revenue', value: 'KES 4.2M', change: '+18.5%', trend: 'up', icon: Banknote, gradient: 'from-emerald-500 to-emerald-600', delay: 0.1 },
  { label: 'Active Subscriptions', value: '892', change: '+12%', trend: 'up', icon: Users, gradient: 'from-blue-500 to-blue-600', delay: 0.15 },
  { label: 'Server Load', value: '24%', change: '-5%', trend: 'down', icon: Server, gradient: 'from-purple-500 to-purple-600', delay: 0.2 },
  { label: 'Failed Logins', value: '14', change: '-42%', trend: 'down', icon: ShieldAlert, gradient: 'from-red-500 to-red-600', delay: 0.25 },
];

const revenueData = [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 42, 45];
const serverLoadData = [45, 52, 48, 60, 55, 70, 65, 72, 80, 75, 85, 90];

const systemLogs: SystemLogItem[] = [
  { event: 'Promoted user to Instructor', user: 'Admin User', time: '2 min ago', type: 'admin' },
  { event: 'Database Backup Completed', user: 'System', time: '15 min ago', type: 'system' },
  { event: 'IntaSend Payout Processed', user: 'Billing API', time: '1 hour ago', type: 'billing' },
  { event: 'Multiple failed login attempts', user: 'IP 192.168.1.45', time: '2 hours ago', type: 'security' },
  { event: 'API Rate Limit Exceeded', user: 'Edge Function', time: '3 hours ago', type: 'system' },
  { event: 'Global Site Settings Updated', user: 'Admin User', time: '4 hours ago', type: 'admin' },
];

const topInstructors: InstructorOverview[] = [
  { name: 'Jane Doe', courses: 4, revenue: 'KES 1.2M', rating: 4.9 },
  { name: 'David Smith', courses: 2, revenue: 'KES 850K', rating: 4.8 },
  { name: 'Amara Osei', courses: 5, revenue: 'KES 720K', rating: 4.7 },
  { name: 'Kipchoge Ruto', courses: 1, revenue: 'KES 450K', rating: 4.9 },
];

// ---------- Main Component ----------
export function AdminDashboardPage() {
  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and management — <span className="text-primary">Demo Data</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">System Healthy</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Enrollments Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monthly Enrollments</h3>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-semibold">+24%</span>
            </div>
          </div>
          <MiniBarChart data={enrollmentData} color="bg-primary/70" />
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </motion.div>

        {/* AI Tutor Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Tutor Sessions</h3>
                <p className="text-xs text-muted-foreground">Daily messages / month</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-semibold">+38%</span>
            </div>
          </div>
          <MiniBarChart data={aiUsageData} color="bg-purple-500/70" />
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Activity + Course Performance */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <ActivityRow key={i} item={item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Course Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Course Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">Course</th>
                  <th className="text-center py-2 px-4 text-xs font-medium text-muted-foreground">Enrolled</th>
                  <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">Completion</th>
                  <th className="text-center py-2 pl-4 text-xs font-medium text-muted-foreground">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((course, i) => (
                  <CourseRow key={course.title} course={course} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
