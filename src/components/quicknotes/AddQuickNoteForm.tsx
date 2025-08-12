import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { QuickNote } from '@/hooks/useQuickNotesManager';

interface AddQuickNoteFormProps {
  folderId: string;
  isDarkMode: boolean;
  onSave: (noteData: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const predefinedColors = [
  '#3B82F6', '#EF4444', '#F97316', '#F59E0B', 
  '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'
];

export const AddQuickNoteForm: React.FC<AddQuickNoteFormProps> = ({
  folderId,
  isDarkMode,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#3B82F6');

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
  };

  const handleSave = () => {
    onSave({
      title: title || 'Untitled Note',
      content: '',
      color,
      folderId
    });
  };

  return (
    <div className="space-y-6">
      {/* Note Title */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Note Title
        </Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="mt-2 bg-white/10 border-white/20 placeholder:text-white/50" 
          placeholder="Enter note title (optional)" 
        />
      </div>

      {/* Color Picker */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Note Colour
        </Label>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {predefinedColors.map(preColor => (
            <button
              key={preColor}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                color === preColor ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: preColor }}
              onClick={() => handleColorSelect(preColor)}
            />
          ))}
          <button
            className={`w-8 h-8 rounded-full border-2 ${
              !predefinedColors.includes(color) ? 'border-white scale-110' : 'border-transparent hover:scale-105'
            } bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all duration-200`}
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
        </div>
        
        {showColorPicker && (
          <div className="mt-3 space-y-2">
            <Input 
              type="color" 
              value={customColor} 
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorSelect(e.target.value);
              }} 
              className="w-full h-10 bg-white/10 border-white/20" 
            />
            <Input 
              value={customColor} 
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorSelect(e.target.value);
              }} 
              className="bg-white/10 border-white/20 placeholder:text-white/50" 
              placeholder="#000000" 
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="bg-white/10 border-white/20 hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-cyan-mist/80 hover:bg-cyan-mist text-charcoal font-medium"
        >
          Create Note
        </Button>
      </div>
    </div>
  );
};