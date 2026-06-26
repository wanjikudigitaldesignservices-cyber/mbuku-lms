import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure mbuku LMS global settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General Configuration</h2>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Platform Name</label>
              <input 
                type="text" 
                defaultValue="mbuku LMS"
                className="w-full rounded-xl border border-white/[0.1] bg-background px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@techskills360.africa"
                className="w-full rounded-xl border border-white/[0.1] bg-background px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">AI Tutor Configuration</h2>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Default Model</label>
              <select className="w-full rounded-xl border border-white/[0.1] bg-background px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none">
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-white/[0.1] bg-background text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Enable AI Tutor for all new courses by default</span>
              </label>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
