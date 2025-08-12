import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { ChevronLeft, ChevronRight, Minimize2, Maximize2, CheckSquare, Calendar, Grid3X3 } from 'lucide-react';
import { EnhancedDatePicker } from '../extra-panel/EnhancedDatePicker';
import { TemplateSelector } from '../TemplateSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
interface MissionHeaderContainerProps {
  mission: {
    id: string;
    name: string;
    iconUrl?: string;
    color?: string;
    template: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';
  };
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isDarkMode: boolean;
  onTemplateSelect: (missionId: string, template: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix') => void;
  tasksData?: any[];
  dateColors?: {
    [key: string]: string;
  };
  getTasksForDate?: (date: Date) => any[];
  onPreviousDate?: () => void;
  onNextDate?: () => void;
  onDateColorChange?: (dateKey: string, color: string) => void;
  children: React.ReactNode;
}
export const MissionHeaderContainer: React.FC<MissionHeaderContainerProps> = ({
  mission,
  selectedDate,
  onDateSelect,
  isDarkMode,
  onTemplateSelect,
  tasksData,
  dateColors,
  getTasksForDate,
  onPreviousDate,
  onNextDate,
  onDateColorChange,
  children
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateSelect(newDate);
    if (direction === 'prev' && onPreviousDate) {
      onPreviousDate();
    } else if (direction === 'next' && onNextDate) {
      onNextDate();
    }
  };
  const getMissionInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase();
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'notes':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <rect x="4" y="6" width="16" height="2" rx="1"/>
            <rect x="4" y="11" width="16" height="2" rx="1"/>
            <rect x="4" y="16" width="10" height="2" rx="1"/>
          </svg>
        );
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'kanban':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <rect x="3" y="4" width="4" height="16" rx="2" className="fill-current"/>
            <rect x="10" y="6" width="4" height="8" rx="2" className="fill-current"/>
            <rect x="17" y="4" width="4" height="16" rx="2" className="fill-current"/>
          </svg>
        );
      case 'timeline':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <rect x="4" y="6" width="8" height="2" rx="1"/>
            <rect x="4" y="10" width="12" height="2" rx="1"/>
            <rect x="4" y="14" width="6" height="2" rx="1"/>
            <rect x="4" y="18" width="10" height="2" rx="1"/>
            <circle cx="3" cy="7" r="1"/>
            <circle cx="3" cy="11" r="1"/>
            <circle cx="3" cy="15" r="1"/>
            <circle cx="3" cy="19" r="1"/>
          </svg>
        );
      case 'calendar':
        return (
          <img 
            src="/lovable-uploads/b273f989-257a-4ea6-a3e8-7654e6581de8.png" 
            alt="Calendar" 
            className="h-12 w-12 object-contain rounded-md"
          />
        );
      case 'matrix':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <rect x="4" y="4" width="7" height="7" rx="1" className="fill-green-400 opacity-60"/>
            <rect x="13" y="4" width="7" height="7" rx="1" className="fill-yellow-400 opacity-60"/>
            <rect x="4" y="13" width="7" height="7" rx="1" className="fill-gray-400 opacity-60"/>
            <rect x="13" y="13" width="7" height="7" rx="1" className="fill-red-400 opacity-60"/>
            <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1"/>
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };
  if (isMinimized) {
    return <>
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" size="sm" onClick={() => setIsMinimized(false)} className="bg-white/10 border-white/20 hover:bg-white/20">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </>;
  }
  return <>
      <ResizablePanelGroup direction="vertical" className="min-h-[80px]">
        <ResizablePanel defaultSize={15} minSize={0} maxSize={100} className="flex flex-col">
          <div className="flex items-center justify-between h-full p-2 md:p-4 border-b border-white/20">
            {/* Left Corner - Box Avatar + Mission Name */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className={`h-8 w-8 md:h-10 md:w-10 border-2 border-white/20 rounded-md flex items-center justify-center text-white font-semibold text-xs md:text-sm ${mission.iconUrl ? '' : 'bg-primary/80'}`} style={{
              backgroundColor: mission.iconUrl ? 'transparent' : mission.color || 'hsl(var(--primary))'
            }}>
                {mission.iconUrl ? <img src={mission.iconUrl} alt={mission.name} className="h-full w-full object-cover rounded-sm" /> : getMissionInitials(mission.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-base md:text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {mission.name}
                </h1>
              </div>
            </div>

            {/* Center - Date Navigation */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 mx-2 md:mx-4">
              <div className="min-w-[160px] md:min-w-[200px]">
                <EnhancedDatePicker 
                  selectedDate={selectedDate} 
                  onDateSelect={onDateSelect} 
                  isDarkMode={isDarkMode} 
                  tasksData={tasksData} 
                  dateColors={dateColors} 
                  getTasksForDate={getTasksForDate}
                  selectedTemplate={mission.template}
                  onDateColorChange={onDateColorChange}
                />
              </div>
            </div>

            {/* Right Corner - Template Selector + More Options + Minimize */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20 text-xs md:text-sm px-2 md:px-3">
                    <span className="mr-1 md:mr-2 scale-75 md:scale-100">{getTemplateIcon(mission.template)}</span>
                    <span className="hidden sm:inline">{mission.template.charAt(0).toUpperCase() + mission.template.slice(1)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-transparent border-none shadow-none" align="end">
                  <TemplateSelector 
                    isDarkMode={isDarkMode} 
                    onSelect={(template) => onTemplateSelect(mission.id, template)}
                    isInline={true}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)} className="hover:bg-white/20 p-1 md:p-2">
                <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-white/20 hover:bg-white/30 transition-colors" />
        
        <ResizablePanel defaultSize={85} minSize={0}>
          <div className="h-full overflow-hidden">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

    </>;
};