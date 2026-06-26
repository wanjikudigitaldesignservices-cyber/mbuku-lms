import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, Bot } from 'lucide-react';
import type { Database } from '@/lib/types/database';

type AiUsage = Database['public']['Tables']['ai_tutor_usage']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type UsageWithProfile = AiUsage & { profile: Profile };

export function AdminAiUsagePage() {
  const [usageData, setUsageData] = useState<UsageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_tutor_usage')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('usage_date', { ascending: false });

    if (!error && data) {
      setUsageData(data as unknown as UsageWithProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Calculate totals
  const totalCalls = usageData.reduce((acc, curr) => acc + curr.message_count, 0);

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Tutor Usage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor Anthropic API usage across students</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total API Calls</p>
          <p className="text-3xl font-bold text-emerald-400">{totalCalls}</p>
        </div>
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
                  <th className="py-4 pl-6 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="py-4 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Messages Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {usageData.map((usage, i) => (
                  <motion.tr
                    key={`${usage.user_id}-${usage.usage_date}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 pl-6 pr-4 text-sm text-foreground">
                      {new Date(usage.usage_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{usage.profile?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{usage.profile?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-mono text-emerald-400">
                      {usage.message_count}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {usageData.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Bot className="mx-auto h-8 w-8 opacity-20 mb-3" />
                <p>No AI usage data recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
