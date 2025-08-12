import React, { useState, useRef, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui';
import { Minimize2, Maximize2, GripHorizontal } from 'lucide-react';

interface FloatingTaskProgressProps {
  progress: number;
  progressColor: string;
  isDarkMode: boolean;
}

export const FloatingTaskProgress: React.FC<FloatingTaskProgressProps> = ({
  progress,
  progressColor,
  isDarkMode
}) => {
  const [position, setPosition] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = isMobile ? Math.min(window.innerWidth - 32, 280) : 300;
    return {
      x: isMobile ? window.innerWidth - width - 16 : window.innerWidth - 320, // Right edge on mobile
      y: isMobile ? window.innerHeight - 120 : window.innerHeight - 150 // Footer area
    };
  });
  const [size, setSize] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return { 
      width: isMobile ? Math.min(window.innerWidth - 32, 280) : 300, 
      height: isMobile ? 80 : 100 
    };
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartData, setResizeStartData] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStartData({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  const handleTouchResizeStart = useCallback((e: React.TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    const touch = e.touches[0];
    setResizeStartData({
      x: touch.clientX,
      y: touch.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport with mobile considerations
      const isMobile = window.innerWidth < 768;
      const margin = isMobile ? 16 : 8;
      const maxX = window.innerWidth - (isMinimized ? (isMobile ? 64 : 50) : size.width) - margin;
      const maxY = window.innerHeight - (isMinimized ? (isMobile ? 64 : 50) : size.height) - margin;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing) {
      e.preventDefault();
      const deltaX = e.clientX - resizeStartData.x;
      const deltaY = e.clientY - resizeStartData.y;
      
      let newWidth = resizeStartData.width;
      let newHeight = resizeStartData.height;
      let newX = position.x;
      let newY = position.y;

        // Calculate new dimensions based on resize handle with mobile considerations
        const isMobile = window.innerWidth < 768;
        const minWidth = isMobile ? 160 : 200;
        const minHeight = isMobile ? 60 : 80;
        
        switch (resizeHandle) {
          case 'se': // Southeast (bottom-right)
            newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
            newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
            break;
          case 'sw': // Southwest (bottom-left)
            newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
            newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
            newX = position.x + (resizeStartData.width - newWidth);
            break;
          case 'ne': // Northeast (top-right)
            newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
            newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
            newY = position.y + (resizeStartData.height - newHeight);
            break;
          case 'nw': // Northwest (top-left)
            newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
            newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
            newX = position.x + (resizeStartData.width - newWidth);
            newY = position.y + (resizeStartData.height - newHeight);
            break;
          case 'e': // East (right)
            newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
            break;
          case 'w': // West (left)
            newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
            newX = position.x + (resizeStartData.width - newWidth);
            break;
          case 's': // South (bottom)
            newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
            break;
          case 'n': // North (top)
            newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
            newY = position.y + (resizeStartData.height - newHeight);
            break;
        }

      // Constrain to viewport
      const maxWidth = window.innerWidth - newX;
      const maxHeight = window.innerHeight - newY;
      
      setSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
      
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, dragOffset, resizeStartData, resizeHandle, position, size, isMinimized]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (isDragging) {
      e.preventDefault();
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Constrain to viewport with mobile considerations
      const isMobile = window.innerWidth < 768;
      const margin = isMobile ? 16 : 8;
      const maxX = window.innerWidth - (isMinimized ? (isMobile ? 64 : 50) : size.width) - margin;
      const maxY = window.innerHeight - (isMinimized ? (isMobile ? 64 : 50) : size.height) - margin;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing) {
      e.preventDefault();
      const deltaX = touch.clientX - resizeStartData.x;
      const deltaY = touch.clientY - resizeStartData.y;
      
      let newWidth = resizeStartData.width;
      let newHeight = resizeStartData.height;
      let newX = position.x;
      let newY = position.y;

      // Calculate new dimensions based on resize handle with mobile considerations
      const isMobile = window.innerWidth < 768;
      const minWidth = isMobile ? 160 : 200;
      const minHeight = isMobile ? 60 : 80;
      
      switch (resizeHandle) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
          newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
          newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
          newX = position.x + (resizeStartData.width - newWidth);
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
          newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
          newY = position.y + (resizeStartData.height - newHeight);
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
          newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
          newX = position.x + (resizeStartData.width - newWidth);
          newY = position.y + (resizeStartData.height - newHeight);
          break;
        case 'e': // East (right)
          newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
          break;
        case 'w': // West (left)
          newWidth = Math.max(minWidth, resizeStartData.width - deltaX);
          newX = position.x + (resizeStartData.width - newWidth);
          break;
        case 's': // South (bottom)
          newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
          break;
        case 'n': // North (top)
          newHeight = Math.max(minHeight, resizeStartData.height - deltaY);
          newY = position.y + (resizeStartData.height - newHeight);
          break;
      }

      // Constrain to viewport
      const maxWidth = window.innerWidth - newX;
      const maxHeight = window.innerHeight - newY;
      
      setSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
      
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, dragOffset, resizeStartData, resizeHandle, position, size, isMinimized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : (isResizing ? 'resizing' : '');
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 transition-all duration-300 ease-out ${
        isDragging || isResizing ? 'transition-none' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? (typeof window !== 'undefined' && window.innerWidth < 768 ? '40px' : '48px') : `${size.width}px`,
        height: isMinimized ? (typeof window !== 'undefined' && window.innerWidth < 768 ? '40px' : '48px') : `${size.height}px`,
        transform: (isDragging || isResizing) ? 'scale(1.02)' : 'scale(1)',
        boxShadow: (isDragging || isResizing)
          ? '0 20px 40px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--border))' 
          : '0 10px 30px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(var(--border))'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`
        relative h-full rounded-xl border transition-all duration-300
        ${isDarkMode 
          ? 'bg-transparent border-white/10 shadow-2xl shadow-black/20' 
          : 'bg-transparent border-white/30 shadow-2xl shadow-black/10'
        }
        ${(isDragging || isResizing) ? 'ring-2 ring-white/30 bg-transparent' : ''}
      `}>
        {isMinimized ? (
          <div className="p-3 flex items-center justify-center h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimized}
              className="w-6 h-6 p-0 hover:bg-primary/20"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            {/* Header with drag handle and controls */}
            <div className="flex items-center justify-between p-2 md:p-3 pb-1 md:pb-2">
              <div className="flex items-center gap-1 md:gap-2">
                <div 
                  className="drag-handle cursor-grab active:cursor-grabbing p-0.5 md:p-1 rounded hover:bg-muted/50 transition-colors"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
                >
                  <GripHorizontal className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground">
                  Task Progress
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {progress}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimized}
                  className="w-5 h-5 md:w-6 md:h-6 p-0 hover:bg-muted/50"
                >
                  <Minimize2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="px-2 md:px-3 pb-2 md:pb-3 flex-1 flex items-center">
              <Progress 
                value={progress} 
                className="w-full h-2 md:h-3 bg-muted rounded-full overflow-hidden"
                indicatorColor={progressColor}
              />
            </div>

            {/* Resize Handles */}
            {!isMinimized && (
              <>
                {/* Corner handles */}
                <div 
                  className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 30%, transparent 70%)' }}
                />
                <div 
                  className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 30%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 30%, transparent 70%)' }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 30%, transparent 70%)' }}
                />
                
                {/* Edge handles */}
                <div 
                  className="absolute top-0 left-3 right-3 h-1 cursor-n-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'n')}
                  style={{ background: 'linear-gradient(to bottom, hsl(var(--primary)) 0%, transparent 100%)' }}
                />
                <div 
                  className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                  style={{ background: 'linear-gradient(to top, hsl(var(--primary)) 0%, transparent 100%)' }}
                />
                <div 
                  className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'w')}
                  style={{ background: 'linear-gradient(to right, hsl(var(--primary)) 0%, transparent 100%)' }}
                />
                <div 
                  className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                  style={{ background: 'linear-gradient(to left, hsl(var(--primary)) 0%, transparent 100%)' }}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};