import { useRef, useCallback } from 'react';

export const useChartBase = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<any>(null);

  const disposeChart = useCallback(() => {
    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }
  }, []);

  const initializeRoot = useCallback((am5: any, am5themes_Animated: any) => {
    if (!chartRef.current) return null;
    
    disposeChart();
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);
    return root;
  }, [disposeChart]);

  return {
    chartRef,
    rootRef,
    disposeChart,
    initializeRoot
  };
};