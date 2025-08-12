import React, { useCallback } from 'react';
import { Button, Input, Textarea, Card, CardContent, ScrollArea } from '@/components/ui';
import { X, Palette, Flag, Link, Plus, Timer, FolderTree } from 'lucide-react';
import { Task } from '@/types/task';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useTaskFormHelpers } from '@/hooks/useTaskFormHelpers';
import { useTaskFormState } from '@/hooks/useTaskFormState';
import { validateTaskForm, createTaskFromForm } from '@/utils/taskFormValidation';
import { TimeRangeSelector } from './form/TimeRangeSelector';
import { CategorySelector } from './form/CategorySelector';
import { PrioritySelector } from './form/PrioritySelector';
import { ColorSelector } from './form/ColorSelector';
import { AttachmentManager } from './form/AttachmentManager';

interface ModernTaskFormProps {
  isDarkMode: boolean;
  missionId: string;
  selectedDate: Date;
  editingTask?: Task | null;
  parentId?: string;
  selectedTemplate?: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';
  onSave: (task: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Task) => void;
  onClose: () => void;
}


export const ModernTaskForm: React.FC<ModernTaskFormProps> = ({
  isDarkMode,
  missionId,
  selectedDate,
  editingTask,
  parentId,
  selectedTemplate,
  onSave,
  onClose
}) => {
  const { categories, toggleCategoryExpanded, getCategoryById } = useCategoryManager();
  const { createDateWithTime } = useTaskFormHelpers();
  
  const {
    formData,
    activeSection,
    customColor,
    selectedPriority,
    linksExpanded,
    dateTimeError,
    updateFormData,
    toggleSection,
    setCustomColor,
    setSelectedPriority,
    setLinksExpanded,
    setDateTimeError
  } = useTaskFormState(editingTask, selectedTemplate, selectedDate, parentId);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Update times if provided
    let updatedFormData = { ...formData };
    if (formData.startTime && formData.startTimeHour && formData.startTimeMinutes) {
      updatedFormData.startTime = createDateWithTime(formData.startTime, formData.startTimeHour, formData.startTimeMinutes, formData.startTimeAM);
    }
    if (formData.endTime && formData.endTimeHour && formData.endTimeMinutes) {
      updatedFormData.endTime = createDateWithTime(formData.endTime, formData.endTimeHour, formData.endTimeMinutes, formData.endTimeAM);
    }

    // Validate form with updated times
    const errors = validateTaskForm(updatedFormData);
    if (errors.length > 0) {
      setDateTimeError(errors[0].message);
      return;
    }

    setDateTimeError(null);
    const taskData = createTaskFromForm(updatedFormData, editingTask, parentId, selectedDate, missionId);
    onSave(taskData as any);
  }, [formData, editingTask, parentId, selectedDate, missionId, createDateWithTime, setDateTimeError, onSave]);

  const handlePrioritySelect = useCallback((priority: string) => {
    updateFormData({ priority: priority as any });
    setSelectedPriority(priority);
    toggleSection(null);
  }, [updateFormData, setSelectedPriority, toggleSection]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    updateFormData({ categoryId });
    toggleSection(null);
  }, [updateFormData, toggleSection]);

  const addAttachment = useCallback(() => {
    const newAttachment = {
      id: Date.now().toString(),
      url: '',
      text: '',
      type: 'link' as const,
      color: '#3B82F6'
    };
    updateFormData({ attachments: [...formData.attachments, newAttachment] });
  }, [formData.attachments, updateFormData]);

  const updateAttachment = useCallback((index: number, field: string, value: string) => {
    const updatedAttachments = formData.attachments.map((att, i) => 
      i === index ? { ...att, [field]: value } : att
    );
    updateFormData({ attachments: updatedAttachments });
  }, [formData.attachments, updateFormData]);

  const removeAttachment = useCallback((index: number) => {
    const updatedAttachments = formData.attachments.filter((_, i) => i !== index);
    updateFormData({ attachments: updatedAttachments });
  }, [formData.attachments, updateFormData]);

  const handleFileUpload = useCallback((index: number, file: File) => {
    const url = URL.createObjectURL(file);
    const type: 'image' | 'file' = file.type.startsWith('image/') ? 'image' : 'file';
    const updatedAttachments = formData.attachments.map((att, i) => 
      i === index ? { ...att, url, text: file.name, type } : att
    );
    updateFormData({ attachments: updatedAttachments });
  }, [formData.attachments, updateFormData]);

  const controlButtons = [
    { section: 'color' as const, icon: Palette, condition: true },
    { section: 'priority' as const, icon: Flag, condition: true },
    { section: 'timerange' as const, icon: Timer, condition: selectedTemplate === 'timeline' || selectedTemplate === 'calendar' },
    { section: 'category' as const, icon: FolderTree, condition: selectedTemplate === 'timeline' },
    { section: 'links' as const, icon: Link, condition: true }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onMouseDown={(e) => e.target === e.currentTarget && e.preventDefault()}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Task title"
                  className="bg-white/10 border-white/20"
                  required
                />

                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Description (optional)"
                  className="bg-white/10 border-white/20 h-20 resize-none"
                />

                <div className="flex items-center gap-2">
                  {controlButtons.map(({ section, icon: Icon, condition }) => condition && (
                    <Button 
                      key={section}
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleSection(section)}
                      className={`bg-white/10 border-white/20 p-2 ${activeSection === section ? 'bg-white/20' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      {section === 'links' && <Plus className="h-3 w-3 ml-1" />}
                    </Button>
                  ))}
                </div>

                {activeSection === 'links' && (
                  <AttachmentManager
                    attachments={formData.attachments}
                    isExpanded={linksExpanded}
                    onToggleExpansion={() => setLinksExpanded(!linksExpanded)}
                    onAddAttachment={addAttachment}
                    onUpdateAttachment={updateAttachment}
                    onRemoveAttachment={removeAttachment}
                    onFileUpload={handleFileUpload}
                  />
                )}

                {activeSection === 'color' && (
                  <ColorSelector
                    selectedColor={formData.color}
                    customColor={customColor}
                    onColorSelect={(color) => updateFormData({ color })}
                    onCustomColorChange={(color) => {
                      setCustomColor(color);
                      if (color.match(/^#[0-9A-F]{6}$/i)) {
                        updateFormData({ color });
                      }
                    }}
                  />
                )}

                {activeSection === 'priority' && (
                  <PrioritySelector
                    selectedPriority={selectedPriority}
                    onPrioritySelect={handlePrioritySelect}
                    onClearSelection={() => setSelectedPriority(null)}
                  />
                )}

                {activeSection === 'category' && (
                  <CategorySelector
                    categories={categories}
                    selectedCategoryId={formData.categoryId}
                    onCategorySelect={handleCategorySelect}
                    onToggleExpanded={toggleCategoryExpanded}
                    getCategoryById={getCategoryById}
                  />
                )}

                {activeSection === 'timerange' && (
                  <TimeRangeSelector
                    startTime={formData.startTime}
                    endTime={formData.endTime}
                    startTimeHour={formData.startTimeHour}
                    startTimeMinutes={formData.startTimeMinutes}
                    startTimeAM={formData.startTimeAM}
                    endTimeHour={formData.endTimeHour}
                    endTimeMinutes={formData.endTimeMinutes}
                    endTimeAM={formData.endTimeAM}
                    onStartTimeChange={(date) => updateFormData({ startTime: date })}
                    onEndTimeChange={(date) => updateFormData({ endTime: date })}
                    onStartTimeHourChange={(hour) => updateFormData({ startTimeHour: hour })}
                    onStartTimeMinutesChange={(minutes) => updateFormData({ startTimeMinutes: minutes })}
                    onStartTimeAMChange={(isAM) => updateFormData({ startTimeAM: isAM })}
                    onEndTimeHourChange={(hour) => updateFormData({ endTimeHour: hour })}
                    onEndTimeMinutesChange={(minutes) => updateFormData({ endTimeMinutes: minutes })}
                    onEndTimeAMChange={(isAM) => updateFormData({ endTimeAM: isAM })}
                    isDarkMode={isDarkMode}
                  />
                )}

                {dateTimeError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 dark:text-red-200 text-sm font-bold">
                    {dateTimeError}
                  </div>
                )}


                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                    Save
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