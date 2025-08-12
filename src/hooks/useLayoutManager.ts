
import { useState } from 'react';

interface LayoutState {
  leftSidebarSize: number;
  detailsPanelSize: number;
  descriptionPanelSize: number;
}

const DEFAULT_LAYOUT: LayoutState = {
  leftSidebarSize: 15,
  detailsPanelSize: 45,
  descriptionPanelSize: 40
};

export const useLayoutManager = () => {
  const [layout, setLayout] = useState<LayoutState>(DEFAULT_LAYOUT);

  const updatePanelSize = (panel: keyof LayoutState, size: number) => {
    setLayout(prev => ({ ...prev, [panel]: size }));
  };

  return {
    ...layout,
    updatePanelSize
  };
};
