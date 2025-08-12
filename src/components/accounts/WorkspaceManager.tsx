
import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Upload, Link } from 'lucide-react';
import { Button, Input, Card, Label, ScrollArea } from '@/components/ui';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

interface WorkspaceManagerProps {
  isDarkMode: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  selectedWorkspace: string | null;
  onAddWorkspace: (workspace: Omit<Workspace, 'id'>) => void;
  onUpdateWorkspace: (id: string, updates: Omit<Workspace, 'id'>) => void;
  onDeleteWorkspace: (id: string) => void;
  onSelectWorkspace: (id: string) => void;
  onSettingsClick: () => void;
  onSignOut: () => void;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ 
  isDarkMode, 
  onClose, 
  workspaces, 
  selectedWorkspace, 
  onAddWorkspace,
  onUpdateWorkspace, 
  onDeleteWorkspace, 
  onSelectWorkspace,
  onSettingsClick,
  onSignOut
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    color: '#3B82F6',
    imageUrl: ''
  });

  const createWorkspace = () => {
    if (newWorkspace.name) {
      onAddWorkspace(newWorkspace);
      setNewWorkspace({ name: '', color: '#3B82F6', imageUrl: '' });
      setIsCreating(false);
    }
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setNewWorkspace({
      name: workspace.name,
      color: workspace.color,
      imageUrl: workspace.imageUrl
    });
  };

  const saveEditedWorkspace = () => {
    if (editingWorkspace && newWorkspace.name) {
      onUpdateWorkspace(editingWorkspace.id, newWorkspace);
      setEditingWorkspace(null);
      setNewWorkspace({ name: '', color: '#3B82F6', imageUrl: '' });
    }
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
  ];

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-xl bg-black/50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-4xl max-h-[85vh] backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} border border-white/20 shadow-xl overflow-hidden`}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Manage Workspaces</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Workspaces
              </h3>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Workspace
              </Button>
            </div>

            {(isCreating || editingWorkspace) && (
              <Card className={`p-6 mb-6 ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'} border-white/30`}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingWorkspace ? 'Edit Workspace' : 'Create New Workspace'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className={isDarkMode ? 'text-white' : 'text-gray-700'}>Workspace Name</Label>
                    <Input
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
                      placeholder="e.g., Marketing Team"
                      className={`${isDarkMode ? 'bg-gray-600/50 text-white' : 'bg-white/50 text-gray-800'} border-white/30`}
                    />
                  </div>

                  <div>
                    <Label className={isDarkMode ? 'text-white' : 'text-gray-700'}>Color Theme</Label>
                    <div className="flex gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewWorkspace({...newWorkspace, color})}
                          className={`w-8 h-8 rounded-full transition-all ${
                            newWorkspace.color === color ? 'ring-2 ring-white scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className={isDarkMode ? 'text-white' : 'text-gray-700'}>Workspace Icon URL</Label>
                    <Input
                      value={newWorkspace.imageUrl}
                      onChange={(e) => setNewWorkspace({...newWorkspace, imageUrl: e.target.value})}
                      placeholder="https://example.com/icon.png"
                      className={`mt-2 ${isDarkMode ? 'bg-gray-600/50 text-white' : 'bg-white/50 text-gray-800'} border-white/30`}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={editingWorkspace ? saveEditedWorkspace : createWorkspace} className="bg-green-500 hover:bg-green-600">
                      {editingWorkspace ? 'Save Changes' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreating(false);
                      setEditingWorkspace(null);
                      setNewWorkspace({ name: '', color: '#3B82F6', imageUrl: '' });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id} 
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedWorkspace === workspace.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50/10' 
                      : isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
                  } border-white/30`}
                  onClick={() => onSelectWorkspace(workspace.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: workspace.color }}
                      >
                        {workspace.imageUrl ? (
                          <img src={workspace.imageUrl} alt={workspace.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          workspace.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{workspace.name}</h4>
                        {selectedWorkspace === workspace.id && (
                          <p className="text-sm text-blue-500">Active</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkspace(workspace);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkspace(workspace.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default WorkspaceManager;
