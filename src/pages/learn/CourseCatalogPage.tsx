import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Search, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['courses']['Row'];

export function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Hero */}
      <div className="bg-primary/5 py-16 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Our Courses
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Master new tech skills with cohort-based learning, expert instructors, and practical projects.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-full border border-white/[0.1] bg-card/50 pl-12 pr-4 py-3.5 text-foreground shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat as string}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-white/[0.06] text-muted-foreground hover:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/[0.06] bg-card/30 h-[400px]" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl"
              >
                <Link to={`/courses/${course.slug}`} className="block aspect-video bg-black/40 relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-md bg-black/60 text-white border border-white/10">
                      {course.level}
                    </span>
                  </div>
                </Link>
                
                <div className="flex flex-col flex-1 p-6">
                  {course.category && (
                    <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">
                      {course.category}
                    </div>
                  )}
                  <Link to={`/courses/${course.slug}`}>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-auto">
                    <div className="text-lg font-bold text-emerald-400">
                      {course.price_kes === 0 ? 'Free' : `KES ${course.price_kes.toLocaleString()}`}
                    </div>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
