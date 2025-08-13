import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NoteFolder {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  color: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickNote {
  id: string;
  user_id: string;
  workspace_id: string;
  folder_id: string;
  title: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface NoteAttachment {
  id: string;
  note_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface NoteComment {
  id: string;
  note_id: string;
  user_id: string;
  text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseQuickNotes = (workspaceId?: string) => {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch folders
  const fetchFolders = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    }
  };

  // Fetch attachments
  const fetchAttachments = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('note_attachments')
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
        .from('note_comments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add folder
  const addFolder = async (folder: Omit<NoteFolder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_folders')
        .insert({
          workspace_id: folder.workspace_id,
          name: folder.name,
          color: folder.color,
          image_url: folder.image_url,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFolders();
      toast.success('Folder created successfully');
      return data;
    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Add note
  const addNote = async (note: Omit<QuickNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .insert({
          workspace_id: note.workspace_id,
          folder_id: note.folder_id,
          title: note.title,
          description: note.description,
          color: note.color,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchNotes();
      toast.success('Note created successfully');
      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to create note');
    }
  };

  // Update folder
  const updateFolder = async (id: string, updates: Partial<NoteFolder>) => {
    try {
      const { data, error } = await supabase
        .from('note_folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchFolders();
      toast.success('Folder updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  // Update note
  const updateNote = async (id: string, updates: Partial<QuickNote>) => {
    try {
      const { data, error } = await supabase
        .from('quick_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchNotes();
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  // Delete folder (cascades to notes)
  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchFolders();
      await fetchNotes();
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNotes();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Add attachment
  const addAttachment = async (attachment: Omit<NoteAttachment, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_attachments')
        .insert({
          note_id: attachment.note_id,
          file_name: attachment.file_name,
          file_url: attachment.file_url,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
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
  const addComment = async (comment: Omit<NoteComment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('note_comments')
        .insert({
          note_id: comment.note_id,
          text: comment.text,
          color: comment.color,
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

    const fetchAllData = async () => {
      await Promise.all([
        fetchFolders(),
        fetchNotes(),
        fetchAttachments(),
        fetchComments()
      ]);
      setLoading(false);
    };

    fetchAllData();

    const foldersChannel = supabase
      .channel('note-folders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'note_folders',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchFolders();
      })
      .subscribe();

    const notesChannel = supabase
      .channel('quick-notes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quick_notes',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotes();
      })
      .subscribe();

    const attachmentsChannel = supabase
      .channel('note-attachments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'note_attachments',
        filter: `user_id=eq.${user.id}`
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
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(foldersChannel);
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(attachmentsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, workspaceId]);

  return {
    folders,
    notes,
    attachments,
    comments,
    loading,
    addFolder,
    addNote,
    updateFolder,
    updateNote,
    deleteFolder,
    deleteNote,
    addAttachment,
    addComment,
    refetch: () => {
      fetchFolders();
      fetchNotes();
      fetchAttachments();
      fetchComments();
    }
  };
};