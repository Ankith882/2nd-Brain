import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EnhancedDatePicker } from '../extra-panel/EnhancedDatePicker';


interface AddHabitFormProps {
  isDarkMode: boolean;
  onSave: (habitData: {
    name: string;
    color: string;
    iconUrl?: string;
    startDate: Date;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    color: string;
    iconUrl?: string;
    startDate: Date;
  };
}

// Sample colors matching Mission Form
const colors = ['#3B82F6', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];

export const AddHabitForm: React.FC<AddHabitFormProps> = ({
  isDarkMode,
  onSave,
  onCancel,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || '#10B981');
  const [iconUrl, setIconUrl] = useState(initialData?.iconUrl || '');
  const [startDate, setStartDate] = useState<Date>(initialData?.startDate || new Date());
  const [customColor, setCustomColor] = useState(color);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        name: name.trim(),
        color,
        iconUrl: iconUrl.trim() || undefined,
        startDate
      });
    }
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon Section */}
        <div>
          <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Icon
          </Label>
          <div className="flex items-center gap-3 mt-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: color }}
            >
              {iconUrl ? (
                <img 
                  src={iconUrl} 
                  alt="Habit icon" 
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <Input
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="Icon URL"
              className="bg-white/10 border-white/20 text-sm"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Habit Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 bg-white/10 border-white/20"
            placeholder="Enter habit name"
            required
          />
        </div>

        {/* Color */}
        <div>
          <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Habit Color
          </Label>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  color === colorOption ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: colorOption }}
                onClick={() => handleColorSelect(colorOption)}
              />
            ))}
            <button
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                !colors.includes(color) ? 'border-white' : 'border-transparent'
              } bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500`}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
          </div>
          
          {showColorPicker && (
            <div className="mt-2 space-y-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  handleColorSelect(e.target.value);
                }}
                className="w-full h-10 bg-white/10 border-white/20 rounded"
              />
              <Input
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  handleColorSelect(e.target.value);
                }}
                className="bg-white/10 border-white/20"
                placeholder="#000000"
              />
            </div>
          )}
        </div>

        {/* Start Date */}
        <div>
          <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Start Date
          </Label>
          <div className="mt-2">
            <EnhancedDatePicker
              selectedDate={startDate}
              onDateSelect={setStartDate}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-white/10 border-white/20"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!name.trim()}
          >
            {initialData ? 'Save' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};