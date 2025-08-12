import React, { useState, useRef } from 'react';
import { Button, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui';
import { Mission } from '@/hooks/useMissionManager';
import { FileText, CheckSquare, Kanban, Calendar } from 'lucide-react';
interface EditMissionFormProps {
  mission: Mission;
  isDarkMode: boolean;
  onSave: (updates: Partial<Mission>) => void;
  onCancel: () => void;
}
const predefinedColors = ['#3B82F6', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];
const templates = [{
  id: 'notes',
  name: 'Notes',
  icon: FileText,
  description: 'Simple note-taking'
}, {
  id: 'task',
  name: 'Task',
  icon: CheckSquare,
  description: 'Task management'
}, {
  id: 'kanban',
  name: 'Kanban',
  icon: Kanban,
  description: 'Board view'
}, {
  id: 'timeline',
  name: 'Timeline',
  icon: Calendar,
  description: 'Timeline view'
}];
export const EditMissionForm: React.FC<EditMissionFormProps> = ({
  mission,
  isDarkMode,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(mission.name);
  const [color, setColor] = useState(mission.color);
  const [iconUrl, setIconUrl] = useState(mission.iconUrl);
  const [template, setTemplate] = useState<'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix'>(mission.template);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(mission.color);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setIconUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = () => {
    onSave({
      name,
      color,
      iconUrl,
      template
    });
  };
  return <div className="space-y-6">
      {/* Icon Section */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Icon
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer" style={{
          backgroundColor: color
        }} onClick={() => fileInputRef.current?.click()}>
            {iconUrl ? <img src={iconUrl} alt="Mission icon" className="w-full h-full rounded-lg object-cover" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="bg-white/10 border-white/20">
              Upload from Device
            </Button>
            <Input placeholder="Icon URL" value={iconUrl} onChange={e => setIconUrl(e.target.value)} className="bg-white/10 border-white/20" />
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Name */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Mission Name
        </Label>
        <Input value={name} onChange={e => setName(e.target.value)} className="mt-2 bg-white/10 border-white/20" placeholder="Enter mission name" />
      </div>

      {/* Color */}
      <div>
        <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          Mission Color
        </Label>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {predefinedColors.map(preColor => <button key={preColor} className={`w-8 h-8 rounded-full border-2 ${color === preColor ? 'border-white' : 'border-transparent'}`} style={{
          backgroundColor: preColor
        }} onClick={() => handleColorSelect(preColor)} />)}
          <button className={`w-8 h-8 rounded-full border-2 ${!predefinedColors.includes(color) ? 'border-white' : 'border-transparent'} bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500`} onClick={() => setShowColorPicker(!showColorPicker)} />
        </div>
        
        {showColorPicker && <div className="mt-2">
            <Input type="color" value={customColor} onChange={e => {
          setCustomColor(e.target.value);
          handleColorSelect(e.target.value);
        }} className="w-full h-10 bg-white/10 border-white/20" />
            <Input value={customColor} onChange={e => {
          setCustomColor(e.target.value);
          handleColorSelect(e.target.value);
        }} className="mt-2 bg-white/10 border-white/20" placeholder="#000000" />
          </div>}
      </div>

      {/* Template */}
      

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="bg-white/10 border-white/20">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save
        </Button>
      </div>
    </div>;
};