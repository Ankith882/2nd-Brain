import { useState, useRef, useEffect, useCallback } from 'react';

// Types
export interface Attachment {
  id: string;
  url: string;
  text: string;
  type: 'link' | 'file';
  color: string;
}

export interface Comment {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
  taskId: string;
}

// Font families configuration
export const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Monaco', value: 'Monaco, monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Lucida Console', value: 'Lucida Console, monospace' },
  { label: 'Palatino', value: 'Palatino, serif' }
];

export const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF'
];

// Main Quill editor hook
export const useQuillEditor = (
  initialContent: string,
  onChange: (content: string) => void,
  initialAttachments: Attachment[] = [],
  initialComments: Comment[] = [],
  onAttachmentsChange?: (attachments: Attachment[]) => void,
  onCommentsChange?: (comments: Comment[]) => void
) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [savedSelection, setSavedSelection] = useState<any>(null);

  // Notify parent of changes
  useEffect(() => {
    onAttachmentsChange?.(attachments);
  }, [attachments, onAttachmentsChange]);

  useEffect(() => {
    onCommentsChange?.(comments);
  }, [comments, onCommentsChange]);

  // Selection utilities
  const saveSelection = useCallback(() => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range && range.length > 0) {
        setSavedSelection(range);
        return range;
      }
    }
    return null;
  }, []);

  const restoreSelection = useCallback((selection?: any) => {
    if (quillRef.current) {
      const selectionToRestore = selection || savedSelection;
      if (selectionToRestore) {
        setTimeout(() => {
          quillRef.current.setSelection(selectionToRestore);
          quillRef.current.focus();
        }, 0);
      }
    }
  }, [savedSelection]);

  // Format utilities
  const applyFormat = useCallback((format: string, value: any) => {
    if (quillRef.current) {
      const range = savedSelection || quillRef.current.getSelection();
      if (range) {
        if (range.length > 0) {
          quillRef.current.setSelection(range);
          quillRef.current.format(format, value);
          quillRef.current.setSelection(range);
        } else {
          quillRef.current.format(format, value);
          quillRef.current.focus();
        }
      }
    }
    setSavedSelection(null);
  }, [savedSelection]);

  return {
    editorRef,
    toolbarRef,
    quillRef,
    attachments,
    setAttachments,
    comments,
    setComments,
    hasTextSelection,
    setHasTextSelection,
    savedSelection,
    setSavedSelection,
    saveSelection,
    restoreSelection,
    applyFormat
  };
};

// Color picker hook
export const useColorPicker = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState('#ffff00');

  return {
    showColorPicker,
    setShowColorPicker,
    selectedColor,
    setSelectedColor,
    showBackgroundColorPicker,
    setShowBackgroundColorPicker,
    selectedBackgroundColor,
    setSelectedBackgroundColor
  };
};

// Modals hook
export const useModals = () => {
  const [showFileUploadManager, setShowFileUploadManager] = useState(false);
  const [showLinkAddManager, setShowLinkAddManager] = useState(false);
  const [wasTextSelectedForLink, setWasTextSelectedForLink] = useState(false);
  const [wasTextSelectedForFile, setWasTextSelectedForFile] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  return {
    showFileUploadManager,
    setShowFileUploadManager,
    showLinkAddManager,
    setShowLinkAddManager,
    wasTextSelectedForLink,
    setWasTextSelectedForLink,
    wasTextSelectedForFile,
    setWasTextSelectedForFile,
    showCommentInput,
    setShowCommentInput
  };
};

// Attachment editing hook
export const useAttachmentEditor = () => {
  const [editingAttachment, setEditingAttachment] = useState<string | null>(null);
  const [editAttachmentData, setEditAttachmentData] = useState({ url: '', text: '' });
  const [showColorPickerFor, setShowColorPickerFor] = useState<string | null>(null);

  return {
    editingAttachment,
    setEditingAttachment,
    editAttachmentData,
    setEditAttachmentData,
    showColorPickerFor,
    setShowColorPickerFor
  };
};