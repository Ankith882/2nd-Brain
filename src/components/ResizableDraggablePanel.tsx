import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { GripVertical, LucideIcon } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ResizableDraggablePanelProps {
  children: React.ReactNode;
  title: string;
  icon: LucideIcon;
  initialPosition: Position;
  initialSize: Size;
  minSize?: Size;
  className?: string;
}

export const ResizableDraggablePanel: React.FC<ResizableDraggablePanelProps> = ({
  children,
  title,
  icon: Icon,
  initialPosition,
  initialSize,
  minSize = { width: 200, height: 150 },
  className = ''
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startMousePos = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | string) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === 'drag') {
      setIsDragging(true);
      startPos.current = { ...position };
      startMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (action.startsWith('resize')) {
      setIsResizing(action);
      startSize.current = { ...size };
      startPos.current = { ...position };
      startMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent, action: 'drag' | string) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    if (action === 'drag') {
      setIsDragging(true);
      startPos.current = { ...position };
      startMousePos.current = { x: touch.clientX, y: touch.clientY };
    } else if (action.startsWith('resize')) {
      setIsResizing(action);
      startSize.current = { ...size };
      startPos.current = { ...position };
      startMousePos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startMousePos.current.x;
      const deltaY = e.clientY - startMousePos.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, startPos.current.x + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, startPos.current.y + deltaY));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - startMousePos.current.x;
      const deltaY = e.clientY - startMousePos.current.y;
      
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let newX = startPos.current.x;
      let newY = startPos.current.y;

      if (isResizing.includes('right')) {
        newWidth = Math.max(minSize.width, startSize.current.width + deltaX);
      }
      if (isResizing.includes('left')) {
        newWidth = Math.max(minSize.width, startSize.current.width - deltaX);
        newX = startPos.current.x + (startSize.current.width - newWidth);
      }
      if (isResizing.includes('bottom')) {
        newHeight = Math.max(minSize.height, startSize.current.height + deltaY);
      }
      if (isResizing.includes('top')) {
        newHeight = Math.max(minSize.height, startSize.current.height - deltaY);
        newY = startPos.current.y + (startSize.current.height - newHeight);
      }

      // Ensure panel stays within screen bounds
      newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - newHeight, newY));

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (isDragging) {
      e.preventDefault();
      const deltaX = touch.clientX - startMousePos.current.x;
      const deltaY = touch.clientY - startMousePos.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, startPos.current.x + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, startPos.current.y + deltaY));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      e.preventDefault();
      const deltaX = touch.clientX - startMousePos.current.x;
      const deltaY = touch.clientY - startMousePos.current.y;
      
      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;
      let newX = startPos.current.x;
      let newY = startPos.current.y;

      if (isResizing.includes('right')) {
        newWidth = Math.max(minSize.width, startSize.current.width + deltaX);
      }
      if (isResizing.includes('left')) {
        newWidth = Math.max(minSize.width, startSize.current.width - deltaX);
        newX = startPos.current.x + (startSize.current.width - newWidth);
      }
      if (isResizing.includes('bottom')) {
        newHeight = Math.max(minSize.height, startSize.current.height + deltaY);
      }
      if (isResizing.includes('top')) {
        newHeight = Math.max(minSize.height, startSize.current.height - deltaY);
        newY = startPos.current.y + (startSize.current.height - newHeight);
      }

      // Ensure panel stays within screen bounds
      newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - newHeight, newY));

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      // Prevent page scrolling during drag/resize
      document.body.style.overflow = 'hidden';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.documentElement.style.touchAction = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
        
        // Restore page scrolling
        document.body.style.overflow = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.documentElement.style.touchAction = '';
      };
    }
  }, [isDragging, isResizing, position, size]);

  return (
    <Card
      ref={panelRef}
      className={`fixed z-50 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl select-none ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* Resize handles - invisible but functional */}
      <div 
        className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top-left')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-top-left')}
      />
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top-right')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-top-right')}
      />
      <div 
        className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom-left')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-bottom-left')}
      />
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom-right')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-bottom-right')}
      />
      
      {/* Edge resize handles - invisible but functional */}
      <div 
        className="absolute -top-1 left-3 right-3 h-2 cursor-n-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-top')}
      />
      <div 
        className="absolute -bottom-1 left-3 right-3 h-2 cursor-s-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-bottom')}
      />
      <div 
        className="absolute -left-1 top-3 bottom-3 w-2 cursor-w-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-left')}
      />
      <div 
        className="absolute -right-1 top-3 bottom-3 w-2 cursor-e-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
        onTouchStart={(e) => handleTouchStart(e, 'resize-right')}
      />

      <CardHeader 
        className="pb-0 px-2 py-1 bg-white/5 dark:bg-black/5 backdrop-blur-sm rounded-t-xl border-b border-white/10 cursor-move flex flex-row items-center justify-center h-6"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
        onTouchStart={(e) => handleTouchStart(e, 'drag')}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground/40" />
      </CardHeader>

      <CardContent className="p-0 overflow-auto flex flex-col" style={{ height: `${size.height - 24}px` }}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};