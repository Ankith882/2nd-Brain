import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calendar, GripVertical } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { format } from 'date-fns';
import { getProgressColor } from '@/utils/progressColors';

interface EnhancedDatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isDarkMode: boolean;
  tasksData?: any[];
  dateColors?: {[key: string]: string};
  getTasksForDate?: (date: Date) => any[];
  selectedTemplate?: string;
  onDateColorChange?: (dateKey: string, color: string) => void;
}

// Optimized constants to avoid recreation
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MIN_DIMS = { width: typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 320, height: typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 360 };
const DEFAULT_DIMS = { width: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(window.innerWidth - 32, 360) : 400, height: typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(window.innerHeight - 120, 420) : 480 };

// Utility functions moved outside component for performance
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const generateYears = () => Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  selectedDate,
  onDateSelect,
  isDarkMode,
  tasksData = [],
  dateColors = {},
  getTasksForDate,
  selectedTemplate = 'task',
  onDateColorChange
}) => {
  // Optimized state management
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [currentYear, setCurrentYear] = useState(() => selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate.getMonth());
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_DIMS;
    const isMobile = window.innerWidth < 768;
    return {
      width: isMobile ? Math.min(window.innerWidth - 32, 360) : 400,
      height: isMobile ? Math.min(window.innerHeight - 120, 420) : 480
    };
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerDate, setColorPickerDate] = useState<Date | null>(null);
  const [selectedDotColor, setSelectedDotColor] = useState('#00FF00');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // Memoized calculations for performance
  const formattedDate = useMemo(() => format(selectedDate, 'PPP'), [selectedDate]);
  const years = useMemo(() => generateYears(), []);
  
  const { cellSize, gapSize, fontSize } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const padding = isMobile ? 32 : 48;
    const headerHeight = isMobile ? 100 : 120;
    
    const availableWidth = dimensions.width - padding;
    const availableHeight = dimensions.height - headerHeight;
    const calculatedCellSize = Math.min(Math.floor(availableWidth / 7), Math.floor(availableHeight / 8));
    const finalCellSize = Math.max(isMobile ? 28 : 32, Math.min(calculatedCellSize, isMobile ? 48 : 64));
    
    return {
      cellSize: finalCellSize,
      gapSize: Math.max(1, Math.floor(finalCellSize * 0.05)),
      fontSize: Math.max(10, finalCellSize * (isMobile ? 0.35 : 0.3))
    };
  }, [dimensions]);

  // Optimized event handlers
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowColorPicker(false);
    setColorPickerDate(null);
  }, []);

  const handleDateClick = useCallback((day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
    handleClose();
  }, [currentYear, currentMonth, onDateSelect, handleClose]);

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (viewMode === 'days') {
      if (direction === 'prev') {
        setCurrentMonth(prev => prev === 0 ? 11 : prev - 1);
        if (currentMonth === 0) setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev === 11 ? 0 : prev + 1);
        if (currentMonth === 11) setCurrentYear(prev => prev + 1);
      }
    } else if (viewMode === 'months') {
      setCurrentYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
    }
  }, [viewMode, currentMonth]);

  // Optimized task checking with memoization
  const taskCache = useMemo(() => {
    const cache = new Map();
    tasksData.forEach(task => {
      const dateStr = task.startTime?.toDateString() || task.date?.toDateString();
      if (dateStr) {
        if (!cache.has(dateStr)) cache.set(dateStr, []);
        cache.get(dateStr).push(task);
      }
    });
    return cache;
  }, [tasksData]);

  const hasTasksForDate = useCallback((day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (getTasksForDate) return getTasksForDate(date).length > 0;
    return taskCache.has(date.toDateString());
  }, [currentYear, currentMonth, getTasksForDate, taskCache]);

  const getProgressPercentage = useCallback((day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    let tasks;
    
    if (getTasksForDate) {
      tasks = getTasksForDate(date);
    } else {
      tasks = taskCache.get(date.toDateString()) || [];
    }
    
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [currentYear, currentMonth, getTasksForDate, taskCache]);

  // Position calculation with throttling
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const { innerWidth: vw, innerHeight: vh } = window;
      
      const spaceRight = vw - rect.right;
      const spaceLeft = rect.left;
      
      let x, y;
      const isMobile = vw < 768;
      const margin = isMobile ? 16 : 8;
      
      if (!isMobile && spaceRight >= dimensions.width + 16) {
        x = rect.right + margin;
        y = rect.top;
      } else if (!isMobile && spaceLeft >= dimensions.width + 16) {
        x = rect.left - dimensions.width - margin;
        y = rect.top;
      } else {
        // Center on mobile, or fallback position on desktop
        x = isMobile ? margin : Math.max(margin, Math.min(rect.left, vw - dimensions.width - margin));
        y = isMobile ? Math.max(60, rect.bottom + margin) : rect.bottom + margin;
      }
      
      if (y + dimensions.height > vh - margin) {
        y = Math.max(isMobile ? 60 : margin, vh - dimensions.height - margin);
      }
      
      setPosition({ x, y });
    };

    updatePosition();
  }, [isOpen, dimensions]);

  // Optimized resize handler
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      rafRef.current = requestAnimationFrame(() => {
        if (!popupRef.current) return;
        const rect = popupRef.current.getBoundingClientRect();
        const newWidth = Math.max(MIN_DIMS.width, e.clientX - rect.left);
        const newHeight = Math.max(MIN_DIMS.height, e.clientY - rect.top);
        setDimensions({ width: newWidth, height: newHeight });
      });
    };

    const handleMouseUp = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if color picker is open or if clicking inside color picker
      if (showColorPicker) return;
      
      if (popupRef.current && !popupRef.current.contains(target) && 
          buttonRef.current && !buttonRef.current.contains(target)) {
        handleClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose, showColorPicker]);

  // Long press handlers
  const handleMouseDown = useCallback((day: number) => {
    if (longPressTimer) clearTimeout(longPressTimer);
    
    const timer = setTimeout(() => {
      const date = new Date(currentYear, currentMonth, day);
      if (hasTasksForDate(day)) {
        setColorPickerDate(date);
        const dateKey = date.toISOString().split('T')[0];
        setSelectedDotColor(dateColors[dateKey] || '#00FF00');
        setShowColorPicker(true);
      }
    }, 800);

    setLongPressTimer(timer);
  }, [currentYear, currentMonth, hasTasksForDate, dateColors, longPressTimer]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Optimized day rendering
  const dayElements = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const elements = [];
    const currentDate = new Date();

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      elements.push(<div key={`empty-${i}`} style={{ width: cellSize, height: cellSize }} />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentMonth && 
                        selectedDate.getFullYear() === currentYear;
      const hasTasks = hasTasksForDate(day);
      const dayDate = new Date(currentYear, currentMonth, day);
      const isCurrentOrPast = dayDate <= currentDate;
      
      const progressPercentage = hasTasks ? getProgressPercentage(day) : 0;
      const progressColor = getProgressColor(progressPercentage);
      
      const dateKey = dayDate.toISOString().split('T')[0];
      const dotColor = dateColors[dateKey] || '#00FF00';

      elements.push(
        <div key={day} className="relative flex items-center justify-center" style={{ width: cellSize, height: cellSize }}>
          {hasTasks && selectedTemplate === 'task' && isCurrentOrPast && (
            <div className="absolute inset-0 rounded-full overflow-hidden border border-white/20" style={{ width: cellSize, height: cellSize }}>
              <div 
                className="absolute bottom-0 left-0 right-0"
                style={{ 
                  height: `${Math.max(progressPercentage, 15)}%`,
                  backgroundColor: progressColor,
                  borderRadius: `0 0 ${cellSize/2}px ${cellSize/2}px`,
                  opacity: 0.85,
                  filter: 'brightness(1.3) saturate(1.2)'
                }}
              />
            </div>
          )}
          
          <button
            onClick={() => handleDateClick(day)}
            onMouseDown={() => handleMouseDown(day)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={() => handleMouseDown(day)}
            onTouchEnd={handleMouseUp}
            className={`rounded-full font-medium transition-all duration-300 flex items-center justify-center relative z-10 ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : isDarkMode 
                  ? 'text-foreground hover:bg-accent' 
                  : 'text-foreground hover:bg-accent'
            } ${hasTasks && selectedTemplate === 'task' ? 'bg-transparent' : ''}`}
            style={{ 
              width: cellSize, 
              height: cellSize,
              fontSize: `${fontSize}px`,
              textShadow: hasTasks && selectedTemplate === 'task' && isCurrentOrPast ? '0 1px 2px rgba(0,0,0,0.8)' : 'none'
            }}
          >
            {day}
          </button>
          
          {hasTasks && selectedTemplate !== 'task' && (
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 rounded-full transition-all duration-200 z-20"
              style={{ 
                backgroundColor: dotColor,
                boxShadow: `0 ${Math.max(1, cellSize * 0.02)}px ${Math.max(2, cellSize * 0.05)}px rgba(0,0,0,0.3)`,
                bottom: `${Math.max(3, cellSize * 0.08)}px`,
                width: `${Math.max(8, Math.min(cellSize * 0.2, 12))}px`,
                height: `${Math.max(8, Math.min(cellSize * 0.2, 12))}px`
              }}
            />
          )}
        </div>
      );
    }

    return elements;
  }, [currentYear, currentMonth, selectedDate, cellSize, hasTasksForDate, getProgressPercentage, selectedTemplate, dateColors, isDarkMode, handleDateClick, handleMouseDown, handleMouseUp]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={handleToggle}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-background/10 border-border/20"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {formattedDate}
      </Button>

      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[99] backdrop-blur-sm bg-black/20 dark:bg-black/40"
            onClick={handleClose}
          />
          <div
            ref={popupRef}
            className="fixed z-[100] pointer-events-auto"
            style={{ left: position.x, top: position.y, width: dimensions.width, height: dimensions.height }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border-white/20 dark:border-white/10 h-full flex flex-col shadow-2xl">
              <CardContent className="p-3 md:p-6 flex-1 flex flex-col overflow-hidden bg-transparent">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 md:mb-4 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleNavigation('prev')} className="hover:bg-accent">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <button
                    onClick={() => {
                      if (viewMode === 'days') setViewMode('months');
                      else if (viewMode === 'months') setViewMode('years');
                    }}
                    className="font-medium text-foreground hover:underline text-sm md:text-base"
                  >
                    {viewMode === 'days' && `${MONTH_NAMES[currentMonth]} ${currentYear}`}
                    {viewMode === 'months' && currentYear}
                    {viewMode === 'years' && 'Select Year'}
                  </button>

                  <Button variant="ghost" size="sm" onClick={() => handleNavigation('next')} className="hover:bg-accent">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 overflow-auto">
                  {viewMode === 'days' && (
                    <div>
                      <div className="grid grid-cols-7 mb-2 md:mb-3" style={{ gap: `${gapSize}px` }}>
                        {DAYS.map(day => (
                          <div 
                            key={day}
                            className="text-center text-xs font-semibold text-muted-foreground flex items-center justify-center"
                            style={{ 
                              width: cellSize, 
                              height: Math.max(20, cellSize * 0.6),
                              fontSize: `${Math.max(8, cellSize * 0.25)}px`
                            }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7" style={{ gap: `${gapSize}px` }}>
                        {dayElements}
                      </div>
                    </div>
                  )}

                  {viewMode === 'months' && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {MONTHS.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => { setCurrentMonth(index); setViewMode('days'); }}
                          className={`p-2 rounded text-sm hover:bg-accent transition-colors ${
                            currentMonth === index ? 'bg-primary/20' : ''
                          } text-foreground`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}

                  {viewMode === 'years' && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {years.map(year => (
                        <button
                          key={year}
                          onClick={() => { setCurrentYear(year); setViewMode('months'); }}
                          className={`p-2 rounded text-sm hover:bg-accent transition-colors ${
                            currentYear === year ? 'bg-primary/20' : ''
                          } text-foreground`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resize Handle */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize flex items-center justify-center hover:bg-accent rounded-tl"
                  onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground rotate-45" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Picker Modal */}
          {showColorPicker && (
            <div 
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
              onClick={(e) => {
                // Only close if clicking the backdrop, not the color picker itself
                if (e.target === e.currentTarget) {
                  setShowColorPicker(false);
                  setColorPickerDate(null);
                }
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <ColorPicker
                  selectedColor={selectedDotColor}
                  onColorSelect={setSelectedDotColor}
                  onApply={() => {
                    if (colorPickerDate && onDateColorChange) {
                      const dateKey = colorPickerDate.toISOString().split('T')[0];
                      onDateColorChange(dateKey, selectedDotColor);
                    }
                    setShowColorPicker(false);
                    setColorPickerDate(null);
                  }}
                  onClose={() => { setShowColorPicker(false); setColorPickerDate(null); }}
                  className="max-w-sm"
                />
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};