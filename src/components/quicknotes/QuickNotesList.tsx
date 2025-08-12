import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Card, Button, ScrollArea } from '@/components/ui';
import { QuickNote, NotesFolder } from '@/hooks/useQuickNotesManager';
import { DraggableAddButton } from '../extra-panel/DraggableAddButton';
import { QuickNoteDetails } from './QuickNoteDetails';
interface QuickNotesListProps {
  folder: NotesFolder;
  notes: QuickNote[];
  isDarkMode: boolean;
  highlightedNoteId?: string;
  onAddNote: () => void;
  onUpdateNote: (id: string, updates: Partial<QuickNote>) => void;
  onDeleteNote: (id: string) => void;
}
export const QuickNotesList: React.FC<QuickNotesListProps> = ({
  folder,
  notes,
  isDarkMode,
  highlightedNoteId,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [selectedNote, setSelectedNote] = useState<QuickNote | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const handleNoteClick = (note: QuickNote) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    if (newClickCount === 2) {
      // Double click - open in read mode
      setSelectedNote(note);
      setClickCount(0);
    } else {
      // Start timer for potential double click
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 300);
      setClickTimer(timer);
    }
  };
  const formatNoteTitle = (content: string) => {
    if (!content) return 'Untitled Note';
    // Extract first line and remove HTML tags
    const firstLine = content.split('\n')[0];
    const cleanText = firstLine.replace(/<[^>]*>/g, '');
    return cleanText.length > 30 ? cleanText.substring(0, 30) : cleanText;
  };
  const formatNotePreview = (content: string) => {
    if (!content) return 'No content';
    // Remove HTML tags for preview
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) : text;
  };
  if (selectedNote) {
    return <QuickNoteDetails note={selectedNote} isDarkMode={isDarkMode} onClose={() => setSelectedNote(null)} onSave={updates => {
      onUpdateNote(selectedNote.id, updates);
      setSelectedNote({
        ...selectedNote,
        ...updates
      });
    }} onDelete={() => {
      onDeleteNote(selectedNote.id);
      setSelectedNote(null);
    }} />;
  }
  return <div className="h-full flex flex-col bg-transparent rounded-3xl mx-2 my-2 relative">
      {/* Header */}
      <div className="p-6 border-b border-white/20 rounded-t-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm overflow-hidden" style={{
          backgroundColor: folder.iconUrl ? 'transparent' : folder.color
        }}>
            {folder.iconUrl ? <img src={folder.iconUrl} alt={folder.name} className="w-full h-full object-cover rounded-md" /> : folder.name.charAt(0).toUpperCase()}
          </div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {folder.name}
          </h2>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
          {notes.length} notes
        </p>
      </div>

      {/* Notes Grid */}
      <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
        <div className="p-6 min-h-full">
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <Card key={note.id} className={`p-4 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-lg border rounded-2xl bg-white/15 hover:bg-white/20 aspect-square flex flex-col ${
                  highlightedNoteId === note.id 
                    ? 'border-primary ring-4 ring-primary/50 bg-primary/20 scale-[1.05] shadow-2xl shadow-primary/25' 
                    : 'border-white/20'
                }`} style={{
                  background: highlightedNoteId === note.id 
                    ? `linear-gradient(135deg, ${note.color}40, ${note.color}20)`
                    : `linear-gradient(135deg, ${note.color}20, ${note.color}10)`
                }} onClick={() => handleNoteClick(note)}>
                  <div className="flex-1 flex flex-col">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 line-clamp-2`}>
                      {note.title || formatNoteTitle(note.content)}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'} flex-1 line-clamp-4`}>
                      {formatNotePreview(note.content)}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                      <div className="w-4 h-4 rounded-full" style={{
                        backgroundColor: note.color
                      }} />
                      <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {note.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                Starting Writing Notes
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Add Button */}
      <DraggableAddButton onClick={onAddNote} isDarkMode={isDarkMode} />
    </div>;
};