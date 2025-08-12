import React, { useState } from 'react';
import { Plus, MoreVertical, ChevronRight, ChevronDown, Edit, Trash2, GripVertical } from 'lucide-react';
import { 
  Button, 
  Card, 
  ScrollArea, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui';
import { Mission } from '@/hooks/useMissionManager';
import { Task } from '@/types/task';
import { EditMissionForm } from '../mission/EditMissionForm';
import { LiveTaskCounter } from '../mission/LiveTaskCounter';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
interface MissionListProps {
  missions: Mission[];
  selectedMission: Mission | null;
  isDarkMode: boolean;
  tasks: Task[] | undefined;
  selectedDate: Date;
  highlightedMissionId?: string;
  onMissionSelect: (mission: Mission) => void;
  onAddMission: () => void;
  onAddSubMission: (parentId: string, mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'targets' | 'order' | 'parentId'>) => void;
  onUpdateMission: (id: string, updates: Partial<Mission>) => void;
  onDeleteMission: (id: string) => void;
  onToggleExpanded: (id: string) => void;
}
interface SortableMissionCardProps {
  mission: Mission;
  level: number;
  selectedMission: Mission | null;
  isDarkMode: boolean;
  tasks: Task[] | undefined;
  selectedDate: Date;
  highlightedMissionId?: string;
  onMissionSelect: (mission: Mission) => void;
  onAddSubMission: (parentId: string, mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'targets' | 'order' | 'parentId'>) => void;
  onUpdateMission: (id: string, updates: Partial<Mission>) => void;
  onDeleteMission: (id: string) => void;
  onToggleExpanded: (id: string) => void;
}
const SortableMissionCard: React.FC<SortableMissionCardProps> = ({
  mission,
  level,
  selectedMission,
  isDarkMode,
  tasks,
  selectedDate,
  highlightedMissionId,
  onMissionSelect,
  onAddSubMission,
  onUpdateMission,
  onDeleteMission,
  onToggleExpanded
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLiveControls, setShowLiveControls] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: mission.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      onDeleteMission(mission.id);
    }
  };
  const handleAddSubMission = () => {
    const defaultSubMission = {
      name: 'New Sub Mission',
      color: '#3B82F6',
      iconUrl: '',
      template: 'task' as const,
      workspaceId: mission.workspaceId
    };
    onAddSubMission(mission.id, defaultSubMission);
  };
  const getMissionInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase();
  };
  const paddingLeft = level * 24;
  return <div ref={setNodeRef} style={style} className="mb-2">
      <Card className={`
          p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md
          border border-white/20 rounded-xl min-h-[80px]
          ${selectedMission?.id === mission.id || highlightedMissionId === mission.id ? 'bg-transparent shadow-md ring-1 ring-blue-400/50' : 'bg-transparent hover:bg-white/10'}
        `} style={{
      marginLeft: paddingLeft
    }} onDoubleClick={e => {
      e.stopPropagation();
      setShowLiveControls(!showLiveControls);
    }}>
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Button */}
          {mission.subMissions.length > 0 && <Button variant="ghost" size="sm" className="p-0.5 h-5 w-5" onClick={e => {
          e.stopPropagation();
          onToggleExpanded(mission.id);
        }}>
              {mission.isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>}

          {/* Drag Handle */}
          <div className="flex items-center justify-center w-5 h-5 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>

          {/* Mission Icon - Updated to properly show images */}
          <div className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center text-white font-medium flex-shrink-0 overflow-hidden text-sm" style={{
          backgroundColor: mission.iconUrl ? 'transparent' : mission.color
        }}>
            {mission.iconUrl ? <img src={mission.iconUrl} alt={mission.name} className="w-full h-full object-cover rounded-md" /> : getMissionInitials(mission.name)}
          </div>

          {/* Mission Content */}
          <div className="flex-1 min-w-0" onClick={() => onMissionSelect(mission)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                  {mission.name}
                </h3>
                {mission.subMissions.length > 0 && <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {mission.subMissions.length}
                    </span>
                  </div>}
              </div>
              
              {/* Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0.5 h-6 w-6" onClick={e => e.stopPropagation()}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-48 bg-white/20 border border-white/20">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="hover:bg-white/10">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="hover:bg-red-500/20 text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddSubMission} className="hover:bg-white/10">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sub Mission
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {showLiveControls && <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  
                  <LiveTaskCounter missionId={mission.id} tasks={tasks} isDarkMode={isDarkMode} selectedDate={selectedDate} showControls={showLiveControls} />
                </div>
                {mission.subMissions.length > 0}
              </div>}
            
            {/* Mission Creation Date */}
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                Created: {new Date(mission.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Sub-missions */}
      {mission.isExpanded && mission.subMissions.length > 0 && <SortableContext items={mission.subMissions.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
          {mission.subMissions.map(subMission => <SortableMissionCard key={subMission.id} mission={subMission} level={level + 1} selectedMission={selectedMission} isDarkMode={isDarkMode} tasks={tasks} selectedDate={selectedDate} highlightedMissionId={highlightedMissionId} onMissionSelect={onMissionSelect} onAddSubMission={onAddSubMission} onUpdateMission={onUpdateMission} onDeleteMission={onDeleteMission} onToggleExpanded={onToggleExpanded} />)}
        </SortableContext>}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
         <DialogContent className="bg-white/20 border border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>
              Edit Mission
            </DialogTitle>
          </DialogHeader>
          <EditMissionForm mission={mission} isDarkMode={isDarkMode} onSave={updates => {
          onUpdateMission(mission.id, updates);
          setShowEditDialog(false);
        }} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

    </div>;
};
export const MissionList: React.FC<MissionListProps> = ({
  missions,
  selectedMission,
  isDarkMode,
  tasks,
  selectedDate,
  highlightedMissionId,
  onMissionSelect,
  onAddMission,
  onAddSubMission,
  onUpdateMission,
  onDeleteMission,
  onToggleExpanded
}) => {
  const [sortableMissions, setSortableMissions] = useState(missions);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  React.useEffect(() => {
    setSortableMissions(missions);
  }, [missions]);
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      setSortableMissions(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  return <div className="h-full flex flex-col bg-transparent border-r border-white/20 rounded-3xl mx-2 my-2">
      <div className="p-6 border-b border-white/20 rounded-t-3xl">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Missions
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
          {sortableMissions.length} missions
        </p>
      </div>

      <div className="p-4">
        <Button onClick={onAddMission} className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 transition-all duration-300 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Mission
        </Button>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
        <div className="bg-transparent p-4 min-h-full">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableMissions.map(mission => mission.id)} strategy={verticalListSortingStrategy}>
            {sortableMissions.map(mission => <SortableMissionCard key={mission.id} mission={mission} level={0} selectedMission={selectedMission} isDarkMode={isDarkMode} tasks={tasks} selectedDate={selectedDate} highlightedMissionId={highlightedMissionId} onMissionSelect={onMissionSelect} onAddSubMission={onAddSubMission} onUpdateMission={onUpdateMission} onDeleteMission={onDeleteMission} onToggleExpanded={onToggleExpanded} />)}
          </SortableContext>
        </DndContext>
        </div>
      </ScrollArea>

    </div>;
};