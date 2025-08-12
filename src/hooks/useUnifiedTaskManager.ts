import { useState, useCallback } from 'react';
import { Task, TaskManagerState, TaskActions, TaskAttachment, TaskComment } from '@/types/task';
import { Comment } from '@/components/CommentManager';
import { TaskLink } from '@/components/link/LinkManager';
import { 
  generateTaskId, 
  updateTaskRecursively, 
  deleteTaskRecursively, 
  addSubTaskRecursively, 
  toggleTaskExpandedRecursively, 
  toggleTaskCompleteRecursively,
  expandParentTasksRecursively 
} from '@/utils/taskUtils';
import { validateTaskTitle } from '@/utils/taskValidation';
import { toast } from 'sonner';

const initialTasks: Task[] = [];

export const useUnifiedTaskManager = () => {
  // Combined state from useTaskState and useTaskManager
  const [state, setState] = useState<TaskManagerState>({
    tasks: initialTasks,
    selectedTask: null,
    showAddTask: false,
    editingTask: null,
    addingSubTaskParent: null,
    selectedDate: new Date()
  });

  const [comments, setComments] = useState<Comment[]>([]);
  const [taskLinks, setTaskLinks] = useState<TaskLink[]>([]);

  // Core task operations (from useTaskState)
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'category' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateTaskId(),
      categoryId: 'categoryId' in taskData ? taskData.categoryId : undefined,
      createdAt: 'createdAt' in taskData ? taskData.createdAt : new Date(),
      subTasks: [],
      isExpanded: true,
      order: state.tasks.length,
      attachments: taskData.attachments || []
    };

    if (taskData.parentId) {
      setState(prev => ({
        ...prev,
        tasks: addSubTaskRecursively(prev.tasks, taskData.parentId!, newTask)
      }));
    } else {
      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
    }

    setState(prev => ({ ...prev, selectedTask: newTask }));
    return newTask;
  }, [state.tasks]);

  const addSubTask = useCallback((parentId: string, taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'parentId'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'category' | 'createdAt' | 'parentId'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateTaskId(),
      parentId,
      categoryId: 'categoryId' in taskData ? taskData.categoryId : undefined,
      createdAt: 'createdAt' in taskData ? taskData.createdAt : new Date(),
      subTasks: [],
      isExpanded: false,
      order: 0,
      attachments: taskData.attachments || []
    };

    setState(prev => ({
      ...prev,
      tasks: addSubTaskRecursively(prev.tasks, parentId, newTask)
    }));

    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setState(prev => {
      const updatedTasks = updateTaskRecursively(prev.tasks, taskId, updates);
      const updatedSelectedTask = prev.selectedTask?.id === taskId 
        ? { ...prev.selectedTask, ...updates } 
        : prev.selectedTask;
      
      return {
        ...prev,
        tasks: updatedTasks,
        selectedTask: updatedSelectedTask
      };
    });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: deleteTaskRecursively(prev.tasks, taskId),
      selectedTask: prev.selectedTask?.id === taskId ? null : prev.selectedTask
    }));
  }, []);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: toggleTaskCompleteRecursively(prev.tasks, taskId)
    }));
  }, []);

  const toggleTaskExpanded = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: toggleTaskExpandedRecursively(prev.tasks, taskId)
    }));
  }, []);

  const moveTask = useCallback((taskId: string, newParentId?: string) => {
    // Implementation for moving tasks between parents
    console.log('Moving task:', taskId, 'to parent:', newParentId);
  }, []);

  const expandParentTasks = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: expandParentTasksRecursively(prev.tasks, taskId)
    }));
  }, []);

  const deleteTasksByMissionIds = useCallback((missionIds: string[]) => {
    const deleteTasksByMissionRecursively = (taskList: Task[]): Task[] => {
      return taskList.filter(task => !missionIds.includes(task.missionId)).map(task => ({
        ...task,
        subTasks: deleteTasksByMissionRecursively(task.subTasks)
      }));
    };
    
    setState(prev => ({
      ...prev,
      tasks: deleteTasksByMissionRecursively(prev.tasks),
      selectedTask: prev.selectedTask && missionIds.includes(prev.selectedTask.missionId) ? null : prev.selectedTask
    }));
  }, []);

  // Legacy compatibility methods (from useTaskManager)
  const addTaskLegacy = useCallback((title: string, taskData?: Partial<Task>) => {
    if (!title.trim()) return;
    
    // Get first column ID from saved Kanban config for new tasks
    let kanbanColumn = taskData?.kanbanColumn;
    if (!kanbanColumn) {
      try {
        const saved = localStorage.getItem('kanban-grid-config');
        if (saved) {
          const config = JSON.parse(saved);
          kanbanColumn = config.kanbanColumns?.[0]?.id || 'todo';
        } else {
          kanbanColumn = 'todo';
        }
      } catch {
        kanbanColumn = 'todo';
      }
    }
    
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description: taskData?.description || 'Click to add description...',
      completed: false,
      priority: taskData?.priority || 'P7',
      categoryId: taskData?.categoryId,
      createdAt: new Date(),
      color: taskData?.color || '#3B82F6',
      date: taskData?.date || new Date(),
      missionId: taskData?.missionId || 'default',
      startTime: taskData?.startTime,
      endTime: taskData?.endTime,
      subTasks: [],
      isExpanded: false,
      order: state.tasks.length,
      kanbanColumn,
      ...taskData
    };
    
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      selectedTask: newTask
    }));
    
    return newTask;
  }, [state.tasks]);

  const updateTaskDescription = useCallback((taskId: string, description: string) => {
    const updateDescriptionRecursively = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, description };
        }
        return { ...task, subTasks: updateDescriptionRecursively(task.subTasks) };
      });
    };
    
    setState(prev => ({
      ...prev,
      tasks: updateDescriptionRecursively(prev.tasks),
      selectedTask: prev.selectedTask?.id === taskId ? { ...prev.selectedTask, description } : prev.selectedTask
    }));
  }, []);

  // Enhanced action handlers (from useTaskActions)
  const handleTaskEdit = useCallback((task: Task) => {
    if (!validateTaskTitle(task.title)) {
      toast.error('Task title is required');
      return;
    }
    updateTask(task.id, task);
  }, [updateTask]);

  const handleTaskDelete = useCallback((taskId: string) => {
    deleteTask(taskId);
    toast.success('Task deleted successfully');
  }, [deleteTask]);

  const handleSubTaskAdd = useCallback((parentId: string) => {
    // This will trigger the form to open with parentId
    console.log('Adding subtask to parent:', parentId);
  }, []);

  const handleTaskMove = useCallback((taskId: string, newColumnId: string) => {
    // Handle task movement between different templates
    if (['urgent-important', 'not-urgent-important', 'urgent-unimportant', 'not-urgent-unimportant'].includes(newColumnId)) {
      updateTask(taskId, { quadrant: newColumnId });
    } else if (['todo', 'in-progress', 'completed'].includes(newColumnId)) {
      updateTask(taskId, { kanbanColumn: newColumnId });
    }
  }, [updateTask]);

  const handleTaskComplete = useCallback((taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      const updates: Partial<Task> = { completed: !task.completed };
      
      // Store/restore original column for Kanban
      if (!task.completed) {
        updates.originalKanbanColumn = task.originalKanbanColumn || task.kanbanColumn || 'todo';
      }
      
      updateTask(taskId, updates);
    }
  }, [state.tasks, updateTask]);

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

  // Comment management
  const addComment = useCallback((taskId: string, text: string, color: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      color,
      createdAt: new Date(),
      taskId
    };
    setComments(prev => [...prev, newComment]);
  }, []);

  const editComment = useCallback((commentId: string, text: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, text } : comment
    ));
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  }, []);

  const changeCommentColor = useCallback((commentId: string, color: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, color } : comment
    ));
  }, []);

  // Link management
  const editTaskLink = useCallback((linkId: string, url: string, text: string) => {
    setTaskLinks(prev => prev.map(link => 
      link.id === linkId ? { ...link, url, text } : link
    ));
  }, []);

  const deleteTaskLink = useCallback((linkId: string) => {
    setTaskLinks(prev => prev.filter(link => link.id !== linkId));
  }, []);

  const changeTaskLinkColor = useCallback((linkId: string, color: string) => {
    setTaskLinks(prev => prev.map(link => 
      link.id === linkId ? { ...link, color } : link
    ));
  }, []);

  // Actions object for compatibility
  const actions: TaskActions = {
    addTask,
    addSubTask,
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
    tasks: state.tasks,
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
    
    // Enhanced handlers (useTaskActions compatibility)
    handleTaskEdit,
    handleTaskDelete,
    handleSubTaskAdd,
    handleTaskMove,
    handleTaskComplete,
    
    // Legacy compatibility (useTaskManager)
    addTaskLegacy, // Legacy method with different signature
    updateTaskDescription,
    
    // State management
    setShowAddTask,
    setEditingTask,
    setAddingSubTaskParent,
    
    // Comment management
    comments,
    addComment,
    editComment,
    deleteComment,
    changeCommentColor,
    
    // Link management
    taskLinks,
    editTaskLink,
    deleteTaskLink,
    changeTaskLinkColor
  };
};