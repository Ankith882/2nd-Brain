import React from 'react';
import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { MoreVertical, Edit, Trash2, Palette, ExternalLink, FileIcon, Download } from 'lucide-react';
import type { Attachment } from './QuillEditorHooks';
import { PRESET_COLORS } from './QuillEditorHooks';

interface AttachmentsListProps {
  attachments: Attachment[];
  editingAttachment: string | null;
  setEditingAttachment: (id: string | null) => void;
  editAttachmentData: { url: string; text: string };
  setEditAttachmentData: (data: { url: string; text: string }) => void;
  showColorPickerFor: string | null;
  setShowColorPickerFor: (id: string | null) => void;
  onSaveAttachment: () => void;
  onDeleteAttachment: (id: string) => void;
  onChangeAttachmentColor: (id: string, color: string) => void;
  onOpenAttachment: (url: string) => void;
  onDownloadAttachment?: (attachment: Attachment) => void;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  editingAttachment,
  setEditingAttachment,
  editAttachmentData,
  setEditAttachmentData,
  showColorPickerFor,
  setShowColorPickerFor,
  onSaveAttachment,
  onDeleteAttachment,
  onChangeAttachmentColor,
  onOpenAttachment,
  onDownloadAttachment
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="p-2 bg-card/50 rounded border border-border">
          {editingAttachment === attachment.id ? (
            <div className="space-y-2">
              <Input
                value={editAttachmentData.text}
                onChange={(e) => setEditAttachmentData({ ...editAttachmentData, text: e.target.value })}
                placeholder="Display text"
                className="bg-card/50 border-border text-sm"
              />
              <Input
                value={editAttachmentData.url}
                onChange={(e) => setEditAttachmentData({ ...editAttachmentData, url: e.target.value })}
                placeholder="URL"
                className="bg-card/50 border-border text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveAttachment}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingAttachment(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {attachment.type === 'file' ? (
                  <FileIcon className="h-4 w-4 flex-shrink-0" style={{ color: attachment.color }} />
                ) : (
                  <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: attachment.color }} />
                )}
                <button
                  onClick={() => onOpenAttachment(attachment.url)}
                  className="text-sm hover:underline truncate text-left"
                  style={{ color: attachment.color }}
                >
                  {attachment.text}
                </button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 flex-shrink-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-white/10 backdrop-blur-xl border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={() => {
                    setEditingAttachment(attachment.id);
                    setEditAttachmentData({ url: attachment.url, text: attachment.text });
                  }}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {attachment.type === 'file' && onDownloadAttachment && (
                    <DropdownMenuItem onClick={() => onDownloadAttachment(attachment)}>
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDeleteAttachment(attachment.id)}>
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowColorPickerFor(attachment.id)}>
                    <Palette className="h-3 w-3 mr-2" />
                    Change Color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {showColorPickerFor === attachment.id && (
            <div className="mt-3 p-3 bg-card/50 rounded border border-border">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChangeAttachmentColor(attachment.id, color);
                      setShowColorPickerFor(null);
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 h-8 bg-card/50 border-border"
                  onChange={(e) => {
                    onChangeAttachmentColor(attachment.id, e.target.value);
                    setShowColorPickerFor(null);
                  }}
                />
                <Input
                  placeholder="#000000"
                  className="bg-card/50 border-border text-xs flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.match(/^#[0-9A-F]{6}$/i)) {
                        onChangeAttachmentColor(attachment.id, input.value);
                        setShowColorPickerFor(null);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};