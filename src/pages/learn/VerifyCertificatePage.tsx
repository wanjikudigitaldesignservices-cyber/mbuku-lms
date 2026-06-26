import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/database';

type CertView = Database['public']['Views']['certificate_public_view']['Row'];

export function VerifyCertificatePage() {
  const { code } = useParams<{ code?: string }>();
  const [verifyCode, setVerifyCode] = useState(code || '');
  const [cert, setCert] = useState<CertView | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifyCode.trim()) return;

    setLoading(true);
    setSearched(true);
    setError('');
    setCert(null);

    try {
      const { data, error: sbError } = await supabase
        .from('certificate_public_view')
        .select('*')
        .eq('verification_code', verifyCode.toUpperCase().trim())
        .maybeSingle();

      if (sbError) throw sbError;
      
      if (data) {
        setCert(data);
      } else {
        setError('No certificate found with this verification code.');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      setError('An error occurred while verifying the certificate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to LMS
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-xl shadow-primary/20 border border-primary/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Certificate Verification</h1>
          <p className="text-muted-foreground">
            Enter the verification code found on the certificate to confirm its authenticity.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-10">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="e.g. A1B2C3D4"
            className="w-full rounded-2xl border border-white/[0.1] bg-card/50 pl-6 pr-32 py-5 text-lg uppercase font-mono tracking-widest text-foreground shadow-xl backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !verifyCode.trim()}
            className="absolute right-2 top-2 bottom-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
          </button>
        </form>

        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8"
            >
              {cert ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 text-emerald-500/10">
                    <ShieldCheck className="w-40 h-40" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-400 mb-2">Valid Certificate</h2>
                    <p className="text-foreground text-lg mb-6 leading-relaxed">
                      This certificate officially verifies that <br/>
                      <strong className="text-xl text-primary mt-2 block">{cert.learner_name}</strong>
                    </p>
                    
                    <div className="bg-background/80 rounded-xl p-4 text-left border border-white/[0.04] space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Course</div>
                        <div className="font-semibold text-foreground">{cert.course_title}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Issue Date</div>
                          <div className="text-sm font-mono text-foreground/80">{new Date(cert.issued_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Certificate ID</div>
                          <div className="text-sm font-mono text-foreground/80">{cert.certificate_number}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/20 text-destructive mb-4">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-destructive mb-2">Invalid Code</h2>
                  <p className="text-muted-foreground">
                    {error || "We couldn't find a certificate matching that code. Please check for typos and try again."}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Needed for AnimatePresence
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion';
// Rename locally to avoid shadowing
const AnimatePresence = FramerAnimatePresence;
