import { useState, useRef, useEffect, useCallback } from 'react';

export interface DraggableState {
  position: { x: number; y: number };
  isDragging: boolean;
  isRotating: boolean;
  rotation: number;
}

export interface DraggableOptions {
  initialPosition: { x: number; y: number };
  initialRotation?: number;
  bounds?: {
    width: number;
    height: number;
  };
  allowRotation?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useDraggable = (options: DraggableOptions) => {
  const {
    initialPosition,
    initialRotation = 0,
    bounds,
    allowRotation = true,
    onDragStart,
    onDragEnd
  } = options;

  const [position, setPosition] = useState(initialPosition);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const elementRef = useRef<HTMLElement>(null);
  const startPosition = useRef({ x: 0, y: 0 });
  const startMousePosition = useRef({ x: 0, y: 0 });
  const startRotation = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    setIsDragging(true);
    startPosition.current = { ...position };
    startMousePosition.current = { x: touch.clientX, y: touch.clientY };
    onDragStart?.();
  }, [position, onDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - startMousePosition.current.x;
      const deltaY = touch.clientY - startMousePosition.current.y;
      
      const newX = startPosition.current.x + deltaX;
      const newY = startPosition.current.y + deltaY;
      
      // Apply bounds if specified
      const finalX = bounds ? Math.max(0, Math.min(bounds.width, newX)) : newX;
      const finalY = bounds ? Math.max(0, Math.min(bounds.height, newY)) : newY;
      
      setPosition({ x: finalX, y: finalY });
    }
  }, [isDragging, bounds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (allowRotation && e.shiftKey) {
      // Rotation mode
      setIsRotating(true);
      startRotation.current = rotation;
      
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        startMousePosition.current = { x: angle, y: 0 };
      }
    } else {
      // Drag mode
      setIsDragging(true);
      startPosition.current = { ...position };
      startMousePosition.current = { x: e.clientX, y: e.clientY };
      onDragStart?.();
    }
  }, [position, rotation, allowRotation, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isRotating && allowRotation) {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const deltaAngle = (angle - startMousePosition.current.x) * (180 / Math.PI);
        setRotation(startRotation.current + deltaAngle);
      }
    } else if (isDragging) {
      const deltaX = e.clientX - startMousePosition.current.x;
      const deltaY = e.clientY - startMousePosition.current.y;
      
      const newX = startPosition.current.x + deltaX;
      const newY = startPosition.current.y + deltaY;
      
      // Apply bounds if specified
      const finalX = bounds ? Math.max(0, Math.min(bounds.width, newX)) : newX;
      const finalY = bounds ? Math.max(0, Math.min(bounds.height, newY)) : newY;
      
      setPosition({ x: finalX, y: finalY });
    }
  }, [isDragging, isRotating, allowRotation, bounds]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragEnd?.();
    }
    setIsDragging(false);
    setIsRotating(false);
  }, [isDragging, onDragEnd]);

  useEffect(() => {
    if (isDragging || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      // Prevent page scrolling during drag/rotate
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
  }, [isDragging, isRotating, handleMouseMove, handleMouseUp]);

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
    setRotation(initialRotation);
  }, [initialPosition, initialRotation]);

  const state: DraggableState = {
    position,
    isDragging,
    isRotating,
    rotation
  };

  return {
    state,
    elementRef,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    setPosition,
    setRotation
  };
};