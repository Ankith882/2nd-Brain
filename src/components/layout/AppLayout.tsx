
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { LeftSidebar } from '@/components/panel/LeftSidebar';
import { ListPanel } from '@/components/panel/ListPanel';
import { DetailsPanel } from '@/components/panel/DetailsPanel';
import { MobileNavigation } from './MobileNavigation';
import { MobileHeader } from './MobileHeader';
import { MobileSlideMenu } from './MobileSlideMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  isDarkMode: boolean;
  showMissions: boolean;
  showHabitTracker: boolean;
  showQuickNotes: boolean;
  updatePanelSize: (key: string, size: number) => void;
  toggleTheme: () => void;
  togglePanel: (panel: string) => void;
  // Left sidebar props
  selectedWorkspace: any;
  onMissionsClick: () => void;
  onWorkspaceManagerClick: () => void;
  onHabitTrackerClick: () => void;
  onQuickNotesClick: () => void;
  onSearchClick: () => void;
  onThemeChange: (theme: any) => void;
  // List panel props
  listPanelProps: any;
  // Details panel props
  detailsPanelProps: any;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isDarkMode,
  showMissions,
  showHabitTracker,
  showQuickNotes,
  updatePanelSize,
  toggleTheme,
  togglePanel,
  selectedWorkspace,
  onMissionsClick,
  onWorkspaceManagerClick,
  onHabitTrackerClick,
  onQuickNotesClick,
  onSearchClick,
  onThemeChange,
  listPanelProps,
  detailsPanelProps
}) => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigationMinimized, setIsNavigationMinimized] = useState(false);
  
  const hasActivePanel = showMissions || showHabitTracker || showQuickNotes;
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile Slide Menu */}
        <MobileSlideMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isDarkMode={isDarkMode}
          selectedWorkspace={selectedWorkspace}
          onMissionsClick={onMissionsClick}
          showMissions={showMissions}
          onWorkspaceManagerClick={onWorkspaceManagerClick}
          onHabitTrackerClick={onHabitTrackerClick}
          showHabitTracker={showHabitTracker}
          onQuickNotesClick={onQuickNotesClick}
          showQuickNotes={showQuickNotes}
          onSearchClick={onSearchClick}
          listPanelProps={listPanelProps}
        />

        {/* Main Content Area */}
        <main className={`flex-1 overflow-hidden ${isNavigationMinimized ? '' : 'pb-20'}`}>
          {hasActivePanel ? (
            <div className="h-full">
              <DetailsPanel {...detailsPanelProps} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">Welcome to 2nd Brain</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Choose a section from the bottom navigation to get started with your productivity journey.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation
          isDarkMode={isDarkMode}
          selectedWorkspace={selectedWorkspace}
          onMissionsClick={onMissionsClick}
          showMissions={showMissions}
          onWorkspaceManagerClick={onWorkspaceManagerClick}
          onHabitTrackerClick={onHabitTrackerClick}
          showHabitTracker={showHabitTracker}
          onQuickNotesClick={onQuickNotesClick}
          showQuickNotes={showQuickNotes}
          onSearchClick={onSearchClick}
          onThemeToggle={toggleTheme}
          onThemeChange={onThemeChange}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isMenuOpen={isMobileMenuOpen}
          onMinimizeChange={setIsNavigationMinimized}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Sidebar - Desktop Only */}
        <ResizablePanel 
          defaultSize={10}
          onResize={size => updatePanelSize('leftSidebarSize', size)}
        >
          <LeftSidebar 
            isDarkMode={isDarkMode} 
            onThemeToggle={toggleTheme} 
            onThemeChange={onThemeChange} 
            selectedWorkspace={selectedWorkspace} 
            onMissionsClick={onMissionsClick} 
            showMissions={showMissions} 
            onWorkspaceManagerClick={onWorkspaceManagerClick} 
            onHabitTrackerClick={onHabitTrackerClick} 
            showHabitTracker={showHabitTracker} 
            onQuickNotesClick={onQuickNotesClick} 
            showQuickNotes={showQuickNotes}
            onSearchClick={onSearchClick}
          />
        </ResizablePanel>

        {/* List Panel */}
        {hasActivePanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel 
              defaultSize={25} 
              onResize={size => updatePanelSize('detailsPanelSize', size)}
            >
              <ListPanel {...listPanelProps} />
            </ResizablePanel>

            {/* Details Panel */}
            <ResizableHandle withHandle />
            <ResizablePanel 
              defaultSize={65}
            >
              <DetailsPanel {...detailsPanelProps} />
            </ResizablePanel>
          </>
        )}

        {/* Welcome Screen for Desktop when no panel is active */}
        {!hasActivePanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={90}>
              <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-lg">
                {/* Empty desktop welcome area */}
              </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
