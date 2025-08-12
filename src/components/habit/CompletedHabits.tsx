import React from 'react';
import { Button } from '@/components/ui';
import { RotateCcw } from 'lucide-react';
import { Habit } from '@/hooks/useHabitManager';
import { format } from 'date-fns';

interface CompletedHabitsProps {
  habits: Habit[];
  isDarkMode: boolean;
  onMarkIncomplete: (habitId: string) => void;
}

export const CompletedHabits: React.FC<CompletedHabitsProps> = ({
  habits,
  isDarkMode,
  onMarkIncomplete
}) => {
  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/10 border-r border-white/20 rounded-3xl mx-2 my-2">
      <div className="p-6 border-b border-white/20">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Completed Habits
        </h2>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
          Habits you've successfully completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
              No completed habits yet. Keep working on your active habits!
            </p>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 rounded-xl backdrop-blur-md bg-white/15 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-lg ${
                      habit.iconUrl ? '' : 'border-2 border-white/30'
                    }`}
                    style={{ backgroundColor: habit.iconUrl ? 'transparent' : habit.color }}
                  >
                   {habit.iconUrl ? (
                      <img src={habit.iconUrl} alt={habit.name} className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                    ) : (
                      habit.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {habit.name}
                    </h3>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-800' : 'text-gray-600'}`}>
                      {format(habit.startDate, 'MMM dd, yyyy')} → {' '}
                      {habit.completedAt ? format(habit.completedAt, 'MMM dd, yyyy') : 'Today'}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-emerald-400 bg-emerald-400/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-400/30">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        {habit.completedDays.length}
                      </span>
                      <span className="text-xs text-rose-400 bg-rose-400/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-rose-400/30">
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        {habit.missedDays.length}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkIncomplete(habit.id)}
                  className="bg-white/20 border-white/30 backdrop-blur-md hover:bg-white/30"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};