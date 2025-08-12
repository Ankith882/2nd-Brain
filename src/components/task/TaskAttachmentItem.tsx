import React, { useState } from 'react';
import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { ExternalLink, Paperclip, MoreVertical, Palette } from 'lucide-react';
import { TaskAttachment } from '@/types/task';

interface TaskAttachmentItemProps {
  attachment: TaskAttachment;
  onEdit: (id: string, text: string, color: string) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

export const TaskAttachmentItem: React.FC<TaskAttachmentItemProps> = ({
  attachment,
  onEdit,
  onDelete,
  isDarkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(attachment.text);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(attachment.color);

  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#64748B'
  ];

  const handleSave = () => {
    onEdit(attachment.id, editText, selectedColor);
    setIsEditing(false);
  };

  const getIcon = () => {
    switch (attachment.type) {
      case 'link': return <ExternalLink className="h-4 w-4" />;
      case 'file': return <Paperclip className="h-4 w-4" />;
      case 'image': return <ExternalLink className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg relative">
      <div className="flex items-center gap-2 flex-1">
        <div style={{ color: attachment.color }}>
          {getIcon()}
        </div>
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="bg-white/10 border-white/20 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline flex-1 truncate"
            style={{ color: attachment.color }}
          >
            {attachment.text || attachment.url}
          </a>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border-white/20">
          <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowColorPicker(!showColorPicker)}>
            <Palette className="h-4 w-4 mr-2" />
            Change Color
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(attachment.id)} className="text-red-600">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showColorPicker && (
        <div className="absolute z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 right-0 top-10">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {colors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-white/20"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  onEdit(attachment.id, attachment.text, color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
          <Input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            placeholder="#000000"
            className="bg-white/10 border-white/20 text-xs"
          />
        </div>
      )}
    </div>
  );
};