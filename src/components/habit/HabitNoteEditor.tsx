import React, { useState } from 'react';
import { Button, Textarea, Label } from '@/components/ui';
import { format, parseISO } from 'date-fns';

interface HabitNoteEditorProps {
  date: string;
  existingNote: string;
  isDarkMode: boolean;
  onSave: (note: string) => void;
  onClose: () => void;
}

export const HabitNoteEditor: React.FC<HabitNoteEditorProps> = ({
  date,
  existingNote,
  isDarkMode,
  onSave,
  onClose
}) => {
  const [note, setNote] = useState(existingNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim());
  };

  const formattedDate = format(parseISO(date), 'MMMM dd, yyyy');

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-3xl bg-black/40 flex items-center justify-center p-4">
      <div className={`w-full max-w-md backdrop-blur-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'} rounded-lg border shadow-2xl`}>
        <div className="p-4">
          <div className="mb-3">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Add Note
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              {formattedDate}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note" className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Note
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this day..."
                className="bg-white/20 border-white/30 backdrop-blur-md resize-none min-h-20 text-sm"
                rows={4}
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button 
                type="submit"
                className="flex-1 bg-cyan-mist hover:bg-cyan-mist-glow text-white border-0 h-9 text-sm"
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white/20 border-white/30 backdrop-blur-md h-9 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};