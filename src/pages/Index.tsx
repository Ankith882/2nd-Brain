import React, { useEffect } from 'react';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import { useWorkspaceManager } from '@/hooks/useWorkspaceManager';
import { useMissionManager } from '@/hooks/useMissionManager';
import { useUnifiedTaskManager } from '@/hooks/useUnifiedTaskManager';
import { useHabitManager } from '@/hooks/useHabitManager';
import { useQuickNotesManager } from '@/hooks/useQuickNotesManager';
import { useAppState } from '@/hooks/useAppState';
import { useSearchManager } from '@/hooks/useSearchManager';
import { useWorkspaceHandlers } from '@/hooks/useWorkspaceHandlers';
import { AppLayout } from '@/components/layout/AppLayout';
import { BackgroundLayer } from '@/components/layout/BackgroundLayer';
import { ModalManager } from '@/components/panel/ModalManager';
import { OverlayDescriptionPanel } from '@/components/OverlayDescriptionPanel';

const Index = () => {
  const {
    isDarkMode,
    currentTheme,
    showSettings,
    showWorkspaceManager,
    showMissions,
    showAddMission,
    showHabitTracker,
    showAddHabit,
    editingHabit,
    selectedHabit,
    habitView,
    showQuickNotes,
    showAddNotesFolder,
    descriptionPanelItem,
    descriptionPanelType,
    highlightedMissionId,
    highlightedHabitId,
    highlightedNoteId,
    updateState,
    toggleTheme,
    resetSelectedItems,
    togglePanel
  } = useAppState();

  const { updatePanelSize } = useLayoutManager();
  
  const {
    workspaces,
    selectedWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    getSelectedWorkspace
  } = useWorkspaceManager();

  const {
    missions,
    selectedMission,
    setSelectedMission,
    addMission,
    addSubMission,
    updateMission,
    toggleMissionExpanded,
    getMissionsByWorkspace,
    deleteMission,
    deleteMissionsByWorkspaceId
  } = useMissionManager();

  const taskState = useUnifiedTaskManager();
  const { tasks, selectedDate, deleteTasksByMissionIds } = taskState;

  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    deleteHabitsByWorkspaceId,
    markHabitCompleted,
    markHabitIncomplete,
    updateHabitDay,
    addHabitNote,
    getActiveHabitsByWorkspace,
    getCompletedHabitsByWorkspace,
    getHabitDayStatus,
    getMonthStats
  } = useHabitManager();

  const {
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
  } = useQuickNotesManager();

  // Computed values
  const currentWorkspaceMissions = selectedWorkspace ? getMissionsByWorkspace(selectedWorkspace) : [];
  const currentActiveHabits = selectedWorkspace ? getActiveHabitsByWorkspace(selectedWorkspace) : [];
  const currentCompletedHabits = selectedWorkspace ? getCompletedHabitsByWorkspace(selectedWorkspace) : [];
  const currentWorkspaceFolders = selectedWorkspace ? getFoldersByWorkspace(selectedWorkspace) : [];
  const currentFolderNotes = selectedFolder ? getNotesByFolder(selectedFolder.id) : [];

  // Get all workspace notes for search
  const allWorkspaceNotes = selectedWorkspace 
    ? (currentWorkspaceFolders.length > 0 
        ? notes.filter(note => currentWorkspaceFolders.some(folder => folder.id === note.folderId))
        : notes)
    : [];

  // Initialize search
  const { searchHook, searchNavigation } = useSearchManager({
    tasks,
    missions,
    habits,
    notes: allWorkspaceNotes,
    folders,
    workspaces,
    selectedWorkspace,
    onNavigateToMissions: () => {
      updateState({
        showMissions: true,
        showHabitTracker: false,
        showQuickNotes: false
      });
    },
    onNavigateToHabits: (view) => {
      updateState({
        showHabitTracker: true,
        showMissions: false,
        showQuickNotes: false,
        habitView: view
      });
    },
    onNavigateToNotes: () => {
      updateState({
        showQuickNotes: true,
        showMissions: false,
        showHabitTracker: false
      });
    },
    onSelectMission: setSelectedMission,
    onSelectHabit: (habit) => updateState({ selectedHabit: habit }),
    onSelectFolder: setSelectedFolder,
    onHighlightMission: (id) => updateState({ highlightedMissionId: id }),
    onHighlightHabit: (id) => updateState({ highlightedHabitId: id }),
    onHighlightNote: (id) => updateState({ highlightedNoteId: id }),
    onSelectTask: taskState.actions.setSelectedTask,
    onSelectDate: taskState.actions.setSelectedDate,
    onExpandParentTasks: taskState.actions.expandParentTasks,
    onSelectWorkspace: selectWorkspace
  });

  // Event handlers
  const {
    handleMissionToggle,
    handleHabitToggle,
    handleFolderToggle,
    handleDescriptionToggle,
    handleDeleteMission,
    handleDeleteWorkspace,
    handleThemeChange
  } = useWorkspaceHandlers({
    selectedWorkspace,
    selectedMission,
    selectedHabit,
    selectedFolder,
    descriptionPanelItem,
    descriptionPanelType,
    setSelectedMission,
    setSelectedFolder,
    updateState,
    deleteMission,
    deleteMissionsByWorkspaceId,
    deleteTasksByMissionIds,
    deleteHabitsByWorkspaceId,
    deleteFoldersByWorkspaceId,
    deleteWorkspace
  });

  // Effects
  useEffect(() => {
    document.title = '2nd Brain';
  }, []);

  // Clear selectedHabit when its completion status changes
  useEffect(() => {
    if (selectedHabit) {
      const updatedHabit = habits.find(h => h.id === selectedHabit.id);
      if (updatedHabit && updatedHabit.isCompleted !== selectedHabit.isCompleted) {
        updateState({ selectedHabit: null });
      }
    }
  }, [habits, selectedHabit, updateState]);

  // Reset selected items when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      setSelectedMission(null);
      setSelectedFolder(null);
      resetSelectedItems();
    }
  }, [selectedWorkspace, setSelectedMission, setSelectedFolder, resetSelectedItems]);

  const listPanelProps = {
    isDarkMode,
    showMissions,
    showHabitTracker,
    showQuickNotes,
    currentWorkspaceFolders,
    selectedFolder,
    selectedWorkspace: selectedWorkspace || '',
    setShowAddNotesFolder: (show: boolean) => {
      if (!selectedWorkspace) {
        console.warn('Cannot create notes folder without selecting a workspace');
        return;
      }
      updateState({ showAddNotesFolder: show });
    },
    updateFolder,
    deleteFolder,
    handleFolderToggle,
    habitView,
    currentActiveHabits,
    currentCompletedHabits,
    selectedHabit,
    highlightedHabitId,
    setHabitView: (view: any) => updateState({ habitView: view }),
    handleHabitToggle,
    setShowAddHabit: (show: boolean) => {
      if (!selectedWorkspace) {
        console.warn('Cannot create habit without selecting a workspace');
        return;
      }
      updateState({ showAddHabit: show });
    },
    setEditingHabit: (habit: any) => updateState({ editingHabit: habit }),
    deleteHabit,
    markHabitCompleted,
    markHabitIncomplete,
    currentWorkspaceMissions,
    selectedMission,
    tasks,
    selectedDate,
    highlightedMissionId,
    handleMissionToggle,
    setShowAddMission: (show: boolean) => {
      if (!selectedWorkspace) {
        console.warn('Cannot create mission without selecting a workspace');
        return;
      }
      updateState({ showAddMission: show });
    },
    addSubMission,
    updateMission,
    deleteMission: handleDeleteMission,
    toggleMissionExpanded
  };

  const detailsPanelProps = {
    isDarkMode,
    showMissions,
    showHabitTracker,
    showQuickNotes,
    selectedMission,
    selectedHabit,
    selectedFolder,
    taskState,
    updateMission,
    currentFolderNotes,
    highlightedNoteId,
    addNote,
    updateNote,
    deleteNote,
    updateHabitDay,
    addHabitNote,
    markHabitCompleted,
    markHabitIncomplete,
    getHabitDayStatus,
    getMonthStats
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundLayer isDarkMode={isDarkMode} currentTheme={currentTheme} />
      
      <div className="relative z-10">
        <AppLayout
          isDarkMode={isDarkMode}
          showMissions={showMissions}
          showHabitTracker={showHabitTracker}
          showQuickNotes={showQuickNotes}
          updatePanelSize={updatePanelSize}
          toggleTheme={toggleTheme}
          togglePanel={togglePanel}
          selectedWorkspace={getSelectedWorkspace()}
          onMissionsClick={() => {
            togglePanel('missions');
            setSelectedMission(null);
          }}
          onWorkspaceManagerClick={() => updateState({ showWorkspaceManager: true })}
          onHabitTrackerClick={() => {
            togglePanel('habits');
            updateState({ selectedHabit: null });
          }}
          onQuickNotesClick={() => {
            togglePanel('notes');
            setSelectedFolder(null);
          }}
          onSearchClick={searchHook.openSearch}
          onThemeChange={handleThemeChange}
          listPanelProps={listPanelProps}
          detailsPanelProps={detailsPanelProps}
        />

        {/* Modal Manager */}
        <ModalManager
          isDarkMode={isDarkMode}
          showSettings={showSettings}
          setShowSettings={(show) => updateState({ showSettings: show })}
          showWorkspaceManager={showWorkspaceManager}
          setShowWorkspaceManager={(show) => updateState({ showWorkspaceManager: show })}
          showAddMission={showAddMission}
          setShowAddMission={(show) => updateState({ showAddMission: show })}
          showAddHabit={showAddHabit}
          setShowAddHabit={(show) => updateState({ showAddHabit: show })}
          editingHabit={editingHabit}
          setEditingHabit={(habit) => updateState({ editingHabit: habit })}
          showAddNotesFolder={showAddNotesFolder}
          setShowAddNotesFolder={(show) => updateState({ showAddNotesFolder: show })}
          selectedWorkspace={selectedWorkspace}
          workspaces={workspaces}
          addWorkspace={addWorkspace}
          updateWorkspace={updateWorkspace}
          deleteWorkspace={(id) => deleteWorkspace(id, handleDeleteWorkspace)}
          selectWorkspace={selectWorkspace}
          addMission={addMission}
          addHabit={addHabit}
          updateHabit={updateHabit}
          addFolder={addFolder}
          searchHook={searchHook}
          searchNavigation={searchNavigation}
          onSettingsClick={() => updateState({ showSettings: true })}
          onSignOut={() => console.log('Sign out clicked')}
        />

        {/* Overlay Description Panel */}
        {descriptionPanelItem && (
          <OverlayDescriptionPanel
            selectedTask={descriptionPanelType === 'task' ? descriptionPanelItem : undefined}
            selectedCategory={descriptionPanelType === 'category' ? descriptionPanelItem : undefined}
            isDarkMode={isDarkMode}
            isVisible={true}
            onClose={() => updateState({
              descriptionPanelItem: null,
              descriptionPanelType: ''
            })}
            onDescriptionUpdate={(description, attachments, comments) => {
              if (descriptionPanelType === 'task') {
                const updateData: any = { description };
                if (attachments?.length) {
                  updateData.attachments = attachments.map(att => ({
                    ...att,
                    id: Date.now().toString() + Math.random()
                  }));
                }
                if (comments) {
                  updateData.comments = comments;
                }
                taskState.actions.updateTask(descriptionPanelItem.id, updateData);
              }
            }}
            onSettingsClick={() => updateState({ showSettings: true })}
            onWorkspaceClick={() => updateState({ showWorkspaceManager: true })}
            onSignOut={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
