import React from 'react';
import { Button, Input } from '@/components/ui';
import { CommentManager } from '../CommentManager';
import type { Comment } from './QuillEditorHooks';

interface CommentSectionProps {
  comments: Comment[];
  showCommentInput: boolean;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  onSubmitNewComment: () => void;
  onCancelComment: () => void;
  isDarkMode: boolean;
  onAddComment: (taskId: string, text: string, color: string) => void;
  onEditComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onChangeCommentColor: (commentId: string, color: string) => void;
  hasOtherContent: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  showCommentInput,
  newCommentText,
  setNewCommentText,
  onSubmitNewComment,
  onCancelComment,
  isDarkMode,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onChangeCommentColor,
  hasOtherContent
}) => {
  return (
    <>
      {/* Comment Input */}
      {showCommentInput && (
        <div className="border-t border-border pt-3 mb-4">
          <div className="flex gap-2 items-center">
            <Input
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-card/50 border-border"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSubmitNewComment();
                }
              }}
              autoFocus
            />
            <Button onClick={onSubmitNewComment} disabled={!newCommentText.trim()}>
              Add
            </Button>
            <Button variant="outline" onClick={onCancelComment}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Comments Display */}
      {comments.length > 0 && (
        <div className={`${hasOtherContent ? 'border-t border-border pt-4' : ''}`}>
          <CommentManager
            comments={comments}
            taskId="quill-editor"
            isDarkMode={isDarkMode}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            onChangeCommentColor={onChangeCommentColor}
          />
        </div>
      )}
    </>
  );
};