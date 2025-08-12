import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkspaceSelector } from '../accounts/WorkspaceSelector';
import { ListPanel } from '@/components/panel/ListPanel';
import { X, ArrowLeft, Plus } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

interface MobileSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  selectedWorkspace: Workspace | null;
  onMissionsClick: () => void;
  showMissions: boolean;
  onWorkspaceManagerClick: () => void;
  onHabitTrackerClick: () => void;
  showHabitTracker: boolean;
  onQuickNotesClick: () => void;
  showQuickNotes: boolean;
  onSearchClick: () => void;
  listPanelProps?: any;
}

export const MobileSlideMenu: React.FC<MobileSlideMenuProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  selectedWorkspace,
  onMissionsClick,
  showMissions,
  onWorkspaceManagerClick,
  onHabitTrackerClick,
  showHabitTracker,
  onQuickNotesClick,
  showQuickNotes,
  onSearchClick,
  listPanelProps,
}) => {
  const [activeView, setActiveView] = useState<'menu' | 'missions' | 'habits' | 'notes'>('menu');

  const handleItemClick = (view: 'menu' | 'missions' | 'habits' | 'notes', action?: () => void) => {
    if (view === 'menu') {
      action?.();
      onClose();
    } else {
      setActiveView(view);
      action?.();
    }
  };

  const handleBackToMenu = () => {
    setActiveView('menu');
  };

  const handleClose = () => {
    setActiveView('menu');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide Menu */}
      <div className={`
        fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 
        bg-background/95 backdrop-blur-lg border-r border-border/50
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 pt-safe-area-inset-top border-b border-border/50">
          {activeView !== 'menu' && (
            <Button
              onClick={handleBackToMenu}
              variant="ghost"
              size="sm"
              className="h-touch w-touch rounded-xl mr-2"
              aria-label="Back to menu"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold flex-1">
            {activeView === 'menu' && 'Menu'}
            {activeView === 'missions' && 'Missions'}
            {activeView === 'habits' && 'Habit Tracker'}
            {activeView === 'notes' && 'Quick Notes'}
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-touch w-touch rounded-xl"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {activeView === 'menu' && (
            <div className="flex flex-col p-4 space-y-2">
              {/* Workspace Section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">Workspace</h3>
                {selectedWorkspace ? (
                  <Button
                    onClick={() => handleItemClick('menu', onWorkspaceManagerClick)}
                    variant="ghost"
                    className="w-full h-touch justify-start rounded-xl px-4 py-3"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-200 mr-4 flex-shrink-0"
                      style={{ backgroundColor: selectedWorkspace.color }}
                    >
                      {selectedWorkspace.imageUrl ? (
                        <img 
                          src={selectedWorkspace.imageUrl} 
                          alt={selectedWorkspace.name} 
                          className="w-full h-full rounded-xl object-cover" 
                        />
                      ) : (
                        selectedWorkspace.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-left font-medium truncate">{selectedWorkspace.name}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleItemClick('menu', onWorkspaceManagerClick)}
                    variant="ghost"
                    className="w-full h-touch justify-start rounded-xl px-3 py-2"
                  >
                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Create Workspace
                  </Button>
                )}
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <Button
                  onClick={() => handleItemClick('missions', onMissionsClick)}
                  variant={showMissions ? "secondary" : "ghost"}
                  className="w-full h-touch justify-start rounded-xl px-3 py-2"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 100 100" fill="none">
                    {showMissions ? (
                      <>
                        <path d="M50 10C35 20 25 35 25 50C25 70 40 85 50 85C60 85 75 70 75 50C75 35 65 20 50 10Z M65 45C70 50 70 60 65 65C60 70 50 70 45 65C50 60 55 55 60 50C62 47 64 46 65 45Z" fill="#3B82F6"/>
                        <path d="M50 25C40 32 35 42 35 52C35 65 42 75 50 75C58 75 65 65 65 52C65 42 60 32 50 25Z" fill="#60A5FA"/>
                        <path d="M50 35C45 40 42 46 42 52C42 60 46 66 50 66C54 66 58 60 58 52C58 46 55 40 50 35Z" fill="#93C5FD"/>
                      </>
                    ) : (
                      <>
                        <path d="M50 10C35 20 25 35 25 50C25 70 40 85 50 85C60 85 75 70 75 50C75 35 65 20 50 10Z M65 45C70 50 70 60 65 65C60 70 50 70 45 65C50 60 55 55 60 50C62 47 64 46 65 45Z" fill="#EF4444"/>
                        <path d="M50 25C40 32 35 42 35 52C35 65 42 75 50 75C58 75 65 65 65 52C65 42 60 32 50 25Z" fill="#F97316"/>
                        <path d="M50 35C45 40 42 46 42 52C42 60 46 66 50 66C54 66 58 60 58 52C58 46 55 40 50 35Z" fill="#FCD34D"/>
                      </>
                    )}
                  </svg>
                  Missions
                </Button>

                <Button
                  onClick={() => handleItemClick('habits', onHabitTrackerClick)}
                  variant={showHabitTracker ? "secondary" : "ghost"}
                  className="w-full h-touch justify-start rounded-xl px-3 py-2"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="#1e40af" strokeWidth="2"/>
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
                    <circle cx="12" cy="12" r="5" fill="none" stroke="#1e40af" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="2" fill="#1e40af"/>
                  </svg>
                  Habit Tracker
                </Button>

                <Button
                  onClick={() => handleItemClick('notes', onQuickNotesClick)}
                  variant={showQuickNotes ? "secondary" : "ghost"}
                  className="w-full h-touch justify-start rounded-xl px-3 py-2"
                >
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="6" width="16" height="2" rx="1"/>
                    <rect x="4" y="11" width="16" height="2" rx="1"/>
                    <rect x="4" y="16" width="10" height="2" rx="1"/>
                  </svg>
                  Quick Notes
                </Button>

                <Button
                  onClick={() => handleItemClick('menu', onSearchClick)}
                  variant="ghost"
                  className="w-full h-touch justify-start rounded-xl px-3 py-2"
                >
                  <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  Global Search
                </Button>
              </div>
            </div>
          )}

          {/* Content Views */}
          {(activeView === 'missions' || activeView === 'habits' || activeView === 'notes') && listPanelProps && (
            <div className="flex-1 overflow-hidden">
              <ListPanel {...listPanelProps} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};