import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DragState {
  isDragging: boolean;
}

export const useDraggablePanel = (
  initialPosition: Position,
  initialSize: Size
) => {
  const [position, setPosition] = useState(initialPosition);
  const [size] = useState(initialSize);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false
  });

  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startMousePos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, action: 'drag') => {
    e.preventDefault();
    e.stopPropagation();

    if (action === 'drag') {
      setDragState({ isDragging: true });
      startPos.current = { ...position };
      startMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent, action: 'drag') => {
    e.preventDefault();
    e.stopPropagation();

    if (action === 'drag') {
      const touch = e.touches[0];
      setDragState({ isDragging: true });
      startPos.current = { ...position };
      startMousePos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragState.isDragging) {
      const deltaX = e.clientX - startMousePos.current.x;
      const deltaY = e.clientY - startMousePos.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, startPos.current.x + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, startPos.current.y + deltaY));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (dragState.isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - startMousePos.current.x;
      const deltaY = touch.clientY - startMousePos.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, startPos.current.x + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, startPos.current.y + deltaY));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false });
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      // Prevent page scrolling during drag
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
  }, [dragState, position, size]);

  return {
    position,
    size,
    handleMouseDown,
    handleTouchStart,
    isDragging: dragState.isDragging
  };
};