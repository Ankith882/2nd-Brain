import React from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import { ExternalLink, FileText, Image } from 'lucide-react';
import { format } from 'date-fns';
import { LinkActions } from './LinkActions';
import { LinkEditor } from './LinkEditor';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { TagInput } from './TagInput';

export interface TaskLink {
  id: string;
  url: string;
  text: string;
  color: string;
  type: 'link' | 'image' | 'attachment';
  createdAt: Date;
  description?: string;
  tags?: string[];
}

interface LinkItemProps {
  link: TaskLink;
  isDarkMode: boolean;
  isEditing: boolean;
  showColorPicker: boolean;
  showTagInput: boolean;
  onEdit: () => void;
  onSave: (url: string, text: string, description?: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onColorChange: (color: string) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onToggleColorPicker: () => void;
  onToggleTagInput: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'image': return <Image className="h-4 w-4" />;
    case 'attachment': return <FileText className="h-4 w-4" />;
    default: return <ExternalLink className="h-4 w-4" />;
  }
};

const openLink = (url: string) => {
  if (url.startsWith('blob:')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
  window.open(formattedUrl, '_blank', 'noopener,noreferrer');
};

export const LinkItem: React.FC<LinkItemProps> = ({
  link,
  isDarkMode,
  isEditing,
  showColorPicker,
  showTagInput,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onColorChange,
  onTagAdd,
  onTagRemove,
  onToggleColorPicker,
  onToggleTagInput
}) => (
  <Card className="bg-white/5 border-white/10">
    <CardContent className="p-4">
      {isEditing ? (
        <LinkEditor
          link={link}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => openLink(link.url)}
                className="flex items-center gap-2 text-sm font-medium hover:underline break-all text-left"
                style={{ color: link.color }}
              >
                {getIcon(link.type)}
                {link.text}
              </button>
              
              {link.description && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {link.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {format(link.createdAt, 'MMM dd, HH:mm')}
                </span>
                {link.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {link.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/5 border-white/20 cursor-pointer hover:bg-white/10"
                        onClick={() => onTagRemove(tag)}
                        title="Click to remove tag"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <LinkActions
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleColorPicker={onToggleColorPicker}
              onToggleTagInput={onToggleTagInput}
            />
          </div>

          {showColorPicker && (
            <ColorPicker onColorSelect={onColorChange} />
          )}

          {showTagInput && (
            <TagInput onTagAdd={onTagAdd} />
          )}
        </div>
      )}
    </CardContent>
  </Card>
);