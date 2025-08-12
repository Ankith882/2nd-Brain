import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface PanelConfig {
  title: string;
  icon: LucideIcon;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  allowRotation?: boolean;
  allowMinimize?: boolean;
  className?: string;
}

export interface PanelProps extends PanelConfig {
  children: ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}

export interface PanelHeaderProps {
  title: string;
  icon: LucideIcon;
  onClose?: () => void;
  onMinimize?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

export type PanelType = 'analytics' | 'categories' | 'summary' | 'controls';