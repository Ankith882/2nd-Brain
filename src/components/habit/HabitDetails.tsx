import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Habit } from '@/hooks/useHabitManager';
import { HabitNoteEditor } from './HabitNoteEditor';
import { EnhancedDatePicker } from '../extra-panel/EnhancedDatePicker';

interface HabitDetailsProps {
  habit: Habit;
  isDarkMode: boolean;
  onUpdateDay: (date: string, status: 'completed' | 'missed' | null) => void;
  onAddNote: (date: string, note: string) => void;
  onMarkCompleted: (habitId: string) => void;
  onReactivateHabit?: (habitId: string) => void;
  getHabitDayStatus: (habitId: string, date: string) => 'completed' | 'missed' | null;
  getMonthStats: (habitId: string, year: number, month: number) => { completed: number; missed: number };
}

export const HabitDetails: React.FC<HabitDetailsProps> = ({
  habit,
  isDarkMode,
  onUpdateDay,
  onAddNote,
  onMarkCompleted,
  onReactivateHabit,
  getHabitDayStatus,
  getMonthStats
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [noteEditorDate, setNoteEditorDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStats = getMonthStats(habit.id, year, month);

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setShowDatePicker(false);
    }
  };

  const handleDayClick = (day: number) => {
    const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    const isBeforeStart = isBefore(new Date(year, month, day), habit.startDate);
    
    if (isBeforeStart) return;

    const currentStatus = getHabitDayStatus(habit.id, dateString);
    
    // Cycle through states: null -> completed -> missed -> null
    if (currentStatus === null) {
      onUpdateDay(dateString, 'completed');
    } else if (currentStatus === 'completed') {
      onUpdateDay(dateString, 'missed');
    } else if (currentStatus === 'missed') {
      onUpdateDay(dateString, null);
    }
  };

  const handleDayLongPress = (day: number) => {
    const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    setNoteEditorDate(dateString);
  };

  const getDayStatus = (day: number) => {
    const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    return getHabitDayStatus(habit.id, dateString);
  };

  const hasNote = (day: number) => {
    const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    return !!habit.notes[dateString];
  };

  const isBeforeStartDate = (day: number) => {
    return isBefore(new Date(year, month, day), habit.startDate);
  };

  const isToday = (day: number) => {
    return isSameDay(new Date(year, month, day), today);
  };

  return (
    <div className="h-full flex flex-col rounded-3xl mx-2 my-2">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium shadow-lg ${
                habit.iconUrl ? '' : 'border-2 border-white/30'
              }`}
              style={{ backgroundColor: habit.iconUrl ? 'transparent' : habit.color }}
            >
              {habit.iconUrl ? (
                <img src={habit.iconUrl} alt={habit.name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
              ) : (
                habit.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {habit.name}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Since {format(habit.startDate, 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          {habit.isCompleted ? (
            <Button
              onClick={() => onReactivateHabit?.(habit.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reactivate
            </Button>
          ) : (
            <Button
              onClick={() => onMarkCompleted(habit.id)}
              className="bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
          )}
        </div>

        {/* Enhanced Date Picker */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="mx-4">
            <EnhancedDatePicker
              selectedDate={currentDate}
              onDateSelect={(date) => setCurrentDate(date)}
              isDarkMode={isDarkMode}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center text-sm font-medium py-2 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="h-12" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const beforeStart = isBeforeStartDate(day);
                const todayHighlight = isToday(day);

                return (
                  <DayCell
                    key={day}
                    day={day}
                    status={status}
                    hasNote={hasNote(day)}
                    isBeforeStart={beforeStart}
                    isToday={todayHighlight}
                    onClick={handleDayClick}
                    onLongPress={handleDayLongPress}
                    isDarkMode={isDarkMode}
                  />
                );
              })}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="p-6 border-t border-white/20">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              This Month
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#28C76F]/20 p-4 rounded-xl border border-[#28C76F]/30">
                <div className="text-[#28C76F] text-2xl font-bold">{monthStats.completed}</div>
                <div className="text-[#28C76F] text-sm">Completed Days</div>
              </div>
              <div className="bg-[#fa0202]/20 p-4 rounded-xl border border-[#fa0202]/30">
                <div className="text-[#fa0202] text-2xl font-bold">{monthStats.missed}</div>
                <div className="text-[#fa0202] text-sm">Missed Days</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Note Editor Modal */}
      {noteEditorDate && (
        <HabitNoteEditor
          date={noteEditorDate}
          existingNote={habit.notes[noteEditorDate] || ''}
          isDarkMode={isDarkMode}
          onSave={(note) => {
            onAddNote(noteEditorDate, note);
            setNoteEditorDate(null);
          }}
          onClose={() => setNoteEditorDate(null)}
        />
      )}
    </div>
  );
};

interface DayCellProps {
  day: number;
  status: 'completed' | 'missed' | null;
  hasNote: boolean;
  isBeforeStart: boolean;
  isToday: boolean;
  onClick: (day: number) => void;
  onLongPress: (day: number) => void;
  isDarkMode: boolean;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  status,
  hasNote,
  isBeforeStart,
  isToday,
  onClick,
  onLongPress,
  isDarkMode
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    if (isBeforeStart) return;
    
    const timer = setTimeout(() => {
      onLongPress(day);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (isBeforeStart) return;
    onClick(day);
  };

  const getCellClasses = () => {
    let baseClasses = "h-12 w-12 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 relative";
    
    if (isBeforeStart) {
      baseClasses += ` ${isDarkMode ? 'text-white/30 bg-gray-700/60' : 'text-gray-500 bg-gray-400/60'} cursor-not-allowed`;
    } else if (status === 'completed') {
      baseClasses += " bg-[#28C76F]/80 text-white border border-[#28C76F]/90 hover:bg-[#28C76F]/90 shadow-sm";
    } else if (status === 'missed') {
      baseClasses += " bg-[#fa0202]/80 text-white border border-[#fa0202]/90 hover:bg-[#fa0202]/90 shadow-sm";
    } else {
      baseClasses += ` hover:bg-white/20 ${isDarkMode ? 'text-white' : 'text-gray-800'}`;
    }

    if (isToday && !isBeforeStart) {
      baseClasses += " ring-2 ring-cyan-mist shadow-lg shadow-cyan-mist/30";
    }

    return baseClasses;
  };

  return (
    <div
      className={getCellClasses()}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {day}
      {hasNote && (
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#1302fa] rounded-full shadow-lg"></div>
      )}
    </div>
  );
};