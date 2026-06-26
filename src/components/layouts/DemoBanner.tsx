// ============================================================
// mbuku LMS — Demo Mode Banner
// Shows at top of page when using demo login
// ============================================================

import { useAuthContext } from '@/contexts/AuthContext';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

export function DemoBanner() {
  const { isDemo, signOut } = useAuthContext();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (!isDemo || dismissed) return null;

  const handleExit = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 px-4 py-2',
      'bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20',
      'border-b border-primary/20 text-sm'
    )}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">
          <strong className="text-foreground">Demo Mode</strong> — You're previewing with mock data.
          Connect Supabase for real auth & data.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExit}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Exit Demo
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
