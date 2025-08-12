import React from 'react';
import { Input } from '@/components/ui';

const colors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E'
];

interface ColorSelectorProps {
  selectedColor: string;
  customColor: string;
  onColorSelect: (color: string) => void;
  onCustomColorChange: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  customColor,
  onColorSelect,
  onCustomColorChange
}) => (
  <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg space-y-3">
    <div className="grid grid-cols-6 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColor === color ? 'border-white' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
    <div className="flex gap-2">
      <Input
        type="color"
        value={customColor}
        onChange={(e) => onCustomColorChange(e.target.value)}
        className="w-16 h-10 bg-white/10 border-white/20"
      />
      <Input
        value={customColor}
        onChange={(e) => {
          onCustomColorChange(e.target.value);
          if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
            onColorSelect(e.target.value);
          }
        }}
        placeholder="#000000"
        className="bg-white/10 border-white/20 flex-1"
      />
    </div>
  </div>
);