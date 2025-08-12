import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Card, 
  CardContent, 
  ScrollArea 
} from '@/components/ui';
import { X } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskFormCoreProps {
  isDarkMode: boolean;
  missionId: string;
  selectedDate: Date;
  editingTask?: Task | null;
  parentId?: string;
  selectedTemplate?: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';
  onSave: (task: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Task) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export const TaskFormCore: React.FC<TaskFormCoreProps> = ({
  isDarkMode,
  missionId,
  selectedDate,
  editingTask,
  parentId,
  selectedTemplate,
  onSave,
  onClose,
  children
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '',
    priority: '' as 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | '',
    startTime: undefined as Date | undefined,
    endTime: undefined as Date | undefined,
    attachments: [] as Array<{
      id: string;
      url: string;
      text: string;
      type: 'link' | 'file' | 'image';
      color: string;
    }>,
    categoryId: '' as string,
    completed: false
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        color: editingTask.color,
        priority: editingTask.priority,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime,
        attachments: editingTask.attachments || [],
        categoryId: (editingTask as any).categoryId || '',
        completed: editingTask.completed || false
      });
    } else {
      // Set default colors and priority for new tasks
      const defaultColor = parentId ? '#10B981' : '#3B82F6'; // Green for subtasks, Blue for tasks
      setFormData(prev => ({
        ...prev,
        color: defaultColor,
        priority: 'P7', // Default to P7 - No Priority
        categoryId: ''
      }));
    }
  }, [editingTask, parentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: any = {
      ...(editingTask || {}),
      title: formData.title,
      description: formData.description || '',
      color: formData.color || (parentId ? '#10B981' : '#3B82F6'),
      startTime: formData.startTime,
      endTime: formData.endTime,
      priority: formData.priority || 'P7',
      date: selectedDate,
      missionId,
      parentId: editingTask?.parentId || parentId,
      completed: formData.completed || false,
      attachments: formData.attachments,
      categoryId: formData.categoryId,
      // Preserve other existing fields
      isExpanded: editingTask?.isExpanded || false,
      order: editingTask?.order || 0,
      subTasks: editingTask?.subTasks || []
    };

    onSave(taskData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <Card className="w-full max-w-md h-[calc(100vh-4rem)] bg-white/10 backdrop-blur-xl border-white/20" onClick={(e) => e.stopPropagation()}>
        <ScrollArea className="h-full">
          <div className="bg-gradient-to-br from-blue-50/10 via-white/5 to-purple-50/10 p-6 min-h-full">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingTask ? 'Edit Task' : parentId ? 'Add Sub Task' : 'Add Task'}
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}>
                {/* Title */}
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                  className="bg-white/10 border-white/20"
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                {/* Description */}
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="bg-white/10 border-white/20 h-20 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                {/* Children components (color picker, priority selector, etc.) */}
                {React.Children.map(children, child => 
                  React.isValidElement(child) 
                    ? React.cloneElement(child, { formData, setFormData } as any)
                    : child
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="bg-white/10 border-white/20">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingTask ? 'Update' : 'Create'} Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};