import React, { useState } from 'react';
import { Button } from '@/components/ui';

interface HabitToggleMenuProps {
  currentView: 'active' | 'completed';
  onViewChange: (view: 'active' | 'completed') => void;
  isDarkMode: boolean;
}

export const HabitToggleMenu: React.FC<HabitToggleMenuProps> = ({
  currentView,
  onViewChange,
  isDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 ${
            isOpen ? 'rotate-45' : ''
          } ${
            isDarkMode 
              ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
              : 'bg-white/20 hover:bg-white/30 border border-white/30'
          }`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>

        {/* Menu Items */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            <Button
              onClick={() => {
                onViewChange('active');
                setIsOpen(false);
              }}
              className={`w-12 h-12 rounded-full shadow-md backdrop-blur-xl transition-all duration-300 ${
                currentView === 'active' 
                  ? 'bg-cyan-mist text-white shadow-lg ring-2 ring-cyan-mist/50'
                  : isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                    : 'bg-white/20 hover:bg-white/30 border border-white/30'
              }`}
              title="Active Habits"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </Button>

            <Button
              onClick={() => {
                onViewChange('completed');
                setIsOpen(false);
              }}
              className={`w-12 h-12 rounded-full shadow-md backdrop-blur-xl transition-all duration-300 ${
                currentView === 'completed' 
                  ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-500/50'
                  : isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                    : 'bg-white/20 hover:bg-white/30 border border-white/30'
              }`}
              title="Completed Habits"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};