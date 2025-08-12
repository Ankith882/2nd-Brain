
import React, { useState, useRef } from 'react';
import { Button, Input, Card, CardContent, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { MoreVertical, Edit, Trash2, Palette, Plus } from 'lucide-react';
import { format } from 'date-fns';

export interface Comment {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
  taskId: string;
}

interface CommentManagerProps {
  comments: Comment[];
  taskId: string;
  isDarkMode: boolean;
  onAddComment: (taskId: string, text: string, color: string) => void;
  onEditComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onChangeCommentColor: (commentId: string, color: string) => void;
}

const presetColors = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF'
];

export const CommentManager: React.FC<CommentManagerProps> = ({
  comments,
  taskId,
  isDarkMode,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onChangeCommentColor
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('#000000');
  const [showAddInput, setShowAddInput] = useState(false);

  const taskComments = comments.filter(comment => comment.taskId === taskId);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(taskId, newComment.trim(), '#3B82F6');
      setNewComment('');
      setShowAddInput(false);
    }
  };

  const handleEditStart = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleEditSave = (commentId: string) => {
    if (editText.trim()) {
      onEditComment(commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleColorChange = (commentId: string, color: string) => {
    onChangeCommentColor(commentId, color);
    setShowColorPicker(null);
  };

  return (
    <div className="space-y-4">
      {/* Comments List - Show existing comments first */}
      <div className="space-y-3">
        {taskComments.map((comment) => (
          <Card key={comment.id} className="bg-white/5 border-white/10">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bg-white/10 border-white/20 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditSave(comment.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="text-sm mb-1 p-2 rounded"
                        style={{ color: comment.color, backgroundColor: `${comment.color}10` }}
                      >
                        # {comment.text}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(comment.createdAt, 'MMM dd, HH:mm')}
                      </div>
                    </>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border-white/20">
                    <DropdownMenuItem onClick={() => handleEditStart(comment)}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteComment(comment.id)}>
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowColorPicker(comment.id)}>
                      <Palette className="h-3 w-3 mr-2" />
                      Change Color
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Color Picker */}
              {showColorPicker === comment.id && (
                <div className="mt-3 p-3 bg-white/10 rounded border border-white/20">
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-white/20 hover:border-white/40"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(comment.id, color)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-12 h-8 bg-white/10 border-white/20"
                    />
                    <Input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#000000"
                      className="bg-white/10 border-white/20 flex-1 text-xs"
                    />
                    <Button size="sm" onClick={() => handleColorChange(comment.id, customColor)}>
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Comment Button/Input - Only show if no comments exist */}
      {taskComments.length === 0 && (
        showAddInput ? (
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-white/10 border-white/20 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddInput(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => setShowAddInput(true)} variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Add Comment
          </Button>
        )
      )}
    </div>
  );
};
