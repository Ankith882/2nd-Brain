import React from 'react';
import WorkspaceManager from '@/components/accounts/WorkspaceManager';
import { EditMissionForm } from '@/components/mission/EditMissionForm';
import { AddHabitForm } from '@/components/habit/AddHabitForm';
import { AddNotesFolderForm } from '@/components/quicknotes/AddNotesFolderForm';
import { SearchModal } from '@/components/search/SearchModal';

interface ModalManagerProps {
  isDarkMode: boolean;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showWorkspaceManager: boolean;
  setShowWorkspaceManager: (show: boolean) => void;
  showAddMission: boolean;
  setShowAddMission: (show: boolean) => void;
  showAddHabit: boolean;
  setShowAddHabit: (show: boolean) => void;
  editingHabit: any;
  setEditingHabit: (habit: any) => void;
  showAddNotesFolder: boolean;
  setShowAddNotesFolder: (show: boolean) => void;
  selectedWorkspace: string | null;
  workspaces: any[];
  addWorkspace: (workspace: any) => void;
  updateWorkspace: (id: string, updates: any) => void;
  deleteWorkspace: (id: string) => void;
  selectWorkspace: (id: string) => void;
  addMission: (mission: any) => void;
  addHabit: (habit: any) => void;
  updateHabit: (id: string, updates: any) => void;
  addFolder: (folder: any) => void;
  searchHook: any;
  searchNavigation: any;
  onSettingsClick: () => void;
  onSignOut: () => void;
}

const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-black/30 flex items-center justify-center p-4">
    {children}
  </div>
);

const ModalContainer: React.FC<{ isDarkMode: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({ 
  isDarkMode, 
  title, 
  onClose, 
  children 
}) => (
  <div className={`w-full max-w-2xl max-h-[90vh] backdrop-blur-2xl ${
    isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/20' : 'bg-white/20 border-white/30 shadow-2xl shadow-black/10'
  } overflow-hidden rounded-xl`}>
    <div className="p-6 border-b border-white/20">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const ModalManager: React.FC<ModalManagerProps> = ({
  isDarkMode,
  showSettings,
  setShowSettings,
  showWorkspaceManager,
  setShowWorkspaceManager,
  showAddMission,
  setShowAddMission,
  showAddHabit,
  setShowAddHabit,
  editingHabit,
  setEditingHabit,
  showAddNotesFolder,
  setShowAddNotesFolder,
  selectedWorkspace,
  workspaces,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  selectWorkspace,
  addMission,
  addHabit,
  updateHabit,
  addFolder,
  searchHook,
  searchNavigation,
  onSettingsClick,
  onSignOut
}) => {
  return (
    <>

      {showWorkspaceManager && (
        <WorkspaceManager 
          isDarkMode={isDarkMode} 
          onClose={() => setShowWorkspaceManager(false)} 
          workspaces={workspaces} 
          selectedWorkspace={selectedWorkspace} 
          onAddWorkspace={addWorkspace} 
          onUpdateWorkspace={updateWorkspace} 
          onDeleteWorkspace={deleteWorkspace} 
          onSelectWorkspace={selectWorkspace}
          onSettingsClick={onSettingsClick}
          onSignOut={onSignOut}
        />
      )}

      {showAddMission && selectedWorkspace && (
        <ModalOverlay onClose={() => setShowAddMission(false)}>
          <ModalContainer 
            isDarkMode={isDarkMode} 
            title="Add Mission" 
            onClose={() => setShowAddMission(false)}
          >
            <EditMissionForm 
              mission={{
                id: '',
                name: '',
                color: '#3B82F6',
                iconUrl: '',
                template: 'task' as const,
                workspaceId: selectedWorkspace,
                taskCount: 0,
                createdAt: new Date(),
                subMissions: [],
                isExpanded: true,
                order: 0
              }} 
              isDarkMode={isDarkMode} 
              onSave={(updates) => {
                if (updates.name?.trim()) {
                  addMission({
                    name: updates.name,
                    color: updates.color || '#3B82F6',
                    iconUrl: updates.iconUrl || '',
                    template: updates.template || 'task',
                    workspaceId: selectedWorkspace
                  });
                }
                setShowAddMission(false);
              }} 
              onCancel={() => setShowAddMission(false)} 
            />
          </ModalContainer>
        </ModalOverlay>
      )}

      {showAddHabit && selectedWorkspace && (
        <ModalOverlay onClose={() => setShowAddHabit(false)}>
          <ModalContainer 
            isDarkMode={isDarkMode} 
            title="Add Habit" 
            onClose={() => setShowAddHabit(false)}
          >
            <AddHabitForm 
              isDarkMode={isDarkMode} 
              onSave={(habitData) => {
                addHabit({
                  ...habitData,
                  workspaceId: selectedWorkspace
                });
                setShowAddHabit(false);
              }} 
              onCancel={() => setShowAddHabit(false)} 
            />
          </ModalContainer>
        </ModalOverlay>
      )}

      {editingHabit && (
        <ModalOverlay onClose={() => setEditingHabit(null)}>
          <ModalContainer 
            isDarkMode={isDarkMode} 
            title="Edit Habit" 
            onClose={() => setEditingHabit(null)}
          >
            <AddHabitForm 
              isDarkMode={isDarkMode} 
              initialData={{
                name: editingHabit.name,
                color: editingHabit.color,
                iconUrl: editingHabit.iconUrl,
                startDate: editingHabit.startDate
              }} 
              onSave={(habitData) => {
                updateHabit(editingHabit.id, habitData);
                setEditingHabit(null);
              }} 
              onCancel={() => setEditingHabit(null)} 
            />
          </ModalContainer>
        </ModalOverlay>
      )}

      {showAddNotesFolder && selectedWorkspace && (
        <ModalOverlay onClose={() => setShowAddNotesFolder(false)}>
          <ModalContainer 
            isDarkMode={isDarkMode} 
            title="Add Notes Folder" 
            onClose={() => setShowAddNotesFolder(false)}
          >
            <AddNotesFolderForm 
              isDarkMode={isDarkMode} 
              workspaceId={selectedWorkspace} 
              onSave={(folderData) => {
                if (folderData.name && folderData.color) {
                  addFolder({
                    name: folderData.name,
                    color: folderData.color,
                    iconUrl: folderData.iconUrl || '',
                    workspaceId: selectedWorkspace
                  });
                }
                setShowAddNotesFolder(false);
              }} 
              onCancel={() => setShowAddNotesFolder(false)} 
            />
          </ModalContainer>
        </ModalOverlay>
      )}

      <SearchModal 
        searchHook={searchHook} 
        onNavigateToResult={searchNavigation.navigateToResult} 
      />
    </>
  );
};