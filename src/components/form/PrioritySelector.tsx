import React from 'react';
import { Button, ScrollArea } from '@/components/ui';

const priorities = [
  { value: 'P1', label: 'Critical', color: '#EF4444', emoji: '🔴' },
  { value: 'P2', label: 'High Priority', color: '#F97316', emoji: '🟠' },
  { value: 'P3', label: 'Important', color: '#F59E0B', emoji: '🟡' },
  { value: 'P4', label: 'Moderate', color: '#22C55E', emoji: '🟢' },
  { value: 'P5', label: 'Low Priority', color: '#0EA5E9', emoji: '🔵' },
  { value: 'P6', label: 'Deferred', color: '#8B5CF6', emoji: '🟣' },
  { value: 'P7', label: 'No Priority', color: '#9CA3AF', emoji: '⚪' },
];

interface PrioritySelectorProps {
  selectedPriority: string | null;
  onPrioritySelect: (priority: string) => void;
  onClearSelection: () => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onPrioritySelect,
  onClearSelection
}) => {
  if (selectedPriority) {
    const priority = priorities.find(p => p.value === selectedPriority);
    return (
      <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{priority?.emoji}</span>
            <div>
              <div className="font-medium">{priority?.label}</div>
              <div className="text-xs opacity-70">{selectedPriority}</div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
      <div className="space-y-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            type="button"
            className="w-full text-left p-3 rounded text-sm hover:bg-white/20 flex items-center gap-3"
            onClick={() => onPrioritySelect(priority.value)}
          >
            <span className="text-lg">{priority.emoji}</span>
            <div>
              <div className="font-medium">{priority.label}</div>
              <div className="text-xs opacity-70">{priority.value}</div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};