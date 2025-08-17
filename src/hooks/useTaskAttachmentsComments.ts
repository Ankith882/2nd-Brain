import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export const useTaskAttachmentsComments = () => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch attachments
  const fetchAttachments = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching task attachments:', error);
    }
  }, [user]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching task comments:', error);
    }
  }, [user]);

  // Upload file to storage
  const uploadFile = useCallback(async (file: File, taskId: string) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${taskId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('task-files')
        .getPublicUrl(filePath);

      return {
        path: uploadData.path,
        url: urlData.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, [user]);

  // Add attachment
  const addAttachment = useCallback(async (attachment: Omit<TaskAttachment, 'id' | 'user_id' | 'created_at'>) => {
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
  }, [user, fetchAttachments]);

  // Delete attachment
  const deleteAttachment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAttachments();
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  }, [fetchAttachments]);

  // Add comment
  const addComment = useCallback(async (comment: Omit<TaskComment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
  }, [user, fetchComments]);

  // Update comment
  const updateComment = useCallback(async (id: string, updates: Partial<TaskComment>) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchComments();
      toast.success('Comment updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  }, [fetchComments]);

  // Delete comment
  const deleteComment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  }, [fetchComments]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchAttachments();
    fetchComments();
    setLoading(false);

    const attachmentsChannel = supabase
      .channel('task-attachments-changes')
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
      .channel('task-comments-changes')
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
      supabase.removeChannel(attachmentsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, fetchAttachments, fetchComments]);

  return {
    attachments,
    comments,
    loading,
    uploadFile,
    addAttachment,
    deleteAttachment,
    addComment,
    updateComment,
    deleteComment
  };
};