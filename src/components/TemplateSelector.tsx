import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { X, FileText, CheckSquare, Columns, Calendar, BarChart3, Grid3X3, LucideIcon } from 'lucide-react';

type TemplateId = 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';

interface TemplateSelectorProps {
  isDarkMode: boolean;
  onClose?: () => void;
  onSelect: (template: TemplateId) => void;
  isInline?: boolean;
}

const templates: { id: TemplateId; name: string; icon: LucideIcon | (() => JSX.Element); description: string }[] = [
  { id: 'notes', name: 'Notes', icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-6 sm:w-6">
      <rect x="4" y="6" width="16" height="2" rx="1"/>
      <rect x="4" y="11" width="16" height="2" rx="1"/>
      <rect x="4" y="16" width="10" height="2" rx="1"/>
    </svg>
  ), description: 'Simple note-taking format' },
  { id: 'task', name: 'Task', icon: CheckSquare, description: 'Task management layout' },
  { id: 'kanban', name: 'Kanban', icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-6 sm:w-6">
      <rect x="3" y="4" width="4" height="16" rx="2" className="fill-current"/>
      <rect x="10" y="6" width="4" height="8" rx="2" className="fill-current"/>
      <rect x="17" y="4" width="4" height="16" rx="2" className="fill-current"/>
    </svg>
  ), description: 'Board-based workflow' },
  { id: 'timeline', name: 'Timeline', icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-6 sm:w-6">
      <rect x="4" y="6" width="8" height="2" rx="1"/>
      <rect x="4" y="10" width="12" height="2" rx="1"/>
      <rect x="4" y="14" width="6" height="2" rx="1"/>
      <rect x="4" y="18" width="10" height="2" rx="1"/>
      <circle cx="3" cy="7" r="1"/>
      <circle cx="3" cy="11" r="1"/>
      <circle cx="3" cy="15" r="1"/>
      <circle cx="3" cy="19" r="1"/>
    </svg>
  ), description: 'Chronological view' },
  { id: 'calendar', name: 'Calendar', icon: () => (
    <img 
      src="/lovable-uploads/b273f989-257a-4ea6-a3e8-7654e6581de8.png" 
      alt="Calendar" 
      className="w-full h-full object-cover rounded-md"
    />
  ), description: 'Calendar view' },
  { id: 'matrix', name: 'Matrix', icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-6 sm:w-6">
      <rect x="4" y="4" width="7" height="7" rx="1" className="fill-green-400 opacity-60"/>
      <rect x="13" y="4" width="7" height="7" rx="1" className="fill-yellow-400 opacity-60"/>
      <rect x="4" y="13" width="7" height="7" rx="1" className="fill-gray-400 opacity-60"/>
      <rect x="13" y="13" width="7" height="7" rx="1" className="fill-red-400 opacity-60"/>
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ), description: 'Priority matrix' }
];

const TemplateButton = ({ template, onSelect, isInline }: { 
  template: typeof templates[0]; 
  onSelect: (id: TemplateId) => void; 
  isInline: boolean; 
}) => {
  const Icon = template.icon;
  const iconSize = isInline ? "h-4 w-4" : "h-6 w-6";
  const containerSize = isInline ? "w-6 h-6" : "w-8 h-8";
  const padding = isInline ? "p-2" : "p-3";
  const gap = isInline ? "gap-1" : "gap-2";

  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`flex flex-col items-center ${gap} ${padding} rounded-lg hover:bg-white/10 transition-colors group`}
      title={`${template.name} - ${template.description}`}
    >
      <div className={`${containerSize} flex items-center justify-center`}>
        {typeof Icon === 'function' ? 
          <Icon /> : 
          React.createElement(Icon, { className: `${iconSize} text-muted-foreground group-hover:text-primary transition-colors` })
        }
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
        {template.name}
      </span>
    </button>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onClose,
  onSelect,
  isInline = false
}) => {
  if (isInline) {
    return (
      <div className="border border-border rounded-lg p-4 shadow-lg">
        <div className="grid grid-cols-3 gap-3 w-48">
          {templates.map((template) => (
            <TemplateButton key={template.id} template={template} onSelect={onSelect} isInline />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl bg-background/10 border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">Select Template</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-background/20">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex justify-center gap-6">
            {templates.map((template) => (
              <TemplateButton key={template.id} template={template} onSelect={onSelect} isInline={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};