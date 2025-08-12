import React, { memo } from 'react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

interface KanbanGridDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gridColumns: number | string;
  gridRows: number | string;
  onGridColumnsChange: (value: number | string) => void;
  onGridRowsChange: (value: number | string) => void;
  onCreateGrid: () => void;
  isDarkMode: boolean;
}

export const KanbanGridDialog = memo<KanbanGridDialogProps>(({
  isOpen,
  onClose,
  gridColumns,
  gridRows,
  onGridColumnsChange,
  onGridRowsChange,
  onCreateGrid,
  isDarkMode
}) => {
  const handleNumberInput = (value: string, setter: (value: number | string) => void, max: number) => {
    if (value === '') {
      setter('');
    } else {
      const num = Math.max(1, Math.min(max, parseInt(value) || 1));
      setter(num);
    }
  };

  const handleBlur = (value: string, setter: (value: number | string) => void, max: number) => {
    if (value === '') {
      setter(1);
    } else {
      const num = Math.max(1, Math.min(max, parseInt(value) || 1));
      setter(num);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/80 border-white/20">
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>
            Create Grid Layout
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Columns
            </label>
            <Input
              type="number"
              value={gridColumns}
              onChange={(e) => handleNumberInput(e.target.value, onGridColumnsChange, 10)}
              onBlur={(e) => handleBlur(e.target.value, onGridColumnsChange, 10)}
              min={1}
              max={10}
              className="bg-white/10 border-white/20"
            />
          </div>
          
          <div>
            <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Rows
            </label>
            <Input
              type="number"
              value={gridRows}
              onChange={(e) => handleNumberInput(e.target.value, onGridRowsChange, 5)}
              onBlur={(e) => handleBlur(e.target.value, onGridRowsChange, 5)}
              min={1}
              max={5}
              className="bg-white/10 border-white/20"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            Note: A "Completed" column will be automatically added as the last column.
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onCreateGrid}>
              Create Grid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

KanbanGridDialog.displayName = 'KanbanGridDialog';