import { useState, useCallback } from 'react';
import { Task, TaskManagerState, TaskActions, TaskAttachment, TaskComment } from '@/types/task';
import { useSupabaseTasks, SupabaseTask, TaskAttachment as SupabaseTaskAttachment, TaskComment as SupabaseTaskComment } from './useSupabaseTasks';
import { useSupabaseWorkspaces } from './useSupabaseWorkspaces';
import { useSupabaseMissions } from './useSupabaseMissions';
import { toast } from 'sonner';

// Convert SupabaseTask to legacy Task format
const convertSupabaseTaskToLegacy = (supabaseTask: SupabaseTask, attachments: SupabaseTaskAttachment[] = [], comments: SupabaseTaskComment[] = []): Task => {
  // Convert attachments to legacy format
  const taskAttachments: TaskAttachment[] = attachments
    .filter(att => att.task_id === supabaseTask.id)
    .map(att => ({
      id: att.id,
      url: att.file_url,
      text: att.file_name,
      type: att.file_type?.includes('image') ? 'image' : 'file' as 'link' | 'file' | 'image',
      color: '#3B82F6'
    }));

  // Convert comments to legacy format
  const taskComments: TaskComment[] = comments
    .filter(comment => comment.task_id === supabaseTask.id)
    .map(comment => ({
      id: comment.id,
      text: comment.text,
      color: comment.color || '#3B82F6',
      createdAt: new Date(comment.created_at),
      taskId: comment.task_id
    }));

  return {
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description,
    completed: supabaseTask.completed,
    priority: supabaseTask.priority as any,
    categoryId: supabaseTask.category_id,
    createdAt: new Date(supabaseTask.created_at),
    color: supabaseTask.color,
    date: supabaseTask.scheduled_date ? new Date(supabaseTask.scheduled_date) : new Date(),
    missionId: supabaseTask.mission_id,
    startTime: supabaseTask.start_time ? new Date(supabaseTask.start_time) : undefined,
    endTime: supabaseTask.end_time ? new Date(supabaseTask.end_time) : undefined,
    subTasks: supabaseTask.sub_tasks?.map(subTask => convertSupabaseTaskToLegacy(subTask, attachments, comments)) || [],
    isExpanded: supabaseTask.is_expanded,
    order: supabaseTask.task_order,
    kanbanColumn: supabaseTask.kanban_column,
    quadrant: supabaseTask.matrix_quadrant,
    originalQuadrant: supabaseTask.matrix_quadrant,
    originalKanbanColumn: supabaseTask.kanban_column,
    parentId: supabaseTask.parent_id,
    attachments: taskAttachments,
    comments: taskComments
  };
};

// Convert legacy Task to SupabaseTask format
const convertLegacyTaskToSupabase = (task: Partial<Task>, workspaceId: string, missionId: string): Omit<SupabaseTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_tasks'> => {
  return {
    title: task.title || '',
    description: task.description || 'Click to add description...',
    color: task.color || '#3B82F6',
    priority: task.priority || 'P7',
    workspace_id: workspaceId,
    mission_id: missionId,
    category_id: task.categoryId,
    scheduled_date: task.date?.toISOString().split('T')[0],
    start_time: task.startTime?.toISOString(),
    end_time: task.endTime?.toISOString(),
    completed: task.completed || false,
    kanban_column: task.kanbanColumn || 'todo',
    matrix_quadrant: task.quadrant,
    task_order: task.order || 0,
    is_expanded: task.isExpanded || false,
    parent_id: task.parentId
  };
};

export const useUnifiedTaskManager = () => {
  const { selectedWorkspace } = useSupabaseWorkspaces();
  const { missions } = useSupabaseMissions(selectedWorkspace?.id);
  const {
    tasks: supabaseTasks,
    attachments: supabaseAttachments,
    comments: supabaseComments,
    addTask: addSupabaseTask,
    updateTask: updateSupabaseTask,
    deleteTask: deleteSupabaseTask,
    addAttachment,
    addComment
  } = useSupabaseTasks(selectedWorkspace?.id);

  // Convert Supabase tasks to legacy format
  const tasks = supabaseTasks.map(task => convertSupabaseTaskToLegacy(task, supabaseAttachments, supabaseComments));

  // State management
  const [state, setState] = useState<TaskManagerState>({
    tasks: [],
    selectedTask: null,
    showAddTask: false,
    editingTask: null,
    addingSubTaskParent: null,
    selectedDate: new Date()
  });

  // Update state when Supabase tasks change
  useState(() => {
    setState(prev => ({ ...prev, tasks }));
  });

  // Core task operations
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'createdAt' | 'categoryId'>) => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace first');
      return null as any;
    }

    const defaultMission = missions[0];
    if (!defaultMission) {
      toast.error('Please create a mission first');
      return null as any;
    }

    const supabaseTaskData = convertLegacyTaskToSupabase(taskData, selectedWorkspace.id, defaultMission.id);
    const result = await addSupabaseTask(supabaseTaskData);
    
    if (result) {
      const newTask = convertSupabaseTaskToLegacy(result);
      setState(prev => ({ ...prev, selectedTask: newTask }));
      return newTask;
    }
    return null as any;
  }, [selectedWorkspace, missions, addSupabaseTask]);

  const addSubTask = useCallback(async (parentId: string, taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'parentId'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'createdAt' | 'parentId' | 'categoryId'>) => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace first');
      return null as any;
    }

    const defaultMission = missions[0];
    if (!defaultMission) {
      toast.error('Please create a mission first');
      return null as any;
    }

    const supabaseTaskData = {
      ...convertLegacyTaskToSupabase(taskData, selectedWorkspace.id, defaultMission.id),
      parent_id: parentId
    };
    
    const result = await addSupabaseTask(supabaseTaskData);
    return result ? convertSupabaseTaskToLegacy(result) : null as any;
  }, [selectedWorkspace, missions, addSupabaseTask]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!selectedWorkspace) return;
    
    const supabaseUpdates = convertLegacyTaskToSupabase(updates, selectedWorkspace.id, '');
    await updateSupabaseTask(taskId, supabaseUpdates as any);

    setState(prev => {
      const updatedSelectedTask = prev.selectedTask?.id === taskId 
        ? { ...prev.selectedTask, ...updates } 
        : prev.selectedTask;
      
      return {
        ...prev,
        selectedTask: updatedSelectedTask
      };
    });
  }, [selectedWorkspace, updateSupabaseTask]);

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteSupabaseTask(taskId);
    setState(prev => ({
      ...prev,
      selectedTask: prev.selectedTask?.id === taskId ? null : prev.selectedTask
    }));
  }, [deleteSupabaseTask]);

  const toggleTaskComplete = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const toggleTaskExpanded = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { isExpanded: !task.isExpanded });
    }
  }, [tasks, updateTask]);

  const moveTask = useCallback(async (taskId: string, newParentId?: string) => {
    await updateTask(taskId, { parentId: newParentId });
  }, [updateTask]);

  const expandParentTasks = useCallback(() => {
    // This would need to be implemented based on task hierarchy
    console.log('expandParentTasks not yet implemented for Supabase');
  }, []);

  const deleteTasksByMissionIds = useCallback(async (missionIds: string[]) => {
    // This is handled automatically by CASCADE DELETE in database
    console.log('Tasks deleted automatically via CASCADE DELETE');
  }, []);

  // Legacy compatibility methods
  const addTaskLegacy = useCallback(async (title: string, taskData?: Partial<Task>) => {
    if (!title.trim()) return;
    
    const newTaskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> = {
      title,
      description: taskData?.description || 'Click to add description...',
      completed: false,
      priority: taskData?.priority || 'P7',
      categoryId: taskData?.categoryId,
      createdAt: new Date(),
      color: taskData?.color || '#3B82F6',
      date: taskData?.date || new Date(),
      missionId: taskData?.missionId || '',
      startTime: taskData?.startTime,
      endTime: taskData?.endTime,
      kanbanColumn: taskData?.kanbanColumn || 'todo',
      attachments: [],
      ...taskData
    };
    
    return await addTask(newTaskData);
  }, [addTask]);

  const updateTaskDescription = useCallback(async (taskId: string, description: string) => {
    await updateTask(taskId, { description });
  }, [updateTask]);

  // Enhanced action handlers
  const handleTaskEdit = useCallback(async (task: Task) => {
    if (!task.title?.trim()) {
      toast.error('Task title is required');
      return;
    }
    await updateTask(task.id, task);
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
  }, [deleteTask]);

  const handleSubTaskAdd = useCallback((parentId: string) => {
    setState(prev => ({ ...prev, addingSubTaskParent: parentId }));
  }, []);

  const handleTaskMove = useCallback(async (taskId: string, newColumnId: string) => {
    if (['urgent-important', 'not-urgent-important', 'urgent-unimportant', 'not-urgent-unimportant'].includes(newColumnId)) {
      await updateTask(taskId, { quadrant: newColumnId });
    } else if (['todo', 'in-progress', 'completed'].includes(newColumnId)) {
      await updateTask(taskId, { kanbanColumn: newColumnId });
    }
  }, [updateTask]);

  const handleTaskComplete = useCallback(async (taskId: string) => {
    await toggleTaskComplete(taskId);
  }, [toggleTaskComplete]);

  // State management functions
  const setSelectedTask = useCallback((task: Task | null) => {
    setState(prev => ({ ...prev, selectedTask: task }));
  }, []);

  const setSelectedDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  const setShowAddTask = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showAddTask: show }));
  }, []);

  const setEditingTask = useCallback((task: Task | null) => {
    setState(prev => ({ ...prev, editingTask: task }));
  }, []);

  const setAddingSubTaskParent = useCallback((parentId: string | null) => {
    setState(prev => ({ ...prev, addingSubTaskParent: parentId }));
  }, []);

  // Comment and attachment management (improved)
  const addCommentToTask = useCallback(async (taskId: string, text: string, color: string) => {
    await addComment({ task_id: taskId, text, color });
  }, [addComment]);

  const addAttachmentToTask = useCallback(async (taskId: string, fileName: string, fileUrl: string, fileType?: string, fileSize?: number) => {
    await addAttachment({
      task_id: taskId,
      file_name: fileName,
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize
    });
  }, [addAttachment]);

  const editComment = useCallback(() => {
    console.log('editComment not yet implemented for Supabase');
  }, []);

  const deleteComment = useCallback(() => {
    console.log('deleteComment not yet implemented for Supabase');
  }, []);

  const changeCommentColor = useCallback(() => {
    console.log('changeCommentColor not yet implemented for Supabase');
  }, []);

  // Actions object for compatibility
  const actions: TaskActions = {
    addTask: addTask as any,
    addSubTask: addSubTask as any,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskExpanded,
    moveTask,
    setSelectedTask,
    setSelectedDate,
    expandParentTasks
  };

  return {
    // Core state
    tasks,
    selectedTask: state.selectedTask,
    showAddTask: state.showAddTask,
    editingTask: state.editingTask,
    addingSubTaskParent: state.addingSubTaskParent,
    selectedDate: state.selectedDate,
    
    // Actions object for useTaskState compatibility
    actions,
    
    // Core operations
    addTask,
    addSubTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskExpanded,
    moveTask,
    setSelectedTask,
    setSelectedDate,
    expandParentTasks,
    deleteTasksByMissionIds,
    
    // Enhanced handlers
    handleTaskEdit,
    handleTaskDelete,
    handleSubTaskAdd,
    handleTaskMove,
    handleTaskComplete,
    
    // Legacy compatibility
    addTaskLegacy,
    updateTaskDescription,
    
    // State management
    setShowAddTask,
    setEditingTask,
    setAddingSubTaskParent,
    
    // Improved comment/attachment management
    comments: supabaseComments,
    addComment: addCommentToTask,
    editComment,
    deleteComment,
    changeCommentColor,
    addAttachmentToTask,
    
    // Simplified link management
    taskLinks: [],
    editTaskLink: () => {},
    deleteTaskLink: () => {},
    changeTaskLinkColor: () => {}
  };
};