import React, { useState, useRef, useEffect } from 'react';
import { 
  Textarea, 
  Button, 
  Card, 
  CardContent, 
  ScrollArea, 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui';
import { Flag, MoreVertical, Edit, Trash2, Palette, ExternalLink, FileIcon, MessageCircle } from 'lucide-react';

import { format } from 'date-fns';
import { Task } from '@/types/task';

import { QuillEditor } from './QuillEditor';
import { Input } from '@/components/ui';

interface TaskDescriptionProps {
  selectedTask: Task | null;
  isDarkMode: boolean;
  clickCount: number;
  onHeaderClick: () => void;
  onDescriptionUpdate: (description: string, attachments?: Array<{url: string, text: string, type: 'link' | 'file', color: string}>, comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>) => void;
  onSettingsClick: () => void;
  onWorkspaceClick: () => void;
  onSignOut: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}


const TaskDescription: React.FC<TaskDescriptionProps> = ({
  selectedTask,
  isDarkMode,
  clickCount,
  onHeaderClick,
  onDescriptionUpdate,
  onSettingsClick,
  onWorkspaceClick,
  onSignOut,
  showCloseButton = false,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(selectedTask?.description || '');
  const [originalDescription, setOriginalDescription] = useState(selectedTask?.description || '');
  const [showQuillEditor, setShowQuillEditor] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [clickCounter, setClickCounter] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [taskLinks, setTaskLinks] = useState<Array<{url: string, text: string, type: 'link' | 'file', color: string}>>([]);
  const [originalTaskLinks, setOriginalTaskLinks] = useState<Array<{url: string, text: string, type: 'link' | 'file', color: string}>>([]);
  const [taskComments, setTaskComments] = useState<Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>>([]);
  const [originalTaskComments, setOriginalTaskComments] = useState<Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>>([]);
  const [editingLink, setEditingLink] = useState<number | null>(null);
  const [editLinkData, setEditLinkData] = useState({ url: '', text: '' });
  const [isCanceling, setIsCanceling] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF'
  ];

  useEffect(() => {
    const newDescription = selectedTask?.description || '';
    setDescription(newDescription);
    setOriginalDescription(newDescription);
    
    // Extract links from task - prioritize attachments array, then fall back to legacy fields
    const links = [];
    
    // First, add from new attachments array if it exists
    if (selectedTask?.attachments && selectedTask.attachments.length > 0) {
      selectedTask.attachments.forEach(attachment => {
        links.push({
          url: attachment.url,
          text: attachment.text,
          type: attachment.type,
          color: attachment.color
        });
      });
    }
    
    setTaskLinks(links);
    setOriginalTaskLinks([...links]);
    
    // Extract comments from task
    const comments = selectedTask?.comments || [];
    setTaskComments(comments);
    setOriginalTaskComments([...comments]);
  }, [selectedTask]);

  // Store original values when editing starts
  const handleDescriptionClick = () => {
    setClickCounter(prev => prev + 1);
    
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (clickCounter >= 2) {
        // Store original values before editing
        setOriginalDescription(description);
        setOriginalTaskLinks([...taskLinks]);
        setOriginalTaskComments([...taskComments]);
        setIsCanceling(false);
        setShowQuillEditor(true);
      }
      setClickCounter(0);
    }, 300);
    
    setClickTimeout(timeout);
  };

  const handleQuillSave = (content: string) => {
    setDescription(content);
    // Use the current taskLinks and taskComments state which are updated by QuillEditor's callbacks
    onDescriptionUpdate(content, taskLinks, taskComments);
    setShowQuillEditor(false);
    setIsCanceling(false);
  };

  const handleQuillCancel = () => {
    // Set canceling flag first to prevent any saves
    setIsCanceling(true);
    // Restore original values
    setDescription(originalDescription);
    setTaskLinks([...originalTaskLinks]);
    setTaskComments([...originalTaskComments]);
    setShowQuillEditor(false);
    // Reset canceling flag after a brief delay to ensure all pending saves are blocked
    setTimeout(() => {
      setIsCanceling(false);
    }, 100);
  };



  const handleEditLink = (index: number) => {
    const link = taskLinks[index];
    setEditingLink(index);
    setEditLinkData({ url: link.url, text: link.text });
  };

  const handleSaveLink = () => {
    if (editingLink !== null) {
      setTaskLinks(prev => prev.map((link, index) => 
        index === editingLink 
          ? { ...link, url: editLinkData.url, text: editLinkData.text }
          : link
      ));
      setEditingLink(null);
      setEditLinkData({ url: '', text: '' });
    }
  };

  const handleDeleteLink = (index: number) => {
    setTaskLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeLinkColor = (index: number, color: string) => {
    setTaskLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, color } : link
    ));
  };

  const getPriorityInfo = (priority: string) => {
    const priorities = {
      'P1': { label: 'Critical', color: '#EF4444', emoji: '🔴' },
      'P2': { label: 'High', color: '#F97316', emoji: '🟠' },
      'P3': { label: 'Important', color: '#F59E0B', emoji: '🟡' },
      'P4': { label: 'Moderate', color: '#22C55E', emoji: '🟢' },
      'P5': { label: 'Low', color: '#0EA5E9', emoji: '🔵' },
      'P6': { label: 'Deferred', color: '#8B5CF6', emoji: '🟣' },
      'P7': { label: 'None', color: '#9CA3AF', emoji: '⚪' },
    };
    return priorities[priority as keyof typeof priorities] || priorities.P3;
  };

  const handleOpenTaskLink = (url: string) => {
    console.log('Opening task link URL:', url);
    
    // Handle blob URLs for uploaded files (don't modify them)
    if (url.startsWith('blob:')) {
      try {
        console.log('Opening blob URL directly:', url);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open blob URL:', error);
        // Fallback: try to open without window.open
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return;
    }
    
    // Handle regular URLs
    let finalUrl = url;
    if (!url.match(/^https?:\/\//)) {
      finalUrl = `https://${url}`;
    }
    
    console.log('Opening regular URL:', finalUrl);
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/10 border-l border-white/20 rounded-l-3xl mx-2 my-2">
      <div 
        className="sticky top-0 z-10 p-2 sm:p-3 border-b border-white/20 cursor-pointer hover:bg-white/5 transition-colors bg-white/10 backdrop-blur-xl"
        onClick={onHeaderClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <h2 className={`text-lg sm:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>
              Description
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            {selectedTask && selectedTask.priority && selectedTask.priority.trim() !== '' && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Flag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" style={{ color: getPriorityInfo(selectedTask.priority).color }} />
                <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} hidden sm:inline`}>
                  {getPriorityInfo(selectedTask.priority).emoji} {getPriorityInfo(selectedTask.priority).label}
                </span>
                <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} sm:hidden`}>
                  {getPriorityInfo(selectedTask.priority).emoji}
                </span>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col min-h-full">
          {selectedTask ? (
            <div className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6">
              <Card className={`bg-white/5 backdrop-blur-md border border-white/20`}>
                <CardContent className="p-3 sm:p-4 ql-read-mode">
                  <div className="flex flex-col gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} break-words flex-1`}>
                        {selectedTask.title}
                      </h3>
                      
                      {/* Save and Cancel buttons when in edit mode - centered */}
                      {showQuillEditor && (
                        <div className="flex gap-1 justify-center flex-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleQuillSave(description)}
                            className="h-6 px-3 py-1 text-xs font-medium rounded-full bg-primary/80 hover:bg-primary text-primary-foreground border-0"
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleQuillCancel}
                            className="h-6 px-3 py-1 text-xs font-medium rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {/* Welcome button in the right corner */}
                      <button 
                        onClick={onHeaderClick}
                        className={`text-xs ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-800 hover:text-gray-600'} cursor-pointer transition-colors flex-1 text-right`}
                      >
                        👋 Welcome
                      </button>
                    </div>
                  </div>
                   {showQuillEditor ? (
                     <div className="h-[calc(100vh-12rem)]">
                        <QuillEditor
                           initialContent={description}
                           onChange={(content) => {
                             // Only update description if not canceling
                             if (!isCanceling) {
                               setDescription(content);
                             }
                           }}
                            isDarkMode={isDarkMode}
                           initialAttachments={taskLinks.map(link => ({
                             id: Date.now().toString() + Math.random(),
                             url: link.url,
                             text: link.text,
                             type: link.type,
                             color: link.color
                           }))}
                            initialComments={taskComments.map(comment => ({
                              id: comment.id,
                              text: comment.text,
                              color: comment.color,
                              createdAt: comment.createdAt,
                              taskId: comment.taskId
                            }))}
                            onAttachmentsChange={(attachments) => {
                              // Only update if not in canceling mode
                              if (!isCanceling) {
                                const newTaskLinks = attachments.map(att => ({
                                  url: att.url,
                                  text: att.text,
                                  type: att.type,
                                  color: att.color
                                }));
                                setTaskLinks(newTaskLinks);
                                // Do not auto-save here - only save when Save button is clicked
                              }
                            }}
                             onCommentsChange={(comments) => {
                               // Only update if not in canceling mode
                               if (!isCanceling) {
                                 setTaskComments(comments);
                                 // Do not auto-save here - only save when Save button is clicked
                               }
                             }}
                          />
                     </div>
                  ) : (
                    <div 
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap mb-4 cursor-pointer min-h-[80px] sm:min-h-[100px] p-2 rounded text-sm sm:text-base break-words`}
                      onClick={handleDescriptionClick}
                      dangerouslySetInnerHTML={{ 
                        __html: description || 'No description provided. Triple-click to edit.' 
                      }}
                    />
                  )}

                  {/* Attachments Section - without header */}
                  {taskLinks.length > 0 && !showQuillEditor && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="space-y-2">
                        {taskLinks.map((link, index) => (
                          <div key={index} className="p-2 sm:p-3 bg-white/5 rounded border border-white/10">
                            {editingLink === index ? (
                              <div className="space-y-2">
                                <Input
                                  value={editLinkData.text}
                                  onChange={(e) => setEditLinkData(prev => ({ ...prev, text: e.target.value }))}
                                  placeholder="Display text"
                                  className="bg-white/10 border-white/20 text-sm"
                                />
                                <Input
                                  value={editLinkData.url}
                                  onChange={(e) => setEditLinkData(prev => ({ ...prev, url: e.target.value }))}
                                  placeholder="URL"
                                  className="bg-white/10 border-white/20 text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleSaveLink}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingLink(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {link.type === 'file' ? (
                                  <FileIcon className="h-4 w-4 flex-shrink-0" style={{ color: link.color }} />
                                ) : (
                                  <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: link.color }} />
                                )}
                                <button
                                  onClick={() => handleOpenTaskLink(link.url)}
                                  className="text-sm hover:underline truncate text-left"
                                  style={{ color: link.color }}
                                >
                                  {link.text}
                                </button>
                              </div>
                            )}
                            
                            {showColorPicker === `link-${index}` && (
                              <div className="mt-3 p-3 bg-white/10 rounded border border-white/20">
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                  {presetColors.map((color) => (
                                    <button
                                      key={color}
                                      className="w-6 h-6 rounded border border-white/20 hover:border-white/40"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        handleChangeLinkColor(index, color);
                                        setShowColorPicker(null);
                                      }}
                                    />
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    className="w-12 h-8 bg-white/10 border-white/20"
                                    onChange={(e) => {
                                      handleChangeLinkColor(index, e.target.value);
                                      setShowColorPicker(null);
                                    }}
                                  />
                                  <Input
                                    placeholder="#000000"
                                    className="bg-white/10 border-white/20 text-xs flex-1"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        if (input.value.match(/^#[0-9A-F]{6}$/i)) {
                                          handleChangeLinkColor(index, input.value);
                                          setShowColorPicker(null);
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
                    </div>
                  )}

                  {/* Comments Section */}
                  {taskComments.length > 0 && !showQuillEditor && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        Comments ({taskComments.length})
                      </h4>
                      <div className="space-y-3">
                        {taskComments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-white/5 rounded border border-white/10">
                            <div className="flex items-start gap-2">
                              <MessageCircle 
                                className="h-4 w-4 mt-0.5 flex-shrink-0"
                                style={{ color: comment.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                                  {comment.text}
                                </p>
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No task selected.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

    </div>
  );
};

export default TaskDescription;
