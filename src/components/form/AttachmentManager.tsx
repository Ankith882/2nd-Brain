import React from 'react';
import { Button, Input, ScrollArea, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { ChevronUp, ChevronDown, Plus, Upload, MoreVertical, Paperclip, ExternalLink } from 'lucide-react';

const colors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6'
];

interface Attachment {
  id: string;
  url: string;
  text: string;
  type: 'link' | 'file' | 'image';
  color: string;
}

interface AttachmentManagerProps {
  attachments: Attachment[];
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onAddAttachment: () => void;
  onUpdateAttachment: (index: number, field: string, value: string) => void;
  onRemoveAttachment: (index: number) => void;
  onFileUpload: (index: number, file: File) => void;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  isExpanded,
  onToggleExpansion,
  onAddAttachment,
  onUpdateAttachment,
  onRemoveAttachment,
  onFileUpload
}) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
    <div className="flex items-center justify-between p-3 border-b border-white/20">
      <span className="text-sm font-medium">Attachments</span>
      <Button type="button" variant="ghost" size="sm" onClick={onToggleExpansion}>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
    
    {isExpanded && (
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="bg-gradient-to-br from-blue-50/10 via-white/5 to-purple-50/10 p-6 min-h-full">
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={attachment.id} className="space-y-2 p-3 bg-white/5 rounded-lg relative">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div style={{ color: attachment.color }}>
                      {attachment.type === 'file' ? <Paperclip className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                    </div>
                    <Input
                      value={attachment.url}
                      onChange={(e) => onUpdateAttachment(index, 'url', e.target.value)}
                      placeholder="URL or paste link"
                      className="bg-white/10 border-white/20 flex-1 text-sm"
                    />
                  </div>
                  
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileUpload(index, file);
                    }}
                    className="hidden"
                    id={`file-${index}`}
                    accept="*/*"
                  />
                  <label htmlFor={`file-${index}`} className="cursor-pointer p-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 flex items-center justify-center">
                    <Upload className="h-4 w-4" />
                  </label>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border-white/20">
                      <DropdownMenuItem onClick={() => onRemoveAttachment(index)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Input
                  value={attachment.text}
                  onChange={(e) => onUpdateAttachment(index, 'text', e.target.value)}
                  placeholder="Display text"
                  className="bg-white/10 border-white/20 text-sm"
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-xs">Color:</span>
                  <div className="flex gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-4 h-4 rounded border ${attachment.color === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onUpdateAttachment(index, 'color', color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={onAddAttachment} className="w-full bg-white/10 border-white/20 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Attachment
            </Button>
          </div>
        </div>
      </ScrollArea>
    )}
  </div>
);