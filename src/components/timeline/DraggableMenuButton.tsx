import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { BarChart3, Settings } from 'lucide-react';

interface DraggableMenuButtonProps {
  onModeChange: (mode: 'analytics' | 'categories') => void;
  currentMode: 'analytics' | 'categories';
  isDarkMode: boolean;
}

const BUTTON_SIZE = 100;

export const DraggableMenuButton: React.FC<DraggableMenuButtonProps> = ({
  onModeChange,
  currentMode
}) => {
  // Load position from localStorage or use default position near Avatar in Mission Header
  const getInitialPosition = () => {
    const saved = localStorage.getItem('draggable-menu-position');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default position: near Avatar in Mission Header
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      // Mobile: Position in top-right area near avatar
      return { x: window.innerWidth - 120, y: 60 };
    } else {
      // Desktop: Position near mission header avatar area
      return { x: window.innerWidth - 200, y: 80 };
    }
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [rotation, setRotation] = useState(() => {
    const saved = localStorage.getItem('draggable-menu-rotation');
    return saved ? JSON.parse(saved) : 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const startPosition = useRef({ x: 0, y: 0 });
  const startMousePosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (e.shiftKey) {
      setIsRotating(true);
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startMousePosition.current = { x: e.clientX - centerX, y: e.clientY - centerY };
      }
    } else {
      setIsDragging(true);
      startPosition.current = { ...position };
      startMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Two finger touch for rotation
      setIsRotating(true);
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const touch = e.touches[0];
        startMousePosition.current = { x: touch.clientX - centerX, y: touch.clientY - centerY };
      }
    } else {
      // Single finger touch for dragging
      const touch = e.touches[0];
      setIsDragging(true);
      startPosition.current = { ...position };
      startMousePosition.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startMousePosition.current.x;
      const deltaY = e.clientY - startMousePosition.current.y;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - BUTTON_SIZE, startPosition.current.x + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, startPosition.current.y + deltaY))
      });
    } else if (isRotating) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentX = e.clientX - centerX;
        const currentY = e.clientY - centerY;
        const startAngle = Math.atan2(startMousePosition.current.y, startMousePosition.current.x);
        const currentAngle = Math.atan2(currentY, currentX);
        const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
        setRotation(prev => (prev + deltaAngle) % 360);
        startMousePosition.current = { x: currentX, y: currentY };
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startMousePosition.current.x;
      const deltaY = touch.clientY - startMousePosition.current.y;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - BUTTON_SIZE, startPosition.current.x + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE, startPosition.current.y + deltaY))
      });
    } else if (isRotating && e.touches.length === 2) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const touch = e.touches[0];
        const currentX = touch.clientX - centerX;
        const currentY = touch.clientY - centerY;
        const startAngle = Math.atan2(startMousePosition.current.y, startMousePosition.current.x);
        const currentAngle = Math.atan2(currentY, currentX);
        const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
        setRotation(prev => (prev + deltaAngle) % 360);
        startMousePosition.current = { x: currentX, y: currentY };
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Save position to localStorage when dragging ends
      localStorage.setItem('draggable-menu-position', JSON.stringify(position));
    }
    if (isRotating) {
      // Save rotation to localStorage when rotating ends
      localStorage.setItem('draggable-menu-rotation', JSON.stringify(rotation));
    }
    setIsDragging(false);
    setIsRotating(false);
  };

  useEffect(() => {
    if (isDragging || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isRotating]);

  const buttonClass = (mode: string) => `px-2 py-1 h-6 w-6 transition-all rounded-full ${
    currentMode === mode 
      ? 'bg-primary/20 text-primary border border-primary/30' 
      : 'text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30'
  }`;

  return (
    <div 
      ref={buttonRef} 
      className="fixed z-50 cursor-move select-none pointer-events-auto" 
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`,
        userSelect: 'none'
      }} 
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="flex bg-background/5 backdrop-blur-2xl border border-border/30 rounded-full shadow-2xl px-1 py-0.5">
        <Button 
          onClick={() => onModeChange('analytics')} 
          variant={currentMode === 'analytics' ? 'default' : 'ghost'} 
          size="sm" 
          className={buttonClass('analytics')}
          title="Analytics View (Shift+Click to rotate menu)"
        >
          <BarChart3 className="h-3 w-3" />
        </Button>
        <Button 
          onClick={() => onModeChange('categories')} 
          variant={currentMode === 'categories' ? 'default' : 'ghost'} 
          size="sm" 
          className={buttonClass('categories')}
          title="Categories Management"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};