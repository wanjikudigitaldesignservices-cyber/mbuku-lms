// ============================================================
// mbuku LMS — Login Page
// Email/password + Magic Link + Demo Login
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Mail, Lock, Sparkles, ArrowRight, Loader2, CheckCircle,
  Shield, GraduationCap, BookOpenCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types/database';

type AuthTab = 'password' | 'magic-link';

export function LoginPage() {
  const [tab, setTab] = useState<AuthTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { signIn, signInWithMagicLink, demoLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/learn';

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    demoLogin(role);
    // Navigate to the appropriate portal
    const routes: Record<UserRole, string> = {
      admin: '/admin',
      instructor: '/instructor',
      student: '/learn',
    };
    navigate(routes[role], { replace: true });
  };

  const demoOptions = [
    {
      role: 'admin' as UserRole,
      label: 'Admin',
      desc: 'Full platform access',
      icon: Shield,
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/20',
    },
    {
      role: 'instructor' as UserRole,
      label: 'Instructor',
      desc: 'Course management',
      icon: BookOpenCheck,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
    {
      role: 'student' as UserRole,
      label: 'Student',
      desc: 'Learning portal',
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25"
          >
            <span className="text-2xl font-bold text-white">m</span>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">mbuku</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Demo Login Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Quick Demo Access</span>
            <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-white/[0.06] px-2 py-0.5 rounded-full">
              DEV MODE
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Preview all portals instantly — no Supabase setup needed
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoOptions.map((opt) => (
              <button
                key={opt.role}
                onClick={() => handleDemoLogin(opt.role)}
                className={cn(
                  'group flex flex-col items-center gap-2 rounded-xl py-3 px-2',
                  'border border-white/[0.06] bg-white/[0.03]',
                  'transition-all duration-300',
                  'hover:border-white/[0.15] hover:bg-white/[0.06]',
                  `hover:${opt.shadow}`
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  'bg-gradient-to-br transition-transform duration-300 group-hover:scale-110',
                  opt.gradient
                )}>
                  <opt.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">
              or sign in with credentials
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Tab switcher */}
          <div className="flex border-b border-white/[0.06]">
            {(['password', 'magic-link'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setMagicLinkSent(false); }}
                className={cn(
                  'relative flex-1 py-3.5 text-sm font-medium transition-colors duration-200',
                  tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                )}
              >
                {t === 'password' ? 'Password' : 'Magic Link'}
                {tab === t && (
                  <motion.div
                    layoutId="login-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            {tab === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={cn(
                        'w-full rounded-xl border border-white/[0.08] bg-white/[0.03]',
                        'py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground',
                        'outline-none transition-all duration-200',
                        'focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className={cn(
                        'w-full rounded-xl border border-white/[0.08] bg-white/[0.03]',
                        'py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground',
                        'outline-none transition-all duration-200',
                        'focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                      )}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'group flex w-full items-center justify-center gap-2 rounded-xl',
                    'bg-gradient-to-r from-primary to-primary/90 py-2.5 text-sm font-semibold text-white',
                    'shadow-lg shadow-primary/25 transition-all duration-200',
                    'hover:shadow-xl hover:shadow-primary/30 hover:brightness-110',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                {magicLinkSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-4 text-center"
                  >
                    <div className="rounded-full bg-emerald-500/15 p-3">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      We sent a magic link to <strong className="text-foreground">{email}</strong>.
                      Click the link in the email to sign in.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="magic-email" className="mb-1.5 block text-sm font-medium text-foreground">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="magic-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className={cn(
                            'w-full rounded-xl border border-white/[0.08] bg-white/[0.03]',
                            'py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground',
                            'outline-none transition-all duration-200',
                            'focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'group flex w-full items-center justify-center gap-2 rounded-xl',
                        'bg-gradient-to-r from-accent to-accent/90 py-2.5 text-sm font-semibold text-white',
                        'shadow-lg shadow-accent/25 transition-all duration-200',
                        'hover:shadow-xl hover:shadow-accent/30 hover:brightness-110',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Send Magic Link
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
