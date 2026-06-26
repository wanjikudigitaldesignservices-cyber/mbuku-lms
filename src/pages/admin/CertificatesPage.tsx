import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, Award, Download } from 'lucide-react';
import type { Database } from '@/lib/types/database';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type CertView = Certificate & { course: Course; profile: Profile };

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses(*),
        profile:profiles(*)
      `)
      .order('issued_at', { ascending: false });

    if (!error && data) {
      setCertificates(data as unknown as CertView[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('certificates').download(path);
    if (error) return console.error(error);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Issued Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">View all certificates issued to students</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/20">
                  <th className="py-4 pl-6 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Course</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Certificate ID</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Issued</th>
                  <th className="py-4 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {certificates.map((cert, i) => (
                  <motion.tr
                    key={cert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="font-medium text-foreground">{cert.profile?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{cert.profile?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {cert.course?.title}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-mono text-muted-foreground">{cert.certificate_number}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDownload(cert.pdf_path)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {certificates.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Award className="mx-auto h-8 w-8 opacity-20 mb-3" />
                <p>No certificates issued yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
