import React from 'react';
import { MoreVertical, Edit3, Trash2, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button } from '@/components/ui';
import { Task } from '@/types/task';

interface TemplateTaskDropdownProps {
  task: any;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
  onAddSubTask?: (parentId: string) => void;
  variant: 'calendar' | 'timeline';
  className?: string;
  triggerClassName?: string;
  showAddSubTask?: boolean;
  align?: 'start' | 'center' | 'end';
}

export const TemplateTaskDropdown: React.FC<TemplateTaskDropdownProps> = ({ 
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

  // Get the appropriate button styling based on variant
  const getButtonStyle = () => {
    const baseClass = triggerClassName || "";
    switch (variant) {
      case 'calendar':
        return `absolute top-1 right-1 p-1 h-6 w-6 rounded-sm bg-black/20 hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${baseClass}`;
      case 'timeline':
        return `flex-shrink-0 p-1 h-6 w-6 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 ${baseClass}`;
      default:
        return `p-1 h-6 w-6 hover:bg-white/20 flex-shrink-0 ${baseClass}`;
    }
  };

  // Get the appropriate dropdown styling
  const getDropdownStyle = () => {
    return "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-50";
  };

  // Get icon color for variants
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
          <MoreVertical className={`h-4 w-4 ${getIconColor()}`} />
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
            <Edit3 className="h-4 w-4" />
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