import { CalendarViewType } from './CalendarTemplate';

interface CalendarFooterProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  isDarkMode: boolean;
}

export const CalendarFooter = ({ currentView, onViewChange, isDarkMode }: CalendarFooterProps) => {
  const views: { key: CalendarViewType; label: string }[] = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-center p-4">
        <div className="flex bg-secondary rounded-lg p-1">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => onViewChange(view.key)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                currentView === view.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};