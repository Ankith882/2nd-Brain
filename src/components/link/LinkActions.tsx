import React from 'react';
import { Button } from '@/components/ui';
import { Edit, Trash2, Palette, Plus } from 'lucide-react';

interface LinkActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onToggleColorPicker: () => void;
  onToggleTagInput: () => void;
}

export const LinkActions: React.FC<LinkActionsProps> = ({
  onEdit,
  onDelete,
  onToggleColorPicker,
  onToggleTagInput
}) => (
  <div className="flex gap-1 flex-shrink-0">
    <Button
      variant="ghost"
      size="sm"
      onClick={onEdit}
      className="p-1 h-6 w-6"
      title="Edit link"
    >
      <Edit className="h-3 w-3" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggleColorPicker}
      className="p-1 h-6 w-6"
      title="Change color"
    >
      <Palette className="h-3 w-3" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggleTagInput}
      className="p-1 h-6 w-6"
      title="Add tag"
    >
      <Plus className="h-3 w-3" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onDelete}
      className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
      title="Delete link"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
);