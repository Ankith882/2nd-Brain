import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui';
import { Link as LinkIcon } from 'lucide-react';
import { LinkItem, TaskLink } from './LinkItem';

export type { TaskLink };

interface LinkManagerProps {
  links: TaskLink[];
  isDarkMode: boolean;
  onEditLink: (linkId: string, url: string, text: string, description?: string) => void;
  onDeleteLink: (linkId: string) => void;
  onChangeLinkColor: (linkId: string, color: string) => void;
  onAddTag: (linkId: string, tag: string) => void;
  onRemoveTag: (linkId: string, tag: string) => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  links,
  isDarkMode,
  onEditLink,
  onDeleteLink,
  onChangeLinkColor,
  onAddTag,
  onRemoveTag
}) => {
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [tagInputOpen, setTagInputOpen] = useState<string | null>(null);

  const handleEdit = useCallback((linkId: string) => {
    setEditingLink(linkId);
    setColorPickerOpen(null);
    setTagInputOpen(null);
  }, []);

  const handleSave = useCallback((linkId: string, url: string, text: string, description?: string) => {
    onEditLink(linkId, url, text, description);
    setEditingLink(null);
  }, [onEditLink]);

  const handleCancel = useCallback(() => {
    setEditingLink(null);
  }, []);

  const handleColorChange = useCallback((linkId: string, color: string) => {
    onChangeLinkColor(linkId, color);
    setColorPickerOpen(null);
  }, [onChangeLinkColor]);

  const handleTagAdd = useCallback((linkId: string, tag: string) => {
    onAddTag(linkId, tag);
    setTagInputOpen(null);
  }, [onAddTag]);

  const toggleColorPicker = useCallback((linkId: string) => {
    setColorPickerOpen(prev => prev === linkId ? null : linkId);
    setTagInputOpen(null);
    setEditingLink(null);
  }, []);

  const toggleTagInput = useCallback((linkId: string) => {
    setTagInputOpen(prev => prev === linkId ? null : linkId);
    setColorPickerOpen(null);
    setEditingLink(null);
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon className="h-5 w-5" />
        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Links & Attachments
        </h4>
        <Badge variant="secondary" className="bg-white/10 text-white">
          {links.length}
        </Badge>
      </div>

      <div className="grid gap-3">
        {links.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            isDarkMode={isDarkMode}
            isEditing={editingLink === link.id}
            showColorPicker={colorPickerOpen === link.id}
            showTagInput={tagInputOpen === link.id}
            onEdit={() => handleEdit(link.id)}
            onSave={(url, text, description) => handleSave(link.id, url, text, description)}
            onCancel={handleCancel}
            onDelete={() => onDeleteLink(link.id)}
            onColorChange={(color) => handleColorChange(link.id, color)}
            onTagAdd={(tag) => handleTagAdd(link.id, tag)}
            onTagRemove={(tag) => onRemoveTag(link.id, tag)}
            onToggleColorPicker={() => toggleColorPicker(link.id)}
            onToggleTagInput={() => toggleTagInput(link.id)}
          />
        ))}
      </div>
    </div>
  );
};