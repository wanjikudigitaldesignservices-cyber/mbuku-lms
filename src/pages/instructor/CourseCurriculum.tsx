import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { PlusCircle, GripVertical, Video, FileText, CheckSquare, Edit2, Trash2, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/types/database';

type Module = Database['public']['Tables']['modules']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

type CurriculumData = Module & {
  lessons: Lesson[];
};

export function CourseCurriculum({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<CurriculumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Form states
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'text' | 'quiz'>('video');

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      // 1. Fetch modules
      const { data: modulesData, error: modError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      if (modError) throw modError;

      // 2. Fetch lessons
      const { data: lessonsData, error: lesError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', modulesData?.map(m => m.id) || [])
        .order('position', { ascending: true });

      if (lesError) throw lesError;

      // 3. Assemble
      const assembled = (modulesData || []).map(m => ({
        ...m,
        lessons: (lessonsData || []).filter(l => l.module_id === m.id),
      }));

      setModules(assembled);
      
      // Expand all by default if newly loaded
      const expands: Record<string, boolean> = {};
      assembled.forEach(m => {
        expands[m.id] = true;
      });
      setExpandedModules(expands);
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    
    try {
      const { data, error } = (await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: newModuleTitle.trim(),
          position: modules.length,
        } as any)
        .select()
        .single()) as any;

      if (error) throw error;

      setModules([...modules, { ...data, lessons: [] }]);
      setExpandedModules(prev => ({ ...prev, [data.id]: true }));
      setNewModuleTitle('');
      setIsAddingModule(false);
    } catch (err) {
      console.error('Error adding module:', err);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;
    
    const modIndex = modules.findIndex(m => m.id === moduleId);
    if (modIndex === -1) return;
    
    const position = modules[modIndex].lessons.length;

    try {
      const { data, error } = (await supabase
        .from('lessons')
        .insert({
          module_id: moduleId,
          title: newLessonTitle.trim(),
          content_type: newLessonType,
          position: position,
        } as any)
        .select()
        .single()) as any;

      if (error) throw error;

      const newModules = [...modules];
      newModules[modIndex].lessons.push(data);
      setModules(newModules);
      
      setNewLessonTitle('');
      setAddingLessonTo(null);
    } catch (err) {
      console.error('Error adding lesson:', err);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      const { error } = await supabase.from('modules').delete().eq('id', id);
      if (error) throw error;
      setModules(modules.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
      
      const newModules = [...modules];
      const modIndex = newModules.findIndex(m => m.id === moduleId);
      if (modIndex > -1) {
        newModules[modIndex].lessons = newModules[modIndex].lessons.filter(l => l.id !== lessonId);
        setModules(newModules);
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'module') {
      // Reorder modules
      const newModules = Array.from(modules);
      const [reorderedItem] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedItem);
      
      // Update UI optimistic
      setModules(newModules);

      // Persist
      try {
        const updates = newModules.map((m, index) => ({ id: m.id, position: index }));
        for (const update of updates) {
          await supabase.from('modules').update({ position: update.position } as any).eq('id', update.id);
        }
      } catch (err) {
        console.error('Error reordering modules:', err);
      }
    } else if (type === 'lesson') {
      // Reorder lessons within a module
      const sourceModIndex = modules.findIndex(m => m.id === source.droppableId);
      const destModIndex = modules.findIndex(m => m.id === destination.droppableId);
      
      if (sourceModIndex === -1 || destModIndex === -1) return;

      const newModules = [...modules];
      
      if (source.droppableId === destination.droppableId) {
        // Same module
        const module = newModules[sourceModIndex];
        const newLessons = Array.from(module.lessons);
        const [reorderedItem] = newLessons.splice(source.index, 1);
        newLessons.splice(destination.index, 0, reorderedItem);
        module.lessons = newLessons;
        setModules(newModules);

        // Persist
        try {
          const updates = newLessons.map((l, index) => ({ id: l.id, position: index }));
          for (const update of updates) {
            await supabase.from('lessons').update({ position: update.position } as any).eq('id', update.id);
          }
        } catch (err) {
          console.error('Error reordering lessons:', err);
        }
      } else {
        // Cross module (Not fully implemented here, keeping simple for now)
        alert('Cross-module drag-and-drop is not fully supported yet.');
      }
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-card/30 rounded-2xl border border-white/[0.06]" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Curriculum</h2>
        {!isAddingModule && (
          <button
            onClick={() => setIsAddingModule(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Add Module
          </button>
        )}
      </div>

      {isAddingModule && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6">
          <div className="flex items-center gap-3">
            <input
              autoFocus
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              placeholder="e.g. Module 1: Introduction"
              className="flex-1 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button onClick={handleAddModule} className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4" />
            </button>
            <button onClick={() => setIsAddingModule(false)} className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {modules.length === 0 && !isAddingModule ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center">
          <p className="text-muted-foreground mb-4">No modules added yet.</p>
          <button
            onClick={() => setIsAddingModule(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Add First Module
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="curriculum" type="module">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {modules.map((module, index) => (
                  <Draggable key={module.id} draggableId={module.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "rounded-xl border transition-all duration-200 overflow-hidden",
                          snapshot.isDragging ? "border-primary shadow-xl bg-card" : "border-white/[0.06] bg-card/30"
                        )}
                      >
                        {/* Module Header */}
                        <div className="flex items-center p-3 bg-white/[0.02]">
                          <div {...provided.dragHandleProps} className="px-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <button 
                            onClick={() => toggleModule(module.id)}
                            className="flex items-center gap-2 flex-1 text-left font-semibold text-foreground px-2"
                          >
                            {expandedModules[module.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {module.title}
                          </button>
                          
                          <div className="flex items-center gap-2 px-2">
                            <button
                              onClick={() => handleDeleteModule(module.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-white/5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Module Content (Lessons) */}
                        {expandedModules[module.id] && (
                          <div className="p-4 border-t border-white/[0.04]">
                            <Droppable droppableId={module.id} type="lesson">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-4">
                                  {module.lessons.map((lesson, idx) => (
                                    <Draggable key={lesson.id} draggableId={lesson.id} index={idx}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                            snapshot.isDragging ? "border-primary shadow-lg bg-background" : "border-white/[0.04] bg-background/50 hover:border-white/[0.1]"
                                          )}
                                        >
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground">
                                            <GripVertical className="h-4 w-4" />
                                          </div>
                                          
                                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-white/5 text-primary">
                                            {lesson.content_type === 'video' && <Video className="h-4 w-4" />}
                                            {lesson.content_type === 'text' && <FileText className="h-4 w-4" />}
                                            {lesson.content_type === 'quiz' && <CheckSquare className="h-4 w-4" />}
                                          </div>
                                          
                                          <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                                          
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                                            <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-white/5">
                                              <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-white/5"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {/* Add Lesson Form */}
                            {addingLessonTo === module.id ? (
                              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                                <select
                                  value={newLessonType}
                                  onChange={(e) => setNewLessonType(e.target.value as any)}
                                  className="w-full sm:w-auto rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                                >
                                  <option value="video">Video</option>
                                  <option value="text">Text</option>
                                  <option value="quiz">Quiz</option>
                                </select>
                                <input
                                  autoFocus
                                  value={newLessonTitle}
                                  onChange={(e) => setNewLessonTitle(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(module.id)}
                                  placeholder="Lesson title"
                                  className="flex-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                />
                                <div className="flex gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                                  <button onClick={() => handleAddLesson(module.id)} className="flex-1 sm:flex-none rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 flex items-center justify-center">
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setAddingLessonTo(null)} className="flex-1 sm:flex-none rounded-md bg-muted p-1.5 text-muted-foreground hover:text-foreground flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAddingLessonTo(module.id)}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mt-2"
                              >
                                <PlusCircle className="h-3.5 w-3.5" />
                                Add Lesson
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
