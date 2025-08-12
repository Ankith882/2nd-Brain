import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { GripVertical, LucideIcon } from 'lucide-react';
import { useDraggablePanel } from '@/hooks/useDraggablePanel';


interface DraggablePanelProps {
  children: React.ReactNode;
  title: string;
  icon: LucideIcon;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  minSize?: { width: number; height: number };
  className?: string;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  title,
  icon: Icon,
  initialPosition,
  initialSize,
  minSize,
  className = ''
}) => {
  const { position, size, handleMouseDown, handleTouchStart } = useDraggablePanel(
    initialPosition,
    initialSize
  );

  return (
    <Card
      className={`fixed z-50 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl select-none ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      
      
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