import React, { useState } from 'react';
import { Button, Switch, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { MoreVertical, Plus, CheckCircle, XCircle, List, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Habit } from '@/hooks/useHabitManager';
import { AddHabitForm } from './AddHabitForm';

interface HabitListProps {
  habits: Habit[];
  selectedHabit: Habit | null;
  isDarkMode: boolean;
  showCompleted: boolean;
  highlightedHabitId?: string;
  onToggleView: (showCompleted: boolean) => void;
  onHabitSelect: (habit: Habit) => void;
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onMarkCompleted: (habitId: string) => void;
  onMarkIncomplete?: (habitId: string) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  selectedHabit,
  isDarkMode,
  showCompleted,
  highlightedHabitId,
  onToggleView,
  onHabitSelect,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onMarkCompleted,
  onMarkIncomplete
}) => {
  return <div className="h-full flex flex-col bg-transparent border-r border-white/20 rounded-3xl mx-2 my-2">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Habit Tracker
          </h2>
          <div className="flex items-center space-x-2">
            <Switch checked={showCompleted} onCheckedChange={onToggleView} className="data-[state=checked]:bg-cyan-mist" />
          </div>
        </div>
        
        {!showCompleted && <Button onClick={onAddHabit} className="w-full bg-cyan-mist hover:bg-cyan-mist-glow text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent">
        {habits.map(habit => <div key={habit.id} onClick={() => onHabitSelect(habit)} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border ${
              selectedHabit?.id === habit.id || highlightedHabitId === habit.id 
                ? 'bg-transparent border-cyan-mist shadow-lg ring-2 ring-cyan-mist/50' 
                : 'bg-transparent border-white/20 hover:bg-transparent'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-lg ${habit.iconUrl ? '' : 'border-2 border-white/30'}`} style={{
              backgroundColor: habit.iconUrl ? 'transparent' : habit.color
            }}>
                   {habit.iconUrl ? <img src={habit.iconUrl} alt={habit.name} className="w-10 h-10 rounded-xl object-cover shadow-lg" /> : habit.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {habit.name}
                    </h3>
                    
                    {showCompleted && habit.completedAt && (
                      <div className="mt-1 mb-2">
                        <p className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                          {format(habit.startDate, 'MMM dd, yyyy')} → {format(habit.completedAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-bold text-white bg-[#28C76F]/90 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-[#28C76F]">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        {habit.completedDays.length}
                      </span>
                      <span className="text-sm font-bold text-white bg-[#fa0202]/90 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-[#fa0202]">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        {habit.missedDays.length}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/20 border-white/20">
                    {!showCompleted ? <DropdownMenuItem onClick={() => onMarkCompleted(habit.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </DropdownMenuItem> : <DropdownMenuItem onClick={() => onMarkIncomplete?.(habit.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate
                      </DropdownMenuItem>}
                    {!showCompleted && (
                      <DropdownMenuItem onClick={() => onEditHabit(habit)}>
                        ✏️ Edit Habit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDeleteHabit(habit.id)} className="text-red-600">
                      🗑️ Delete Habit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>)}
      </div>
    </div>;
};