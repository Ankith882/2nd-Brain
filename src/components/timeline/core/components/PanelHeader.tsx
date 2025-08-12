import React from 'react';
import { CardHeader, CardTitle, Button } from '@/components/ui';
import { GripVertical, X, Minimize2 } from 'lucide-react';
import { PanelHeaderProps } from '../types/panel';

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  icon: Icon,
  onClose,
  onMinimize,
  onMouseDown,
  className = ''
}) => {
  return (
    <CardHeader 
      className={`pb-2 px-3 py-2 bg-white/5 dark:bg-black/5 backdrop-blur-sm rounded-t-xl border-b border-white/10 cursor-move flex flex-row items-center justify-between ${className}`}
      onMouseDown={onMouseDown}
    >
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        <div className="p-1 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-lg border border-primary/30 shadow-sm">
          <Icon className="h-3 w-3 text-primary drop-shadow-sm" />
        </div>
        {title}
      </CardTitle>
      
      <div className="flex items-center gap-1">
        {onMinimize && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        )}
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        <GripVertical className="h-4 w-4 text-muted-foreground/60" />
      </div>
    </CardHeader>
  );
};