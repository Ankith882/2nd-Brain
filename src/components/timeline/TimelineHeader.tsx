import React from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';
import { UnscheduledTaskIcon } from '@/components/calendar/UnscheduledTaskIcon';

interface TimelineHeaderProps {
  weekDates: Date[];
  selectedDate?: Date;
  isZoomedIn: boolean;
  timeMarkers: Array<{
    hour: number;
    minute?: number;
    label: string;
    position: number;
  }>;
  dayWidth: number;
  hourWidth: number;
  minuteWidth: number;
  unscheduledTasks: CalendarTask[];
  onUnscheduledTaskEdit?: (task: CalendarTask) => void;
  onUnscheduledTaskDelete?: (taskId: string) => void;
  onUnscheduledAddSubTask?: (task: CalendarTask) => void;
  onTimeBlockDoubleClick: (date: Date, hour: number) => void;
  getUnscheduledTasksForDate: (date: Date) => CalendarTask[];
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  weekDates,
  selectedDate,
  isZoomedIn,
  timeMarkers,
  dayWidth,
  minuteWidth,
  unscheduledTasks,
  onUnscheduledTaskEdit,
  onUnscheduledTaskDelete,
  onUnscheduledAddSubTask,
  onTimeBlockDoubleClick,
  getUnscheduledTasksForDate
}) => {
  return (
    <div className="sticky top-0 z-20 bg-transparent border-b border-white/20" style={{ backdropFilter: 'none', filter: 'none' }}>
      <div className="flex">
        {weekDates.map((date, index) => (
          <div 
            key={index} 
            className={`relative border-r border-white/20 transition-all duration-300 ${
              isToday(date) ? 'bg-pink-500/20 ring-2 ring-pink-500/30' : 
              selectedDate && isSameDay(date, selectedDate) ? 'bg-green-500/20 ring-2 ring-green-500/30' : ''
            }`}
            style={{ width: `${dayWidth}px` }}
          >
            <div className="p-4 text-center relative" style={{ backdropFilter: 'none', filter: 'none' }}>
              <div className="text-sm text-muted-foreground">
                {format(date, 'EEE')}
              </div>
              <div className={`text-lg font-medium ${
                isToday(date) ? 'text-pink-500 font-bold' : 
                selectedDate && isSameDay(date, selectedDate) ? 'text-green-500 font-bold' : 'text-foreground'
              }`}>
                {format(date, 'd')}
              </div>
              
              <div className="absolute top-2 right-2">
                <UnscheduledTaskIcon 
                  unscheduledTasks={getUnscheduledTasksForDate(date)} 
                  onTaskEdit={onUnscheduledTaskEdit || (() => {})} 
                  onTaskDelete={onUnscheduledTaskDelete || (() => {})} 
                  onAddSubTask={onUnscheduledAddSubTask || (() => {})} 
                />
              </div>
            </div>
            
            {isToday(date) && (
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-pink-500 z-10 transform -translate-x-0.5" />
            )}
            
            <div className="flex border-t border-white/20" title="Double-click on a time block to zoom and focus">
              {isZoomedIn ? (
                timeMarkers.map((marker, markerIndex) => (
                  <div 
                    key={`${marker.hour}-${marker.minute || 0}`} 
                    className="text-xs text-muted-foreground text-center py-1 border-r border-white/20 flex-shrink-0 cursor-pointer hover:bg-white/20" 
                    style={{ width: `${minuteWidth * 10}px` }}
                    onDoubleClick={() => onTimeBlockDoubleClick(date, marker.hour)}
                  >
                    {markerIndex % 6 === 0 ? marker.label : ''}
                  </div>
                ))
              ) : (
                timeMarkers.map(marker => (
                  <div 
                    key={marker.hour} 
                    className="text-xs text-muted-foreground text-center py-1 border-r border-white/20 cursor-pointer hover:bg-white/20 transition-colors" 
                    style={{ width: `${marker.position * 4}px` }}
                    onDoubleClick={() => onTimeBlockDoubleClick(date, marker.hour)} 
                    title={`Double-click to zoom into ${marker.label} – ${
                      marker.hour + 4 > 12 ? `${marker.hour + 4 - 12} PM` : 
                      marker.hour + 4 === 12 ? '12 PM' : 
                      `${marker.hour + 4} AM`
                    }`}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};