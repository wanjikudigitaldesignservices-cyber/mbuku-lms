// ============================================================
// mbuku LMS — Sidebar Component
// Shared navigation sidebar for all portal layouts
// ============================================================

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  brandColor?: string;
}

export function Sidebar({ items, brandColor = 'from-primary to-primary/80' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuthContext();
  const location = useLocation();

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-300 border-red-500/30',
    instructor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    student: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06]',
        'bg-gradient-to-b from-sidebar-bg to-sidebar-bg/95 backdrop-blur-xl'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.06]">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-gradient-to-br', brandColor,
                'shadow-lg shadow-primary/20'
              )}>
                <span className="text-sm font-bold text-white">m</span>
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                mbuku
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]',
            'transition-colors duration-200',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
                'transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              )}

              <Icon
                size={20}
                className={cn(
                  'shrink-0 transition-colors duration-200',
                  isActive ? 'text-primary' : 'group-hover:text-foreground'
                )}
              />

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/[0.06] px-3 py-4">
        {/* Profile summary */}
        <div className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 mb-2',
          collapsed && 'justify-center px-0'
        )}>
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            'bg-gradient-to-br from-primary/30 to-accent/30',
            'text-sm font-semibold text-foreground'
          )}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'Loading...'}
                </p>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                  'border capitalize mt-0.5',
                  roleBadgeColors[profile?.role || 'student']
                )}>
                  {profile?.role || 'student'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign out button */}
        <button
          onClick={signOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
            'text-muted-foreground hover:text-red-400 hover:bg-red-500/10',
            'transition-colors duration-200',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
