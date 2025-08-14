import { useState } from 'react';
import { useSupabaseQuickNotes, QuickNote as SupabaseQuickNote, NoteFolder as SupabaseNoteFolder } from './useSupabaseQuickNotes';
import { useWorkspaceManager } from './useWorkspaceManager';

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Array<{id: string, url: string, text: string, type: 'link' | 'file', color: string}>;
  comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>;
}

export interface NotesFolder {
  id: string;
  name: string;
  color: string;
  iconUrl: string;
  workspaceId: string;
  createdAt: Date;
  noteCount: number;
}

const convertSupabaseNoteFolderToNotesFolder = (supabaseFolder: SupabaseNoteFolder, noteCount: number): NotesFolder => {
  return {
    id: supabaseFolder.id,
    name: supabaseFolder.name,
    color: supabaseFolder.color,
    iconUrl: supabaseFolder.image_url || '',
    workspaceId: supabaseFolder.workspace_id,
    createdAt: new Date(supabaseFolder.created_at),
    noteCount
  };
};

const convertSupabaseQuickNoteToQuickNote = (supabaseNote: SupabaseQuickNote): QuickNote => {
  return {
    id: supabaseNote.id,
    title: supabaseNote.title,
    content: supabaseNote.description,
    color: supabaseNote.color,
    folderId: supabaseNote.folder_id,
    createdAt: new Date(supabaseNote.created_at),
    updatedAt: new Date(supabaseNote.updated_at),
    attachments: [], // TODO: Map from supabase attachments
    comments: [] // TODO: Map from supabase comments
  };
};

const convertNotesFolderToSupabaseNoteFolder = (folder: Partial<NotesFolder>, workspaceId: string): Partial<SupabaseNoteFolder> => {
  return {
    workspace_id: workspaceId,
    name: folder.name!,
    color: folder.color!,
    image_url: folder.iconUrl
  };
};

const convertQuickNoteToSupabaseQuickNote = (note: Partial<QuickNote>): Partial<SupabaseQuickNote> => {
  return {
    workspace_id: note.folderId ? undefined : '', // This will be set by the folder
    folder_id: note.folderId!,
    title: note.title!,
    description: note.content!,
    color: note.color!
  };
};

export const useQuickNotesManager = () => {
  const { selectedWorkspace } = useWorkspaceManager();
  const workspaceId = selectedWorkspace;
  
  const {
    folders: supabaseFolders,
    notes: supabaseNotes,
    loading,
    addFolder: addSupabaseFolder,
    addNote: addSupabaseNote,
    updateFolder: updateSupabaseFolder,
    updateNote: updateSupabaseNote,
    deleteFolder: deleteSupabaseFolder,
    deleteNote: deleteSupabaseNote
  } = useSupabaseQuickNotes(workspaceId);

  const [selectedFolder, setSelectedFolder] = useState<NotesFolder | null>(null);

  // Convert supabase data to legacy format
  const folders = supabaseFolders.map(folder => {
    const noteCount = supabaseNotes.filter(note => note.folder_id === folder.id).length;
    return convertSupabaseNoteFolderToNotesFolder(folder, noteCount);
  });

  const notes = supabaseNotes.map(convertSupabaseQuickNoteToQuickNote);

  const addFolder = async (folderData: Omit<NotesFolder, 'id' | 'createdAt' | 'noteCount'>) => {
    if (!workspaceId) return null;
    
    const supabaseFolderData = convertNotesFolderToSupabaseNoteFolder(folderData, workspaceId);
    const result = await addSupabaseFolder({
      workspace_id: workspaceId,
      name: supabaseFolderData.name!,
      color: supabaseFolderData.color!,
      image_url: supabaseFolderData.image_url
    });
    
    if (result) {
      return convertSupabaseNoteFolderToNotesFolder(result, 0);
    }
    return null;
  };

  const updateFolder = async (id: string, updates: Partial<NotesFolder>) => {
    const supabaseUpdates: Partial<SupabaseNoteFolder> = {};
    
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.color) supabaseUpdates.color = updates.color;
    if (updates.iconUrl !== undefined) supabaseUpdates.image_url = updates.iconUrl;
    
    await updateSupabaseFolder(id, supabaseUpdates);
  };

  const deleteFolder = async (id: string) => {
    await deleteSupabaseFolder(id);
    if (selectedFolder?.id === id) {
      setSelectedFolder(null);
    }
  };

  const deleteFoldersByWorkspaceId = (workspaceId: string) => {
    const foldersToDelete = folders.filter(folder => folder.workspaceId === workspaceId);
    
    foldersToDelete.forEach(folder => deleteSupabaseFolder(folder.id));
    
    if (selectedFolder && foldersToDelete.some(folder => folder.id === selectedFolder.id)) {
      setSelectedFolder(null);
    }
  };

  const addNote = async (noteData: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const supabaseNoteData = convertQuickNoteToSupabaseQuickNote(noteData);
    // Set workspace_id from the folder's workspace
    const folder = folders.find(f => f.id === noteData.folderId);
    if (folder) {
      const result = await addSupabaseNote({
        workspace_id: folder.workspaceId,
        folder_id: supabaseNoteData.folder_id!,
        title: supabaseNoteData.title!,
        description: supabaseNoteData.description!,
        color: supabaseNoteData.color!
      });
      
      if (result) {
        return convertSupabaseQuickNoteToQuickNote(result);
      }
    }
    return null;
  };

  const updateNote = async (id: string, updates: Partial<QuickNote>) => {
    const supabaseUpdates: Partial<SupabaseQuickNote> = {};
    
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.content) supabaseUpdates.description = updates.content;
    if (updates.color) supabaseUpdates.color = updates.color;
    if (updates.folderId) supabaseUpdates.folder_id = updates.folderId;
    
    await updateSupabaseNote(id, supabaseUpdates);
  };

  const deleteNote = async (id: string) => {
    await deleteSupabaseNote(id);
  };

  const getFoldersByWorkspace = (workspaceId: string) => {
    return folders.filter(folder => folder.workspaceId === workspaceId);
  };

  const getNotesByFolder = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId);
  };

  return {
    folders,
    notes,
    selectedFolder,
    setSelectedFolder,
    addFolder,
    updateFolder,
    deleteFolder,
    deleteFoldersByWorkspaceId,
    addNote,
    updateNote,
    deleteNote,
    getFoldersByWorkspace,
    getNotesByFolder,
    loading
  };
};