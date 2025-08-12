import { useState, useEffect } from 'react';

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

export const useQuickNotesManager = () => {
  const [folders, setFolders] = useState<NotesFolder[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<NotesFolder | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFolders = localStorage.getItem('quickNotesFolders');
    const savedNotes = localStorage.getItem('quickNotes');
    
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
        ...folder,
        createdAt: new Date(folder.createdAt)
      }));
      setFolders(parsedFolders);
    }
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('quickNotesFolders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
  }, [notes]);

  // Update note counts for folders
  useEffect(() => {
    setFolders(prevFolders => 
      prevFolders.map(folder => ({
        ...folder,
        noteCount: notes.filter(note => note.folderId === folder.id).length
      }))
    );
  }, [notes]);

  const addFolder = (folderData: Omit<NotesFolder, 'id' | 'createdAt' | 'noteCount'>) => {
    const newFolder: NotesFolder = {
      ...folderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      noteCount: 0
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<NotesFolder>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, ...updates } : folder
    ));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
    setNotes(prev => prev.filter(note => note.folderId !== id));
    if (selectedFolder?.id === id) {
      setSelectedFolder(null);
    }
  };

  const deleteFoldersByWorkspaceId = (workspaceId: string) => {
    const foldersToDelete = folders.filter(folder => folder.workspaceId === workspaceId);
    const folderIdsToDelete = foldersToDelete.map(folder => folder.id);
    
    setFolders(prev => prev.filter(folder => folder.workspaceId !== workspaceId));
    setNotes(prev => prev.filter(note => !folderIdsToDelete.includes(note.folderId)));
    
    if (selectedFolder && foldersToDelete.some(folder => folder.id === selectedFolder.id)) {
      setSelectedFolder(null);
    }
  };

  const addNote = (noteData: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: QuickNote = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<QuickNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
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
    getNotesByFolder
  };
};