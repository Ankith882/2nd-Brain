import { useState, useCallback } from 'react';

export interface PanelState {
  isVisible: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface PanelOptions {
  initialVisible?: boolean;
  initialMinimized?: boolean;
  initialZIndex?: number;
  onShow?: () => void;
  onHide?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const usePanelState = (options: PanelOptions = {}) => {
  const {
    initialVisible = true,
    initialMinimized = false,
    initialZIndex = 50,
    onShow,
    onHide,
    onMinimize,
    onMaximize
  } = options;

  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [zIndex, setZIndex] = useState(initialZIndex);

  const show = useCallback(() => {
    setIsVisible(true);
    onShow?.();
  }, [onShow]);

  const hide = useCallback(() => {
    setIsVisible(false);
    onHide?.();
  }, [onHide]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  const minimize = useCallback(() => {
    setIsMinimized(true);
    onMinimize?.();
  }, [onMinimize]);

  const maximize = useCallback(() => {
    setIsMinimized(false);
    onMaximize?.();
  }, [onMaximize]);

  const toggleMinimize = useCallback(() => {
    if (isMinimized) {
      maximize();
    } else {
      minimize();
    }
  }, [isMinimized, minimize, maximize]);

  const bringToFront = useCallback(() => {
    setZIndex(prev => prev + 1);
  }, []);

  const state: PanelState = {
    isVisible,
    isMinimized,
    zIndex
  };

  return {
    state,
    show,
    hide,
    toggle,
    minimize,
    maximize,
    toggleMinimize,
    bringToFront,
    setZIndex
  };
};