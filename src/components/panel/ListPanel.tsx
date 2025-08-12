import React from 'react';
import { Task } from '@/types/task';
import { QuickNotesFolderList } from '@/components/quicknotes/QuickNotesFolderList';
import { HabitList } from '@/components/habit/HabitList';
import { MissionList } from '@/components/panel/MissionList';

interface ListPanelProps {
  isDarkMode: boolean;
  showMissions: boolean;
  showHabitTracker: boolean;
  showQuickNotes: boolean;
  
  // Notes related
  currentWorkspaceFolders: any[];
  selectedFolder: any;
  selectedWorkspace: string;
  setShowAddNotesFolder: (show: boolean) => void;
  updateFolder: (id: string, updates: any) => void;
  deleteFolder: (id: string) => void;
  handleFolderToggle: (folder: any) => void;
  
  // Habits related
  habitView: 'active' | 'completed';
  currentActiveHabits: any[];
  currentCompletedHabits: any[];
  selectedHabit: any;
  highlightedHabitId?: string;
  setHabitView: (view: 'active' | 'completed') => void;
  handleHabitToggle: (habit: any) => void;
  setShowAddHabit: (show: boolean) => void;
  setEditingHabit: (habit: any) => void;
  deleteHabit: (id: string) => void;
  markHabitCompleted: (id: string) => void;
  markHabitIncomplete: (id: string) => void;
  
  // Missions related
  currentWorkspaceMissions: any[];
  selectedMission: any;
  tasks: Task[];
  selectedDate: Date;
  highlightedMissionId?: string;
  handleMissionToggle: (mission: any) => void;
  setShowAddMission: (show: boolean) => void;
  addSubMission: (parentId: string, missionData: any) => void;
  updateMission: (id: string, updates: any) => void;
  deleteMission: (id: string) => void;
  toggleMissionExpanded: (id: string) => void;
}

export const ListPanel: React.FC<ListPanelProps> = ({
  isDarkMode,
  showMissions,
  showHabitTracker,
  showQuickNotes,
  currentWorkspaceFolders,
  selectedFolder,
  selectedWorkspace,
  setShowAddNotesFolder,
  updateFolder,
  deleteFolder,
  handleFolderToggle,
  habitView,
  currentActiveHabits,
  currentCompletedHabits,
  selectedHabit,
  highlightedHabitId,
  setHabitView,
  handleHabitToggle,
  setShowAddHabit,
  setEditingHabit,
  deleteHabit,
  markHabitCompleted,
  markHabitIncomplete,
  currentWorkspaceMissions,
  selectedMission,
  tasks,
  selectedDate,
  highlightedMissionId,
  handleMissionToggle,
  setShowAddMission,
  addSubMission,
  updateMission,
  deleteMission,
  toggleMissionExpanded
}) => {
  if (showQuickNotes) {
    return (
      <QuickNotesFolderList 
        folders={currentWorkspaceFolders} 
        selectedFolder={selectedFolder} 
        isDarkMode={isDarkMode} 
        workspaceId={selectedWorkspace || ''} 
        onFolderSelect={handleFolderToggle} 
        onAddFolder={() => setShowAddNotesFolder(true)} 
        onUpdateFolder={updateFolder} 
        onDeleteFolder={(id) => { 
          deleteFolder(id); 
          if (selectedFolder?.id === id) handleFolderToggle(null); 
        }} 
      />
    );
  }

  if (showHabitTracker) {
    return (
      <HabitList 
        habits={habitView === 'active' ? currentActiveHabits : currentCompletedHabits} 
        selectedHabit={selectedHabit} 
        isDarkMode={isDarkMode} 
        showCompleted={habitView === 'completed'} 
        highlightedHabitId={highlightedHabitId} 
        onToggleView={showCompleted => setHabitView(showCompleted ? 'completed' : 'active')} 
        onHabitSelect={handleHabitToggle} 
        onAddHabit={() => setShowAddHabit(true)} 
        onEditHabit={setEditingHabit} 
        onDeleteHabit={(id) => { 
          deleteHabit(id); 
          if (selectedHabit?.id === id) handleHabitToggle(null); 
        }} 
        onMarkCompleted={markHabitCompleted} 
        onMarkIncomplete={markHabitIncomplete} 
      />
    );
  }

  if (showMissions) {
    return (
      <MissionList 
        missions={currentWorkspaceMissions} 
        selectedMission={selectedMission} 
        isDarkMode={isDarkMode} 
        tasks={tasks} 
        selectedDate={selectedDate} 
        highlightedMissionId={highlightedMissionId} 
        onMissionSelect={handleMissionToggle} 
        onAddMission={() => setShowAddMission(true)} 
        onAddSubMission={addSubMission} 
        onUpdateMission={updateMission} 
        onDeleteMission={(id) => { 
          deleteMission(id); 
          if (selectedMission?.id === id) handleMissionToggle(null); 
        }} 
        onToggleExpanded={toggleMissionExpanded} 
      />
    );
  }

  return null;
};