// ============================================================
// mbuku LMS — Signup Page
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation (also validated server-side by Supabase)
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, fullName.trim());

      // If email confirmation is required, show success message
      if (result.user && !result.session) {
        setSuccess(true);
      } else {
        // Auto-confirmed, redirect to learn portal
        navigate('/learn', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
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
            Join <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">mbuku</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your tech upskilling journey today
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/20 p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className="rounded-full bg-emerald-500/15 p-3">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Account created!</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Check your email to confirm your account, then you're good to go.
              </p>
              <Link
                to="/login"
                className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Go to Login →
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
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
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-email"
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
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
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
                    Create Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Login link */}
        {!success && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
