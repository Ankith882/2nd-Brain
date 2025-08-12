import React from 'react';
import { BasePanel } from '../core/components/BasePanel';
import { PanelType, PanelConfig } from '../core/types/panel';
import { AnalyticsPanelContent } from './contents/AnalyticsPanelContent';
import { CategoriesPanelContent } from './contents/CategoriesPanelContent';
import { SummaryPanelContent } from './contents/SummaryPanelContent';
import { ControlsPanelContent } from './contents/ControlsPanelContent';

export interface UnifiedPanelProps extends PanelConfig {
  type: PanelType;
  data?: any;
  onClose?: () => void;
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
}

const getPanelContent = (type: PanelType, props: any) => {
  switch (type) {
    case 'analytics':
      return <AnalyticsPanelContent {...props} />;
    case 'categories':
      return <CategoriesPanelContent {...props} />;
    case 'summary':
      return <SummaryPanelContent {...props} />;
    case 'controls':
      return <ControlsPanelContent {...props} />;
    default:
      return <div>Unknown panel type</div>;
  }
};

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({
  type,
  data,
  onClose,
  onAction,
  isDarkMode,
  ...panelConfig
}) => {
  const contentProps = {
    data,
    onAction,
    isDarkMode,
    onClose
  };

  return (
    <BasePanel
      {...panelConfig}
      onClose={onClose}
    >
      {getPanelContent(type, contentProps)}
    </BasePanel>
  );
};