import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Minimize2, Maximize2 } from 'lucide-react';
import { WorkspaceSelector } from '../accounts/WorkspaceSelector';
import { ThemeSelector } from '../ThemeSelector';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

interface MobileNavigationProps {
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
  onThemeToggle: () => void;
  onThemeChange?: (theme: any) => void;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  onMinimizeChange: (isMinimized: boolean) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
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
  onThemeToggle,
  onThemeChange,
  onMenuClick,
  isMenuOpen,
  onMinimizeChange,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Notify parent component when minimize state changes
  useEffect(() => {
    onMinimizeChange(isMinimized);
  }, [isMinimized, onMinimizeChange]);

  return (
    <>
      {/* Minimized state - only show maximize button */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <Button
            onClick={() => setIsMinimized(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Maximize navigation"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Full footer navigation - only show when not minimized */}
      {!isMinimized && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 md:hidden transition-all duration-300">
          {/* Safe area padding for devices with home indicator */}
          <div className="px-4 py-2 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-between">
              {/* Hamburger Menu Button - Left */}
              {!isMenuOpen && (
                <Button
                  onClick={onMenuClick}
                  variant="ghost"
                  size="sm"
                  className="h-touch w-touch rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {/* Workspace Button - Center */}
              <Button
                onClick={onWorkspaceManagerClick}
                variant="ghost"
                size="sm"
                className="h-touch w-touch rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                title="Workspaces"
              >
                <div className="flex flex-col items-center space-y-1">
                  {selectedWorkspace ? (
                    <WorkspaceSelector 
                      workspace={selectedWorkspace} 
                      isDarkMode={isDarkMode} 
                    />
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  )}
                  <span className="text-xs font-medium">
                    {selectedWorkspace ? selectedWorkspace.name.slice(0, 6) : 'Workspace'}
                  </span>
                </div>
              </Button>

              {/* Theme Selector and Minimize Button - Right */}
              <div className="flex items-center gap-2">
                <div className="h-touch w-touch flex items-center justify-center">
                  <ThemeSelector 
                    isDarkMode={isDarkMode}
                    onThemeToggle={onThemeToggle}
                    onThemeChange={onThemeChange}
                  />
                </div>
                <Button
                  onClick={() => setIsMinimized(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Minimize navigation"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
