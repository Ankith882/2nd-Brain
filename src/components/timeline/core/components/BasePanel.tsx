import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { useDraggable } from '../behaviors/useDraggable';

import { usePanelState } from '../behaviors/usePanelState';
import { PanelHeader } from './PanelHeader';

import { PanelProps } from '../types/panel';

export const BasePanel: React.FC<PanelProps> = ({
  children,
  title,
  icon,
  initialPosition,
  initialSize,
  allowRotation = true,
  allowMinimize = true,
  className = '',
  isVisible: externalVisible,
  onClose,
  onMinimize: externalOnMinimize
}) => {
  const { state: panelState, hide, toggleMinimize } = usePanelState({
    initialVisible: externalVisible ?? true,
    onHide: onClose
  });

  const bounds = {
    width: window.innerWidth - initialSize.width,
    height: window.innerHeight - initialSize.height
  };

  const { state: draggableState, elementRef, handleMouseDown } = useDraggable({
    initialPosition,
    allowRotation,
    bounds
  });


  const handlePanelMouseDown = (e: React.MouseEvent) => {
    handleMouseDown(e);
  };


  const handleMinimize = () => {
    toggleMinimize();
    externalOnMinimize?.();
  };

  if (!panelState.isVisible) {
    return null;
  }

  return (
    <Card
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`fixed bg-white/5 dark:bg-black/10 border border-white/20 rounded-xl shadow-xl select-none ${className}`}
      style={{
        left: `${draggableState.position.x}px`,
        top: `${draggableState.position.y}px`,
        width: `${initialSize.width}px`,
        height: `${initialSize.height}px`,
        transform: `rotate(${draggableState.rotation}deg)`,
        zIndex: panelState.zIndex,
        transition: panelState.isMinimized ? 'height 0.3s ease-out' : 'none'
      }}
    >
      
      
      <PanelHeader
        title={title}
        icon={icon}
        onClose={onClose ? hide : undefined}
        onMinimize={allowMinimize ? handleMinimize : undefined}
        onMouseDown={handlePanelMouseDown}
      />

      {!panelState.isMinimized && (
        <CardContent 
          className="p-0 overflow-auto flex flex-col animate-accordion-down" 
          style={{ 
            height: `${initialSize.height - 60}px` 
          }}
        >
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};