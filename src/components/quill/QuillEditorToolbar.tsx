import React, { useState } from 'react';
import { 
  Button, 
  ScrollArea, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircle, ChevronDown, Upload, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FONT_FAMILIES } from './QuillEditorHooks';

interface QuillEditorToolbarProps {
  toolbarRef: React.RefObject<HTMLDivElement>;
  isDarkMode: boolean;
  saveSelection: () => any;
  applyFormat: (format: string, value: any) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  showBackgroundColorPicker: boolean;
  setShowBackgroundColorPicker: (show: boolean) => void;
  selectedBackgroundColor: string;
  setSelectedBackgroundColor: (color: string) => void;
  hasTextSelection: boolean;
  setWasTextSelectedForFile: (selected: boolean) => void;
  setShowFileUploadManager: (show: boolean) => void;
  setShowCommentInput: (show: boolean) => void;
  showCommentInput: boolean;
}

export const QuillEditorToolbar: React.FC<QuillEditorToolbarProps> = ({
  toolbarRef,
  isDarkMode,
  saveSelection,
  applyFormat,
  showColorPicker,
  setShowColorPicker,
  selectedColor,
  setSelectedColor,
  showBackgroundColorPicker,
  setShowBackgroundColorPicker,
  selectedBackgroundColor,
  setSelectedBackgroundColor,
  hasTextSelection,
  setWasTextSelectedForFile,
  setShowFileUploadManager,
  setShowCommentInput,
  showCommentInput
}) => {
  const [selectedFont, setSelectedFont] = useState('Default');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    applyFormat('color', color);
  };

  const handleBackgroundColorSelect = (color: string) => {
    setSelectedBackgroundColor(color);
    applyFormat('background', color);
  };

  const handleFontSelect = (fontValue: string) => {
    applyFormat('font', fontValue === 'inherit' ? false : fontValue);
  };

  const handleCustomFontSize = (size: number) => {
    applyFormat('size', `${size}px`);
  };

  const buttonClass = `inline-flex items-center justify-center w-6 h-6 rounded cursor-pointer border border-border hover:bg-accent text-foreground`;

  return (
    <div 
      ref={toolbarRef}
      className="bg-card border border-border rounded-t-lg p-2 flex-shrink-0 overflow-x-auto text-foreground"
    >
      <div className="flex items-center gap-1 min-w-max">{/* Wrapper to ensure all tools are visible */}
      {/* Font & Size */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs px-2 min-w-[80px] justify-between bg-card border-border text-foreground hover:bg-accent"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
          >
            <span className="truncate">{selectedFont}</span>
            <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 max-h-64 bg-card backdrop-blur-xl border-border"
          style={{ zIndex: 9999 }}
        >
          <ScrollArea className="h-60">
            <div className="p-1">
              {FONT_FAMILIES.map((font) => (
                <DropdownMenuItem
                  key={font.label}
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-accent text-foreground"
                  style={{ fontFamily: font.value === 'inherit' ? 'inherit' : font.value }}
                  onClick={() => {
                    setSelectedFont(font.label);
                    handleFontSelect(font.value);
                  }}
                >
                  {font.label}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="number"
        placeholder="Size"
        min="1"
        max="1000"
        className="w-20 bg-card border border-border rounded text-xs ml-1 px-1 text-foreground"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            const input = e.target as HTMLInputElement;
            const size = parseInt(input.value);
            if (size >= 1 && size <= 1000) {
              handleCustomFontSize(size);
              input.value = '';
            }
          }
        }}
        onBlur={(e) => {
          // Handle mobile "Go" button and blur events
          const input = e.target as HTMLInputElement;
          const size = parseInt(input.value);
          if (input.value && size >= 1 && size <= 1000) {
            handleCustomFontSize(size);
            input.value = '';
          }
        }}
        onSubmit={(e) => {
          // Additional handler for form submission on mobile
          e.preventDefault();
          const input = e.target as HTMLInputElement;
          const size = parseInt(input.value);
          if (size >= 1 && size <= 1000) {
            handleCustomFontSize(size);
            input.value = '';
          }
        }}
        onFocus={saveSelection}
      />

      {/* Basic formatting */}
      <span className="ql-formats ml-2">
        <button className="ql-bold" title="Bold"></button>
        <button className="ql-italic" title="Italic"></button>
        <button className="ql-underline" title="Underline"></button>
        <button className="ql-strike" title="Strikethrough"></button>
      </span>

      {/* Comment and File buttons */}
      <span className="ql-formats ml-2">
        <button 
          onClick={() => setShowCommentInput(!showCommentInput)}
          className={`${buttonClass} ${showCommentInput ? 'bg-card/50' : ''}`}
          title="Add Comment"
          type="button"
        >
          <MessageCircle className="h-3 w-3" />
        </button>
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={(e) => {
            e.preventDefault();
            setWasTextSelectedForFile(hasTextSelection);
            setShowFileUploadManager(true);
          }}
          className={`${buttonClass} ml-1`}
          title="Upload File"
          type="button"
        >
          <Upload className="h-3 w-3" />
        </button>
      </span>

      {/* Color pickers */}
      <span className="ql-formats ml-2">
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <span 
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              className={buttonClass}
              title="Text Color"
              style={{ backgroundColor: selectedColor }}
            >
              <span className="text-white text-xs font-bold">A</span>
            </span>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-card backdrop-blur-xl border-border" 
            side="bottom"
            align="start"
            sideOffset={4}
            style={{ zIndex: 9999 }}
          >
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
              onApply={() => setShowColorPicker(false)}
              onClose={() => setShowColorPicker(false)}
              isDarkMode={isDarkMode}
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={showBackgroundColorPicker} onOpenChange={setShowBackgroundColorPicker}>
          <PopoverTrigger asChild>
            <span 
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              className={`${buttonClass} ml-1`}
              title="Background Color"
              style={{ backgroundColor: selectedBackgroundColor }}
            >
              <span className="text-black text-xs font-bold">H</span>
            </span>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-card backdrop-blur-xl border-border" 
            side="bottom"
            align="start"
            sideOffset={4}
            style={{ zIndex: 9999 }}
          >
            <ColorPicker
              selectedColor={selectedBackgroundColor}
              onColorSelect={handleBackgroundColorSelect}
              onApply={() => setShowBackgroundColorPicker(false)}
              onClose={() => setShowBackgroundColorPicker(false)}
              isDarkMode={isDarkMode}
            />
          </PopoverContent>
        </Popover>
      </span>

      {/* Headers and formatting */}
      <span className="ql-formats ml-2">
        <button className="ql-header" value="1" title="Header 1"></button>
        <button className="ql-header" value="2" title="Header 2"></button>
        <button className="ql-blockquote" title="Blockquote"></button>
        <button className="ql-code-block" title="Code Block"></button>
      </span>

      {/* Lists and indentation */}
      <span className="ql-formats ml-2">
        <button className="ql-list" value="ordered" title="Numbered List"></button>
        <button className="ql-list" value="bullet" title="Bullet List"></button>
        <button className="ql-indent" value="-1" title="Decrease Indent"></button>
        <button className="ql-indent" value="+1" title="Increase Indent"></button>
      </span>

      {/* Script formatting */}
      <span className="ql-formats ml-2">
        <button className="ql-script" value="sub" title="Subscript"></button>
        <button className="ql-script" value="super" title="Superscript"></button>
      </span>

      {/* Alignment */}
      <span className="ql-formats ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs px-2 w-8 bg-card border-border text-foreground hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              title="Text Alignment"
            >
              <AlignLeft className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-auto bg-card backdrop-blur-xl border-border"
            side="bottom"
            align="start"
            sideOffset={4}
            style={{ zIndex: 9999 }}
          >
            <DropdownMenuItem
              className="text-xs px-2 py-1 cursor-pointer hover:bg-accent text-foreground"
              onClick={() => applyFormat('align', false)}
            >
              <AlignLeft className="h-3 w-3 mr-2" />
              Left
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs px-2 py-1 cursor-pointer hover:bg-accent text-foreground"
              onClick={() => applyFormat('align', 'center')}
            >
              <AlignCenter className="h-3 w-3 mr-2" />
              Center
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs px-2 py-1 cursor-pointer hover:bg-accent text-foreground"
              onClick={() => applyFormat('align', 'right')}
            >
              <AlignRight className="h-3 w-3 mr-2" />
              Right
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs px-2 py-1 cursor-pointer hover:bg-accent text-foreground"
              onClick={() => applyFormat('align', 'justify')}
            >
              <AlignJustify className="h-3 w-3 mr-2" />
              Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>

      {/* Media and links */}
      <span className="ql-formats ml-2">
        <button className="ql-link" title="Add Link"></button>
        <button className="ql-image" title="Add Image"></button>
        <button className="ql-video" title="Add Video"></button>
      </span>

      {/* Clean formatting */}
      <span className="ql-formats ml-2">
        <button className="ql-clean" title="Remove Formatting"></button>
      </span>
      </div>
    </div>
  );
};