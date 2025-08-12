import React from 'react';
import { UnifiedPanel, UnifiedPanelProps } from './UnifiedPanel';
import { PanelType } from '../core/types/panel';
import { BarChart3, Settings, Clock, Layers3 } from 'lucide-react';

export interface PanelFactoryProps {
  type: PanelType;
  data?: any;
  onClose?: () => void;
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

const getPanelConfig = (type: PanelType): Omit<UnifiedPanelProps, 'type' | 'data' | 'onClose' | 'onAction' | 'isDarkMode'> => {
  const configs = {
    analytics: {
      title: 'Enhanced Task Analytics',
      icon: BarChart3,
      initialPosition: { x: 20, y: 20 },
      initialSize: { width: 800, height: 600 },
      minSize: { width: 600, height: 400 },
      allowResize: true,
      allowRotation: false,
      allowMinimize: true
    },
    categories: {
      title: 'Categories Management',
      icon: Settings,
      initialPosition: { x: window.innerWidth - 500, y: 100 },
      initialSize: { width: 480, height: 600 },
      minSize: { width: 400, height: 300 },
      allowResize: true,
      allowRotation: false,
      allowMinimize: true
    },
    summary: {
      title: 'Summary',
      icon: Clock,
      initialPosition: { x: 20, y: 80 },
      initialSize: { width: 280, height: 240 },
      minSize: { width: 200, height: 150 },
      allowResize: true,
      allowRotation: true,
      allowMinimize: true
    },
    controls: {
      title: 'Controls',
      icon: BarChart3,
      initialPosition: { x: 20, y: 20 },
      initialSize: { width: 400, height: 80 },
      minSize: { width: 300, height: 60 },
      allowResize: false,
      allowRotation: true,
      allowMinimize: false
    }
  };

  return configs[type] || configs.analytics;
};

export const PanelFactory: React.FC<PanelFactoryProps> = ({
  type,
  data,
  onClose,
  onAction,
  isDarkMode,
  position,
  size
}) => {
  const config = getPanelConfig(type);
  
  // Override position and size if provided
  const finalConfig = {
    ...config,
    ...(position && { initialPosition: position }),
    ...(size && { initialSize: size })
  };

  return (
    <UnifiedPanel
      type={type}
      data={data}
      onClose={onClose}
      onAction={onAction}
      isDarkMode={isDarkMode}
      {...finalConfig}
    />
  );
};