import React from 'react';
import { MoreVertical, Edit3, Trash2, Plus, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button } from '@/components/ui';
import { Task } from '@/types/task';

interface UnifiedTaskDropdownProps {
  task?: any;
  onEdit?: (task?: any) => void;
  onDelete?: (taskId: string) => void;
  onAddSubTask?: (parentId: string) => void;
  variant: 'kanban' | 'matrix' | 'timeline' | 'calendar' | 'common';
  className?: string;
  triggerClassName?: string;
  showAddSubTask?: boolean;
  align?: 'start' | 'center' | 'end';
}

export const UnifiedTaskDropdown: React.FC<UnifiedTaskDropdownProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onAddSubTask, 
  variant,
  className = "",
  triggerClassName = "",
  showAddSubTask = true,
  align = 'end'
}) => {
  const handleMenuAction = (action: 'addSubTask' | 'edit' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'addSubTask': 
        if (task?.id) onAddSubTask?.(task.id); 
        break;
      case 'edit': 
        onEdit?.(task); 
        break;
      case 'delete': 
        if (task?.id) onDelete?.(task.id); 
        break;
    }
  };

  // Get the appropriate icon based on variant
  const getIcon = () => {
    return <MoreVertical className="h-2.5 w-2.5" />;
  };

  // Get the appropriate button styling based on variant
  const getButtonStyle = () => {
    const baseClass = triggerClassName || "";
    switch (variant) {
      case 'kanban':
        return `p-0.5 h-4 w-4 hover:bg-white/20 flex-shrink-0 ${baseClass}`;
      case 'matrix':
        return className?.includes('relative') 
          ? `p-0.5 h-3 w-3 hover:bg-gray-200 opacity-60 hover:opacity-100 ${baseClass}` 
          : `absolute bottom-1 right-1 p-0.5 h-3 w-3 hover:bg-gray-200 opacity-60 hover:opacity-100 ${baseClass}`;
      case 'timeline':
        return `flex-shrink-0 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 ${baseClass}`;
      case 'calendar':
        return `absolute top-1 right-1 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 z-10 ${baseClass}`;
      case 'common':
        return `p-0.5 bg-white/10 backdrop-blur-md flex-shrink-0 ${baseClass}`;
      default:
        return `p-0.5 h-4 w-4 hover:bg-white/20 flex-shrink-0 ${baseClass}`;
    }
  };

  // Get the appropriate dropdown styling based on variant
  const getDropdownStyle = () => {
    const baseStyle = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl";
    const zIndex = variant === 'calendar' ? "z-[150]" : "z-50";
    return `${baseStyle} ${zIndex}`;
  };

  // Get icon color for timeline/calendar variants
  const getIconColor = () => {
    if (variant === 'timeline' || variant === 'calendar') {
      return "text-white";
    }
    return "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`${getButtonStyle()} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={getIconColor()}>
            {getIcon()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={getDropdownStyle()} align={align}>
        {showAddSubTask && onAddSubTask && (
          <DropdownMenuItem 
            onClick={(e) => handleMenuAction('addSubTask', e)}
            className="flex items-center gap-2 cursor-pointer hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Sub Task
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem 
            onClick={(e) => handleMenuAction('edit', e)}
            className="flex items-center gap-2 cursor-pointer hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-200"
          >
            {variant === 'matrix' ? <Edit className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            Edit
          </DropdownMenuItem>
        )}
        
        {onDelete && (
          <DropdownMenuItem 
            onClick={(e) => handleMenuAction('delete', e)}
            className="flex items-center gap-2 cursor-pointer hover:bg-red-500/30 hover:backdrop-blur-sm text-red-300 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};