import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui';
import { FONT_FAMILIES } from './QuillEditorHooks';

interface QuillEditorCoreProps {
  editorRef: React.RefObject<HTMLDivElement>;
  toolbarRef: React.RefObject<HTMLDivElement>;
  quillRef: React.MutableRefObject<any>;
  initialContent: string;
  onChange: (content: string) => void;
  isDarkMode: boolean;
  setHasTextSelection: (hasSelection: boolean) => void;
  setSavedSelection: (selection: any) => void;
  setWasTextSelectedForLink: (selected: boolean) => void;
  setShowLinkAddManager: (show: boolean) => void;
  footerContent?: React.ReactNode;
}

export const QuillEditorCore: React.FC<QuillEditorCoreProps> = ({
  editorRef,
  toolbarRef,
  quillRef,
  initialContent,
  onChange,
  isDarkMode,
  setHasTextSelection,
  setSavedSelection,
  setWasTextSelectedForLink,
  setShowLinkAddManager,
  footerContent
}) => {
  const footerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editorRef.current || !toolbarRef.current || !window.Quill) return;

    // Register custom size attributor
    const Size = window.Quill.import('attributors/style/size');
    Size.whitelist = Array.from({length: 1000}, (_, i) => `${i + 1}px`);
    window.Quill.register(Size, true);

    // Register custom font family attributor
    const Font = window.Quill.import('attributors/style/font');
    Font.whitelist = FONT_FAMILIES.map(font => font.value === 'inherit' ? '' : font.value);
    window.Quill.register(Font, true);

    // Custom link handler
    const linkHandler = function(value: any) {
      const range = quill.getSelection();
      if (range && range.length > 0) {
        setSavedSelection(range);
        setWasTextSelectedForLink(true);
      } else {
        setWasTextSelectedForLink(false);
      }
      setShowLinkAddManager(true);
      return false;
    };

    // Initialize Quill
    const quill = new window.Quill(editorRef.current, {
      modules: {
        toolbar: {
          container: toolbarRef.current,
          handlers: { 'link': linkHandler }
        }
      },
      theme: 'snow',
      placeholder: ''
    });

    // Set initial content
    if (initialContent) {
      quill.root.innerHTML = initialContent;
    }

    // Event listeners
    quill.on('text-change', () => {
      onChange(quill.root.innerHTML);
    });

    quill.on('selection-change', (range) => {
      const hasSelection = range && range.length > 0;
      setHasTextSelection(hasSelection);
    });

    // Handle link clicks with URL validation and blob recovery
    const handleLinkClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      let href = target.getAttribute('href');
      
      // Recover corrupted blob URLs
      if (href === 'about:blank' || !href) {
        const originalBlob = target.getAttribute('data-original-blob');
        if (originalBlob) href = originalBlob;
      }
      
      if (!href) return;
      
      // Handle different URL types
      if (href.startsWith('blob:') || href.startsWith('http://') || href.startsWith('https://')) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (href && href !== 'about:blank' && href.trim() !== '') {
        const fullUrl = 'https://' + href;
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    };

    // Add click listener for links in editor
    quill.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        handleLinkClick(e);
      }
    });

    // Add click listener for links in footer content (attachments)
    if (footerRef.current) {
      footerRef.current.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
          handleLinkClick(e);
        }
      });
    }

    quillRef.current = quill;

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when prop changes (but only if editor is not focused to prevent cursor jumping)
  useEffect(() => {
    if (quillRef.current && initialContent !== quillRef.current.root.innerHTML) {
      // Only update if the editor doesn't have focus (prevents cursor jumping during typing)
      if (!quillRef.current.hasFocus()) {
        const selection = quillRef.current.getSelection();
        quillRef.current.root.innerHTML = initialContent;
        // Restore selection if it existed
        if (selection) {
          setTimeout(() => {
            quillRef.current.setSelection(selection);
          }, 0);
        }
      }
    }
  }, [initialContent]);

  return (
    <ScrollArea className="flex-1">
      <div className="relative flex flex-col h-full">
        <div 
          ref={editorRef}
          className={`flex-1 bg-card/30 border border-border border-t-0 p-4 ${
            isDarkMode ? 'text-primary-foreground' : 'text-charcoal'
          }`}
        />
        {footerContent && (
          <div ref={footerRef} className="border-t border-border bg-card/50 p-3">
            {footerContent}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};