
import React, { useState, useRef, useEffect } from 'react';
import { 
  Textarea, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui';
import { Mission } from '@/hooks/useMissionManager';

interface MissionDescriptionProps {
  selectedMission: Mission | null;
  isDarkMode: boolean;
  clickCount: number;
  onHeaderClick: () => void;
  onMissionDescriptionUpdate: (missionId: string, description: string) => void;
  onManageAccountsClick: () => void;
  onWorkspaceClick: () => void;
  onSignOut: () => void;
}


const MissionDescription: React.FC<MissionDescriptionProps> = ({
  selectedMission,
  isDarkMode,
  clickCount,
  onHeaderClick,
  onMissionDescriptionUpdate,
  onManageAccountsClick,
  onWorkspaceClick,
  onSignOut
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDescription('');
  }, [selectedMission]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (selectedMission) {
      onMissionDescriptionUpdate(selectedMission.id, description);
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setDescription('');
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/10 border-l border-white/20 rounded-l-3xl mx-2 my-2">
      <div 
        className="p-6 border-b border-white/20 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onHeaderClick}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Mission Description
          </h2>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-auto">
        {selectedMission ? (
          <Card className={`mb-4 bg-white/5 backdrop-blur-md border border-white/20`}>
            <CardContent>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedMission.name}
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter mission description..."
                    className={`resize-none h-48 bg-white/5 backdrop-blur-md border border-white/20 ${isDarkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-800 placeholder:text-gray-500'}`}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="secondary" size="sm" onClick={handleCancelClick}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveClick}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {description || 'No description provided for this mission.'}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    Edit Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No mission selected.
          </p>
        )}
      </div>
    </div>
  );
};

export default MissionDescription;
