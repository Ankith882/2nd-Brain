
import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { WorkspaceSelector } from '../accounts/WorkspaceSelector';
import { ThemeSelector } from '../ThemeSelector';
import { useNavigate } from 'react-router-dom';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

interface LeftSidebarProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onThemeChange?: (theme: any) => void;
  selectedWorkspace: Workspace | null;
  onMissionsClick: () => void;
  showMissions: boolean;
  onWorkspaceManagerClick: () => void;
  onHabitTrackerClick: () => void;
  showHabitTracker: boolean;
  onQuickNotesClick: () => void;
  showQuickNotes: boolean;
  onSearchClick: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isDarkMode,
  onThemeToggle,
  onThemeChange,
  selectedWorkspace,
  onMissionsClick,
  showMissions,
  onWorkspaceManagerClick,
  onHabitTrackerClick,
  showHabitTracker,
  onQuickNotesClick,
  showQuickNotes,
  onSearchClick,
}) => {
  const navigate = useNavigate();
  return (
    <div className="relative z-20 h-full flex flex-col items-center justify-between py-6 bg-transparent border-r border-white/20 rounded-r-3xl mx-2 my-2">
      <div className="flex flex-col items-center space-y-4">
        {selectedWorkspace ? (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={onWorkspaceManagerClick}
              className="relative group"
              title="Manage Workspaces"
            >
              <WorkspaceSelector 
                workspace={selectedWorkspace} 
                isDarkMode={isDarkMode} 
              />
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/30 transition-colors" />
            </button>
          </div>
        ) : (
          <Button
            onClick={onWorkspaceManagerClick}
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/20"
            title="Create Workspace"
          >
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          </Button>
        )}
        
        
        <Button
          onClick={onMissionsClick}
          variant="ghost"
          size="icon"
          className={`w-14 h-10 rounded-lg transition-all duration-300 hover:scale-110 ${
            showMissions 
              ? 'bg-transparent shadow-md ring-2 ring-blue-400/50' 
              : 'hover:bg-white/20'
          }`}
          title="Missions"
        >
          <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
            {showMissions ? (
              <>
                {/* Outer flame - blue when selected */}
                <path d="M50 10C35 20 25 35 25 50C25 70 40 85 50 85C60 85 75 70 75 50C75 35 65 20 50 10Z M65 45C70 50 70 60 65 65C60 70 50 70 45 65C50 60 55 55 60 50C62 47 64 46 65 45Z" fill="#3B82F6"/>
                {/* Inner flame - lighter blue gradient */}
                <path d="M50 25C40 32 35 42 35 52C35 65 42 75 50 75C58 75 65 65 65 52C65 42 60 32 50 25Z" fill="#60A5FA"/>
                <path d="M50 35C45 40 42 46 42 52C42 60 46 66 50 66C54 66 58 60 58 52C58 46 55 40 50 35Z" fill="#93C5FD"/>
              </>
            ) : (
              <>
                {/* Outer flame - red when not selected */}
                <path d="M50 10C35 20 25 35 25 50C25 70 40 85 50 85C60 85 75 70 75 50C75 35 65 20 50 10Z M65 45C70 50 70 60 65 65C60 70 50 70 45 65C50 60 55 55 60 50C62 47 64 46 65 45Z" fill="#EF4444"/>
                {/* Inner flame - orange to yellow gradient */}
                <path d="M50 25C40 32 35 42 35 52C35 65 42 75 50 75C58 75 65 65 65 52C65 42 60 32 50 25Z" fill="#F97316"/>
                <path d="M50 35C45 40 42 46 42 52C42 60 46 66 50 66C54 66 58 60 58 52C58 46 55 40 50 35Z" fill="#FCD34D"/>
              </>
            )}
          </svg>
        </Button>
        
        <Button
          onClick={onHabitTrackerClick}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 ${
            showHabitTracker 
              ? 'bg-transparent shadow-md ring-2 ring-cyan-mist/50' 
              : 'hover:bg-white/20'
          }`}
          title="Habit Tracker"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            {/* Outer ring - full circle */}
            <circle cx="12" cy="12" r="8" fill="none" stroke="#1e40af" strokeWidth="2"/>
            {/* Progress arc */}
            <circle 
              cx="12" 
              cy="12" 
              r="8" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5"
              strokeDasharray="20 31.4"
              strokeDashoffset="5"
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
            {/* Middle ring */}
            <circle cx="12" cy="12" r="5" fill="none" stroke="#1e40af" strokeWidth="1.5"/>
            {/* Central dot */}
            <circle cx="12" cy="12" r="2" fill="#1e40af"/>
          </svg>
        </Button>
        
        <Button
          onClick={onQuickNotesClick}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 ${
            showQuickNotes 
              ? 'bg-transparent shadow-md ring-2 ring-amber-400/50' 
              : 'hover:bg-white/20'
          }`}
          title="Quick Notes"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="6" width="16" height="2" rx="1"/>
            <rect x="4" y="11" width="16" height="2" rx="1"/>
            <rect x="4" y="16" width="10" height="2" rx="1"/>
          </svg>
        </Button>
        
        <Button
          onClick={() => {
            console.log('Search button clicked');
            onSearchClick();
          }}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/20"
          title="Global Search"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <ThemeSelector 
          isDarkMode={isDarkMode}
          onThemeToggle={onThemeToggle}
          onThemeChange={onThemeChange}
        />
      </div>
    </div>
  );
};
