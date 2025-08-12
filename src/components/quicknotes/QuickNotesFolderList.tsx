import React, { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash2, StickyNote } from 'lucide-react';
import { 
  Button, 
  Card, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui';
import { NotesFolder } from '@/hooks/useQuickNotesManager';
import { AddNotesFolderForm } from './AddNotesFolderForm';
interface QuickNotesFolderListProps {
  folders: NotesFolder[];
  selectedFolder: NotesFolder | null;
  isDarkMode: boolean;
  workspaceId: string;
  onFolderSelect: (folder: NotesFolder) => void;
  onAddFolder: () => void;
  onUpdateFolder: (id: string, updates: Partial<NotesFolder>) => void;
  onDeleteFolder: (id: string) => void;
}
export const QuickNotesFolderList: React.FC<QuickNotesFolderListProps> = ({
  folders,
  selectedFolder,
  isDarkMode,
  workspaceId,
  onFolderSelect,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder
}) => {
  const [editingFolder, setEditingFolder] = useState<NotesFolder | null>(null);
  const handleDelete = (folder: NotesFolder) => {
    if (window.confirm('Are you sure you want to delete this folder? All notes inside will be deleted.')) {
      onDeleteFolder(folder.id);
    }
  };
  const getFolderInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase();
  };
  return <div className="h-full flex flex-col bg-transparent border-r border-white/20 rounded-3xl mx-2 my-2">
      <div className="p-6 border-b border-white/20 rounded-t-3xl">
        <div className="flex items-center gap-2 mb-2">
          
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Quick Notes
          </h2>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
          {folders.length} folders
        </p>
      </div>

      <div className="p-4">
        <Button onClick={onAddFolder} className="w-full bg-gradient-to-r from-cyan-mist/60 to-purple-500/60 hover:from-cyan-mist/70 hover:to-purple-600/70 transition-all duration-300 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Notes Folder
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent">
        {folders.map(folder => <Card key={folder.id} className="
              p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              border border-white/20 rounded-2xl
              bg-transparent hover:bg-transparent
            " onClick={() => onFolderSelect(folder)}>
            <div className="flex items-start gap-3">
              {/* Folder Icon */}
              <div className="w-12 h-12 rounded-lg border-2 border-white/20 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden" style={{
            backgroundColor: folder.iconUrl ? 'transparent' : folder.color
          }}>
                {folder.iconUrl ? <img src={folder.iconUrl} alt={folder.name} className="w-full h-full object-cover rounded-md" /> : getFolderInitials(folder.name)}
              </div>

              {/* Folder Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                    {folder.name}
                  </h3>
                  
                  {/* Three Dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-white/10 border border-white/20">
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    setEditingFolder(folder);
                  }} className="hover:bg-white/10">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    handleDelete(folder);
                  }} className="hover:bg-red-500/20 text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    {folder.noteCount} notes
                  </p>
                </div>

                <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'} mt-1`}>
                  {folder.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>)}

        {folders.length === 0}
      </div>

      {/* Edit Folder Dialog */}
      {editingFolder && <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
          <DialogContent className="bg-white/10 border border-white/20 max-w-md">
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                Edit Folder
              </DialogTitle>
            </DialogHeader>
            <AddNotesFolderForm folder={editingFolder} isDarkMode={isDarkMode} workspaceId={workspaceId} onSave={updates => {
          onUpdateFolder(editingFolder.id, updates);
          setEditingFolder(null);
        }} onCancel={() => setEditingFolder(null)} />
          </DialogContent>
        </Dialog>}
    </div>;
};