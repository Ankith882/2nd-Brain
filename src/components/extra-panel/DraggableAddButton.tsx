import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

interface DraggableAddButtonProps {
  onClick: () => void;
  isDarkMode: boolean;
}

export const DraggableAddButton: React.FC<DraggableAddButtonProps> = ({ onClick, isDarkMode }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastClickTime = useRef<number>(0);
  const [touchStarted, setTouchStarted] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const container = containerRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          
          // Check if mobile view
          const isMobile = window.innerWidth < 768;
          
          if (isMobile) {
            // Mobile: Position in extreme left corner of footer
            setPosition({
              x: 16, // Left edge margin
              y: window.innerHeight - 80 // Footer bottom area
            });
          } else {
            // Desktop: Position beside Mission Title in Details Panel (top area, right side)
            setPosition({
              x: containerRect.width - 200, // Position more towards center-right
              y: 80 // Top area beside mission title
            });
          }
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if (touchStarted) return; // Prevent mouse events after touch
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    e.preventDefault();
    e.stopPropagation();
  }, [touchStarted]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStarted(true);
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    
    // Reset touch flag after a delay to allow future mouse events
    setTimeout(() => setTouchStarted(false), 500);
    
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      // Ultra-smooth: position button exactly where cursor is, accounting for button center
      const buttonSize = 56; // 14 * 4px = 56px
      
      // Ultra-smooth positioning with sub-pixel precision
      setPosition({ 
        x: e.clientX - buttonSize / 2, 
        y: e.clientY - buttonSize / 2 
      });
    });
  }, [isDragging]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      const touch = e.touches[0];
      const buttonSize = 56;
      
      setPosition({ 
        x: touch.clientX - buttonSize / 2, 
        y: touch.clientY - buttonSize / 2 
      });
    });
  }, [isDragging]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    // Prevent duplicate clicks within 300ms
    if (now - lastClickTime.current < 300) {
      return;
    }
    lastClickTime.current = now;
    onClick();
  }, [onClick]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Check if it was a click (minimal movement)
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);
    
    if (deltaX < 5 && deltaY < 5) {
      handleClick();
    }
  }, [isDragging, dragStart, handleClick]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Check if it was a tap (minimal movement)
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - dragStart.x);
    const deltaY = Math.abs(touch.clientY - dragStart.y);
    
    if (deltaX < 5 && deltaY < 5) {
      handleClick();
    }
  }, [isDragging, dragStart, handleClick]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.body.style.overflow = 'hidden';
      // Optimize for ultra-smooth dragging
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.touchAction = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
      document.body.style.overflow = '';
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.style.touchAction = '';
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
    >
      <Button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          fixed w-14 h-14 rounded-full shadow-lg transition-all pointer-events-auto
          ${isDragging 
            ? 'scale-110 shadow-2xl shadow-cyan-mist-glow/40 will-change-transform' 
            : 'hover:scale-105 hover:shadow-xl hover:shadow-cyan-mist-glow/30 transition-all duration-300'
          }
          bg-cyan-mist/20 border border-cyan-mist/40
          text-charcoal cursor-${isDragging ? 'grabbing' : 'grab'}
          hover:bg-cyan-mist/30 hover:border-cyan-mist/60 hover:text-charcoal
        `}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isDragging ? 'rotate(45deg)' : 'rotate(0deg)',
          willChange: isDragging ? 'transform, left, top' : 'auto',
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};