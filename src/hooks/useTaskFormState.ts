import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { FormData } from '@/utils/taskFormValidation';
import { useTaskFormHelpers } from './useTaskFormHelpers';

export type ActiveSection = 'color' | 'priority' | 'timerange' | 'links' | 'category' | null;

export const useTaskFormState = (
  editingTask?: Task | null,
  selectedTemplate?: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix',
  selectedDate: Date = new Date(),
  parentId?: string
) => {
  const { parseTimeFromDate, getDefaultTimeSettings } = useTaskFormHelpers();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    color: '',
    priority: '',
    startTime: undefined,
    startTimeHour: '',
    startTimeMinutes: '',
    startTimeAM: true,
    endTime: undefined,
    endTimeHour: '',
    endTimeMinutes: '',
    endTimeAM: false,
    attachments: [],
    categoryId: '',
    completed: false
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [customColor, setCustomColor] = useState('#000000');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [linksExpanded, setLinksExpanded] = useState(false);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (editingTask) {
      const startTimeData = editingTask.startTime ? parseTimeFromDate(editingTask.startTime) : { hour: '', minutes: '', isAM: true };
      const endTimeData = editingTask.endTime ? parseTimeFromDate(editingTask.endTime) : { hour: '', minutes: '', isAM: false };
      
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        color: editingTask.color,
        priority: editingTask.priority,
        startTime: editingTask.startTime,
        startTimeHour: startTimeData.hour,
        startTimeMinutes: startTimeData.minutes,
        startTimeAM: startTimeData.isAM,
        endTime: editingTask.endTime,
        endTimeHour: endTimeData.hour,
        endTimeMinutes: endTimeData.minutes,
        endTimeAM: endTimeData.isAM,
        attachments: editingTask.attachments || [],
        categoryId: (editingTask as any).categoryId || '',
        completed: editingTask.completed || false
      });
      setSelectedPriority(editingTask.priority);
    } else {
      const { startTime, endTime, defaultColor, startTimeData, endTimeData } = getDefaultTimeSettings(selectedDate, parentId);
      
      setFormData(prev => ({
        ...prev,
        color: defaultColor,
        priority: 'P7',
        categoryId: '',
        startTime: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? startTime : undefined,
        endTime: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? endTime : undefined,
        startTimeHour: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? startTimeData.hour : '',
        startTimeMinutes: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? startTimeData.minutes : '',
        startTimeAM: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? startTimeData.isAM : true,
        endTimeHour: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? endTimeData.hour : '',
        endTimeMinutes: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? endTimeData.minutes : '',
        endTimeAM: (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') ? endTimeData.isAM : false
      }));
      
      if (selectedTemplate === 'timeline' || selectedTemplate === 'calendar') {
        setActiveSection('timerange');
      }
    }
  }, [editingTask, selectedTemplate, selectedDate, parentId, parseTimeFromDate, getDefaultTimeSettings]);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSection = useCallback((section: ActiveSection) => {
    setActiveSection(activeSection === section ? null : section);
  }, [activeSection]);

  return {
    formData,
    activeSection,
    customColor,
    selectedPriority,
    linksExpanded,
    dateTimeError,
    updateFormData,
    toggleSection,
    setActiveSection,
    setCustomColor,
    setSelectedPriority,
    setLinksExpanded,
    setDateTimeError
  };
};