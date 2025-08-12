import React from 'react';
import { formatHour } from '@/utils/calendarUtils';

interface TimeGridProps {
  hours: number[];
  onDrop?: (hour: number, minute: number, event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  hours,
  onDrop,
  onDragOver,
  children,
  className = ""
}) => {
  return (
    <div className={`w-12 sm:w-20 flex-shrink-0 border-r-2 border-foreground/30 ${className}`} style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
      {hours.map((hour) => (
        <div 
          key={hour} 
          className="h-12 sm:h-16 border-b-2 border-foreground/20 text-xs text-foreground p-1 sm:p-2 flex items-start"
          style={{ minHeight: window.innerWidth < 640 ? '48px' : '64px' }}
          onDrop={onDrop ? (e) => onDrop(hour, 0, e) : undefined}
          onDragOver={onDragOver}
        >
          <span className="font-medium text-xs sm:text-sm">{formatHour(hour)}</span>
        </div>
      ))}
      {children}
    </div>
  );
};