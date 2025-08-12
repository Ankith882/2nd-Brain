import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart, Circle, Eye, EyeOff, GripHorizontal } from 'lucide-react';
import { Card } from '@/components/ui';

interface DraggableFooterControlsProps {
  chartType: string;
  onChartTypeChange: (type: string) => void;
  timeMode: string;
  onTimeModeChange: (mode: string) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  isDarkMode: boolean;
}

export const DraggableFooterControls: React.FC<DraggableFooterControlsProps> = ({
  chartType,
  onChartTypeChange,
  timeMode,
  onTimeModeChange,
  showDetails,
  onToggleDetails,
  isDarkMode
}) => {
  const [position, setPosition] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return {
      x: window.innerWidth - (isMobile ? 350 : 400) - 16,
      y: 20
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const chartOptions = [
    { value: 'circular', label: 'Circular', icon: PieChart },
    { value: '3d-cylinder', label: 'Cylinder', icon: BarChart3 },
    { value: 'bubble', label: 'Bubble', icon: Circle }
  ];

  const timeModeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
    { value: 'selected', label: 'Selected' }
  ];

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
      
      // Mobile-aware constraints
      const isMobile = window.innerWidth < 768;
      const margin = isMobile ? 8 : 4;
      const componentWidth = containerRef.current?.offsetWidth || (isMobile ? 350 : 400);
      const componentHeight = containerRef.current?.offsetHeight || 60;
      
      const maxX = window.innerWidth - componentWidth - margin;
      const maxY = window.innerHeight - componentHeight - margin;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(margin, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (isDragging) {
      e.preventDefault();
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Mobile-aware constraints
      const isMobile = window.innerWidth < 768;
      const margin = isMobile ? 8 : 4;
      const componentWidth = containerRef.current?.offsetWidth || (isMobile ? 350 : 400);
      const componentHeight = containerRef.current?.offsetHeight || 60;
      
      const maxX = window.innerWidth - componentWidth - margin;
      const maxY = window.innerHeight - componentHeight - margin;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(margin, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.overflow = '';
        document.documentElement.style.touchAction = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <Card
      ref={containerRef}
      className={`fixed z-50 bg-white/5 dark:bg-black/10 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl select-none rounded-full transition-all duration-300 hover:bg-white/10 hover:dark:bg-black/15 ${
        isDragging ? 'transition-none scale-102' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: isDragging
          ? '0 20px 40px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--border))'
          : isDarkMode
            ? '0 8px 20px -6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 20px -6px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="px-3 py-1.5">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div 
            className="drag-handle cursor-grab active:cursor-grabbing flex items-center text-muted-foreground/60 p-1 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 hover:dark:bg-black/20 transition-colors"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <GripHorizontal className="h-3 w-3" />
          </div>
          {/* Chart Type Buttons */}
          <div className="flex gap-1">
            {chartOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={chartType === value ? 'default' : 'secondary'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChartTypeChange(value);
                }}
                className={`w-8 h-8 p-0 pointer-events-auto transition-all duration-300 rounded-full ${
                  chartType === value 
                    ? 'bg-primary/80 hover:bg-primary shadow-lg scale-105 border-primary/60' 
                    : 'bg-secondary/60 hover:bg-secondary border-border/30 hover:scale-105'
                } backdrop-blur-md border shadow-sm`}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>

          {/* Time Period Select */}
          <div className="pointer-events-auto">
            <Select value={timeMode} onValueChange={onTimeModeChange}>
              <SelectTrigger className="w-20 h-8 text-xs bg-white/5 dark:bg-black/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/15 hover:dark:bg-black/20 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl">
                {timeModeOptions.map(({ value, label }) => (
                  <SelectItem 
                    key={value} 
                    value={value} 
                    className="text-xs hover:bg-white/20 hover:dark:bg-black/30 rounded-lg transition-all duration-200"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details Toggle */}
          <Button
            variant={showDetails ? 'default' : 'secondary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDetails();
            }}
            className={`w-8 h-8 p-0 pointer-events-auto transition-all duration-300 rounded-full ${
              showDetails 
                ? 'bg-primary/80 hover:bg-primary shadow-lg scale-105 border-primary/60' 
                : 'bg-secondary/60 hover:bg-secondary border-border/30 hover:scale-105'
            } backdrop-blur-md border shadow-sm`}
            title={showDetails ? 'Hide Details' : 'Show Details'}
          >
            {showDetails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};