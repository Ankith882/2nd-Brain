import React from 'react';
import { StickyNote, CheckCircle, Pause, Minimize } from 'lucide-react';
import { Button } from '@/components/ui';

interface FloatingPanelHeaderProps {
  isNotesMode: boolean;
  showCompleted: boolean;
  showHoldTasks: boolean;
  onToggleMode: (mode: 'notes' | 'completed' | 'hold') => void;
  onMinimize: () => void;
}

const headerButtons = [
  { mode: 'notes' as const, icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <rect x="4" y="6" width="16" height="2" rx="1"/>
      <rect x="4" y="11" width="16" height="2" rx="1"/>
      <rect x="4" y="16" width="10" height="2" rx="1"/>
    </svg>
  ), title: 'Toggle Notes' },
  { mode: 'completed' as const, icon: CheckCircle, title: 'Toggle Completed Tasks' },
  { mode: 'hold' as const, icon: Pause, title: 'Toggle Hold Tasks' },
];

export const FloatingPanelHeader: React.FC<FloatingPanelHeaderProps> = ({
  isNotesMode,
  showCompleted,
  showHoldTasks,
  onToggleMode,
  onMinimize
}) => {
  const getActiveState = (mode: string) => {
    switch (mode) {
      case 'notes': return isNotesMode;
      case 'completed': return showCompleted;
      case 'hold': return showHoldTasks;
      default: return false;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {headerButtons.map(({ mode, icon: Icon, title }) => (
        <Button 
          key={mode}
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleMode(mode)} 
          className={`h-8 w-8 p-0 rounded-lg backdrop-blur-sm border transition-all ${
            getActiveState(mode) 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300 shadow-lg' 
              : 'bg-gradient-to-r from-blue-400 to-cyan-400 border-blue-300 hover:from-blue-500 hover:to-cyan-500'
          }`}
          title={title}
        >
          <Icon className="text-white drop-shadow-sm" />
        </Button>
      ))}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onMinimize} 
        className="h-8 w-8 p-0 rounded-lg backdrop-blur-sm border border-orange-300 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 transition-all shadow-lg" 
        title="Minimize"
      >
        <Minimize className="h-4 w-4 text-white drop-shadow-sm" />
      </Button>
    </div>
  );
};