import React, { useState, useRef } from 'react';
import { Button, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { NotesFolder } from '@/hooks/useQuickNotesManager';

interface AddNotesFolderFormProps {
  folder?: NotesFolder;
  isDarkMode: boolean;
  workspaceId: string;
  onSave: (folderData: Partial<NotesFolder>) => void;
  onCancel: () => void;
}

const predefinedColors = [
  '#3B82F6', '#EF4444', '#F97316', '#F59E0B', 
  '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'
];

export const AddNotesFolderForm: React.FC<AddNotesFolderFormProps> = ({
  folder,
  isDarkMode,
  workspaceId,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(folder?.name || '');
  const [color, setColor] = useState(folder?.color || '#3B82F6');
  const [iconUrl, setIconUrl] = useState(folder?.iconUrl || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(folder?.color || '#3B82F6');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name,
      color,
      iconUrl,
      workspaceId
    });
  };

  return (
    <div className="space-y-6">
      {/* Icon Section */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Icon/Image
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer border-2 border-white/20 overflow-hidden"
            style={{ backgroundColor: color }}
            onClick={() => fileInputRef.current?.click()}
          >
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt="Folder icon" 
                className="w-full h-full rounded-md object-cover" 
              />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Upload from Device
            </Button>
            <Input 
              placeholder="Icon URL" 
              value={iconUrl} 
              onChange={(e) => setIconUrl(e.target.value)} 
              className="bg-white/10 border-white/20 placeholder:text-white/50" 
            />
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </div>
      </div>

      {/* Folder Name */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Folder Name
        </Label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="mt-2 bg-white/10 border-white/20 placeholder:text-white/50" 
          placeholder="Enter folder name" 
        />
      </div>

      {/* Color Picker */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Folder Colour
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
          disabled={!name.trim()}
          className="bg-cyan-mist/80 hover:bg-cyan-mist text-charcoal font-medium"
        >
          {folder ? 'Update' : 'Create'} Folder
        </Button>
      </div>
    </div>
  );
};