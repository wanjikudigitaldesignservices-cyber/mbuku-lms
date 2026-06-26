import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { Link } from 'react-router';
import type { Database } from '@/lib/types/database';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

type CertWithCourse = Certificate & { course: Course };

export function CertificatesPage() {
  const { user } = useAuthContext();
  const [certificates, setCertificates] = useState<CertWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
      if (!user) return;
      const { data } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (data) {
        setCertificates(data as unknown as CertWithCourse[]);
      }
      setLoading(false);
    }
    fetchCertificates();
  }, [user]);

  const handleDownload = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('certificates').download(path);
    if (error) {
      console.error('Download error:', error);
      return;
    }
    // Create a download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and download your earned certificates
          </p>
        </div>
        <Link
          to="/verify"
          className="inline-flex items-center gap-2 rounded-lg bg-card border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.05] transition-colors shadow-sm"
        >
          <Search className="h-4 w-4" />
          Verify a Certificate
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-card/30"
        >
          <Award className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No certificates yet</h3>
          <p className="text-muted-foreground">
            Complete a course 100% to earn your first certificate.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl relative"
            >
              {/* Top decorative gradient */}
              <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-mono text-muted-foreground border border-white/10 uppercase tracking-wider">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                  {cert.course.title}
                </h3>
                
                <div className="mt-auto pt-6 space-y-3">
                  <div className="bg-background/50 rounded-lg p-3 border border-white/[0.04]">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Certificate ID</div>
                    <div className="font-mono text-xs text-foreground/80">{cert.certificate_number}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(cert.pdf_path)}
                      className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      <Download className="h-4 w-4" /> Download PDF
                    </button>
                    <Link
                      to={`/verify/${cert.verification_code}`}
                      className="inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title="Public Verification Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
