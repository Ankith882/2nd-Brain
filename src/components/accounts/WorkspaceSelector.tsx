
import React from 'react';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

interface WorkspaceSelectorProps {
  workspace: Workspace;
  isDarkMode: boolean;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ workspace, isDarkMode }) => {
  return (
    <div className="flex flex-col items-center space-y-2 mb-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg transition-all duration-200 cursor-pointer"
        style={{ backgroundColor: workspace.color }}
        title={`${workspace.name} - Click to manage workspaces`}
      >
        {workspace.imageUrl ? (
          <img 
            src={workspace.imageUrl} 
            alt={workspace.name} 
            className="w-full h-full rounded-lg object-cover" 
          />
        ) : (
          workspace.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className={`text-xs text-center max-w-16 truncate ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
        {workspace.name}
      </div>
    </div>
  );
};
