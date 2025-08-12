
import React, { useState } from 'react';
import { ResizableDraggablePanel } from '@/components/ResizableDraggablePanel';
import TaskDescription from '@/components/TaskDescription';
import WorkspaceManager from '@/components/accounts/WorkspaceManager';
import { FileText } from 'lucide-react';

interface OverlayDescriptionPanelProps {
  selectedTask?: any;
  selectedCategory?: any;
  isDarkMode: boolean;
  isVisible: boolean;
  onClose: () => void;
  onDescriptionUpdate: (description: string, attachments?: Array<{url: string, text: string, type: 'link' | 'file', color: string}>, comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>) => void;
  onSettingsClick: () => void;
  onWorkspaceClick: () => void;
  onSignOut: () => void;
}

export const OverlayDescriptionPanel: React.FC<OverlayDescriptionPanelProps> = ({
  selectedTask,
  selectedCategory,
  isDarkMode,
  isVisible,
  onClose,
  onDescriptionUpdate,
  onSettingsClick,
  onWorkspaceClick,
  onSignOut
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);

  if (!isVisible) {
    return null;
  }

  // Check if we have either a task or category with description
  const hasTaskDescription = selectedTask && selectedTask.description && selectedTask.description !== 'Click to add description...';
  const hasCategoryDescription = selectedCategory && selectedCategory.description;
  
  if (!hasTaskDescription && !hasCategoryDescription) {
    return null;
  }

  // Convert category to task-like format for TaskDescription component
  const displayItem = selectedCategory ? {
    ...selectedCategory,
    description: selectedCategory.description,
    title: selectedCategory.title,
    name: selectedCategory.title
  } : selectedTask;

  return (
    <ResizableDraggablePanel
      title="Task Details"
      icon={FileText}
      initialPosition={{ 
        x: typeof window !== 'undefined' ? Math.max(8, window.innerWidth - (window.innerWidth < 768 ? window.innerWidth - 16 : 420)) : 100, 
        y: typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 100 
      }}
      initialSize={{ 
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(window.innerWidth - 16, 350) : 400, 
        height: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(window.innerHeight - 120, 500) : 600 
      }}
      minSize={{ 
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 300, 
        height: typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 400 
      }}
    >
      <div className="h-full text-sm md:text-base">
        <TaskDescription
          selectedTask={displayItem}
          isDarkMode={isDarkMode}
          clickCount={0}
          onHeaderClick={onClose}
          onDescriptionUpdate={onDescriptionUpdate}
          onSettingsClick={() => setShowSettings(true)}
          onWorkspaceClick={() => setShowWorkspaceManager(true)}
          onSignOut={onSignOut}
          showCloseButton={false}
        />
      </div>


      {showWorkspaceManager && (
        <WorkspaceManager
          isDarkMode={isDarkMode}
          onClose={() => setShowWorkspaceManager(false)}
          workspaces={[]}
          selectedWorkspace={null}
          onAddWorkspace={() => {}}
          onUpdateWorkspace={() => {}}
          onDeleteWorkspace={() => {}}
          onSelectWorkspace={() => {}}
          onSettingsClick={onSettingsClick}
          onSignOut={onSignOut}
        />
      )}
    </ResizableDraggablePanel>
  );
};
