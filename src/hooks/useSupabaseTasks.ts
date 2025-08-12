import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SupabaseTask {
  id: string;
  user_id: string;
  workspace_id: string;
  mission_id: string;
  parent_id?: string;
  category_id?: string;
  title: string;
  description: string;
  color: string;
  priority: string;
  start_time?: string;
  end_time?: string;
  scheduled_date?: string;
  completed: boolean;
  kanban_column: string;
  kanban_row?: string;
  matrix_quadrant?: string;
  task_order: number;
  is_expanded: boolean;
  created_at: string;
  updated_at: string;
  sub_tasks?: SupabaseTask[];
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseTasks = (workspaceId?: string, missionId?: string) => {
  const [tasks, setTasks] = useState<SupabaseTask[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch tasks with hierarchical structure
  const fetchTasks = async () => {
    if (!user || !workspaceId) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId);

      if (missionId) {
        query = query.eq('mission_id', missionId);
      }

      const { data, error } = await query.order('task_order', { ascending: true });

      if (error) throw error;

      // Build hierarchical structure
      const taskMap = new Map<string, SupabaseTask>();
      const rootTasks: SupabaseTask[] = [];

      data?.forEach(task => {
        taskMap.set(task.id, { ...task, sub_tasks: [] });
      });

      data?.forEach(task => {
        const taskObj = taskMap.get(task.id)!;
        if (task.parent_id) {
          const parent = taskMap.get(task.parent_id);
          if (parent) {
            parent.sub_tasks!.push(taskObj);
          }
        } else {
          rootTasks.push(taskObj);
        }
      });

      setTasks(rootTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add task
  const addTask = async (task: Omit<SupabaseTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_tasks'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      toast.success('Task created successfully');
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task');
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<SupabaseTask>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Delete task (cascades to sub-tasks)
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTasks();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Add attachment
  const addAttachment = async (attachment: Omit<TaskAttachment, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          ...attachment,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAttachments();
      toast.success('Attachment added successfully');
      return data;
    } catch (error) {
      console.error('Error adding attachment:', error);
      toast.error('Failed to add attachment');
    }
  };

  // Add comment
  const addComment = async (comment: Omit<TaskComment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          ...comment,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchComments();
      toast.success('Comment added successfully');
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !workspaceId) return;

    fetchTasks();
    fetchAttachments();
    fetchComments();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchTasks();
      })
      .subscribe();

    const attachmentsChannel = supabase
      .channel('attachments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_attachments',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAttachments();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_comments',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(attachmentsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, workspaceId, missionId]);

  return {
    tasks,
    attachments,
    comments,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addAttachment,
    addComment,
    refetch: fetchTasks
  };
};