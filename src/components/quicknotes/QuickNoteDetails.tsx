import React, { useState, useEffect, useRef } from 'react';
import { X, MoreVertical, Save, Trash2, Palette, ExternalLink, FileIcon, MessageCircle, Edit3, Sparkles, Zap } from 'lucide-react';
import { Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { QuickNote } from '@/hooks/useQuickNotesManager';
import { QuillEditor } from '../QuillEditor';
interface QuickNoteDetailsProps {
  note: QuickNote;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (updates: Partial<QuickNote>) => void;
  onDelete: () => void;
}
const predefinedColors = ['#3B82F6', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];
export const QuickNoteDetails: React.FC<QuickNoteDetailsProps> = ({
  note,
  isDarkMode,
  onClose,
  onSave,
  onDelete
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color);
  const [attachments, setAttachments] = useState(note.attachments || []);
  const [comments, setComments] = useState(note.comments || []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(note.color);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setCustomColor(note.color);
    setAttachments(note.attachments || []);
    setComments(note.comments || []);
  }, [note]);
  const handleContentClick = () => {
    if (!isEditMode) {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);
      if (newClickCount === 3) {
        // Triple click - enter edit mode
        setIsEditMode(true);
        setClickCount(0);
      } else {
        // Start timer for potential triple click
        const timer = setTimeout(() => {
          setClickCount(0);
        }, 500);
        setClickTimer(timer);
      }
    }
  };
  const handleSave = () => {
    onSave({
      title,
      content,
      color,
      attachments,
      comments
    });
    setIsEditMode(false);
  };
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };
  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
    setShowColorPicker(false);
  };
  return <div className="h-full flex flex-col rounded-3xl mx-2 my-2 border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl" style={{
    background: `linear-gradient(135deg, ${color}15, ${color}05, rgba(255, 255, 255, 0.02))`
  }}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 backdrop-blur-sm flex items-center justify-between bg-white/5">
        <div className="flex-1 min-w-0">
          {isEditMode ? <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10 backdrop-blur-sm text-xl font-semibold placeholder:text-white/50 focus:bg-white/10 transition-all duration-300" placeholder="Note title..." /> : <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>
              {title || 'Untitled Note'}
            </h1>}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {/* Three Dots Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8 hover:bg-white/10 hover:scale-110 transition-all duration-200 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              {isEditMode ? <DropdownMenuItem onClick={handleSave} className="hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200">
                  <Zap className="mr-2 h-4 w-4" />
                  Save
                </DropdownMenuItem> : <DropdownMenuItem onClick={() => setIsEditMode(true)} className="hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>}
              <DropdownMenuItem onClick={() => setShowColorPicker(!showColorPicker)} className="hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200">
                <Palette className="mr-2 h-4 w-4" />
                Change Color
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="hover:bg-red-500/30 hover:backdrop-blur-sm text-red-300 transition-all duration-200">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close Button */}
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 h-8 w-8 hover:bg-white/10 hover:scale-110 transition-all duration-200 backdrop-blur-sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {predefinedColors.map(preColor => <button key={preColor} className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 ${color === preColor ? 'border-white scale-110 shadow-lg shadow-white/30' : 'border-white/20 hover:scale-105 hover:border-white/40'}`} style={{
          backgroundColor: preColor
        }} onClick={() => handleColorSelect(preColor)} />)}
            <button className={`w-8 h-8 rounded-full border-2 ${!predefinedColors.includes(color) ? 'border-white scale-110 shadow-lg shadow-white/30' : 'border-white/20 hover:scale-105 hover:border-white/40'} bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-white/20`} onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = customColor;
          input.onchange = e => {
            const newColor = (e.target as HTMLInputElement).value;
            setCustomColor(newColor);
            handleColorSelect(newColor);
          };
          input.click();
        }} />
          </div>
        </div>}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditMode ? <div className="h-full relative">
            <QuillEditor 
              initialContent={content} 
              onChange={newContent => setContent(newContent)} 
              isDarkMode={isDarkMode} 
              initialAttachments={attachments}
              initialComments={comments}
              onAttachmentsChange={setAttachments}
              onCommentsChange={setComments}
            />
            <div className="absolute bottom-2 left-2 z-10">
              
            </div>
          </div> : <div ref={contentRef} className="h-full overflow-y-auto p-6 cursor-pointer" onClick={handleContentClick}>
            {content ? <div className={`ql-read-mode max-w-none ${isDarkMode ? 'text-white' : 'text-gray-800'}`} dangerouslySetInnerHTML={{
          __html: content
        }} /> : <div className="h-full flex items-center justify-center">
                <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Triple-click to start editing
                </p>
              </div>}
            
            {/* Read Mode - Show attachments and comments if they exist */}
            {(attachments.length > 0 || comments.length > 0) && (
              <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                {/* Attachments in read mode */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      Attachments
                    </h4>
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                        {attachment.type === 'file' ? (
                          <FileIcon className="h-4 w-4 flex-shrink-0" style={{ color: attachment.color }} />
                        ) : (
                          <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: attachment.color }} />
                        )}
                        <button
                          onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
                          className="text-sm hover:underline truncate text-left flex-1"
                          style={{ color: attachment.color }}
                        >
                          {attachment.text}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Comments in read mode */}
                {comments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      Comments
                    </h4>
                     {comments.map((comment) => (
                       <div key={comment.id} className="flex items-start gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                         <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: comment.color }} />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm" style={{ color: comment.color }}>
                             {comment.text}
                           </p>
                           <p className="text-xs mt-1 opacity-80" style={{ color: comment.color }}>
                             {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            )}
          </div>}
      </div>

      {/* Footer hint */}
      {!isEditMode && content && <div className="p-2 text-center border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
            Triple-click to edit • Last updated {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>}

    </div>;
};