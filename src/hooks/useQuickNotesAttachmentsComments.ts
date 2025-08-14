import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface QuickNoteAttachment {
  id: string;
  note_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface QuickNoteComment {
  id: string;
  note_id: string;
  user_id: string;
  text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useQuickNotesAttachmentsComments = (noteId?: string) => {
  const [attachments, setAttachments] = useState<QuickNoteAttachment[]>([]);
  const [comments, setComments] = useState<QuickNoteComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!user || !noteId) return;
    
    try {
      const { data, error } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_id', noteId);

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    if (!user || !noteId) return;
    
    try {
      const { data, error } = await supabase
        .from('note_comments')
        .select('*')
        .eq('user_id', user.id)
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add attachment
  const addAttachment = async (attachment: Omit<QuickNoteAttachment, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_attachments')
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

  // Delete attachment
  const deleteAttachment = async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from('note_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      await fetchAttachments();
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // Add comment
  const addComment = async (comment: Omit<QuickNoteComment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_comments')
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

  // Update comment
  const updateComment = async (commentId: string, updates: Partial<QuickNoteComment>) => {
    try {
      const { data, error } = await supabase
        .from('note_comments')
        .update(updates)
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      await fetchComments();
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('note_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !noteId) return;

    fetchAttachments();
    fetchComments();
    setLoading(false);

    const attachmentsChannel = supabase
      .channel('note-attachments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'note_attachments',
        filter: `note_id=eq.${noteId}`
      }, () => {
        fetchAttachments();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('note-comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'note_comments',
        filter: `note_id=eq.${noteId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(attachmentsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, noteId]);

  return {
    attachments,
    comments,
    loading,
    addAttachment,
    deleteAttachment,
    addComment,
    updateComment,
    deleteComment,
    refetch: () => {
      fetchAttachments();
      fetchComments();
    }
  };
};