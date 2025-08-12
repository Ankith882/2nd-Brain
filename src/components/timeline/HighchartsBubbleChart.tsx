import React, { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { BaseChartProps, AnalyticsData } from '@/types/analytics';
import { EmptyDataDisplay } from '@/utils/chartUtils';

interface HighchartsBubbleChartProps extends BaseChartProps {
  expandedCategories: { [categoryId: string]: boolean };
}

export const HighchartsBubbleChart: React.FC<HighchartsBubbleChartProps> = ({ 
  data, 
  onCategoryDoubleClick,
  expandedCategories 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const positionedBubbles = useMemo(() => calculateBubblePositions(data), [data]);

  const updateZoom = (newZoom: number) => {
    setZoomLevel(newZoom);
    updateChartWithZoom(newZoom);
  };

  const zoomIn = () => updateZoom(zoomLevel * 1.5);
  const zoomOut = () => updateZoom(zoomLevel / 1.5);
  const resetZoom = () => updateZoom(1);

  const updateChartWithZoom = (zoom: number) => {
    if (!chartInstance.current || positionedBubbles.length === 0) return;

    const scaledData = positionedBubbles.map(item => ({
      x: item.x * zoom,
      y: item.y * zoom,
      name: item.categoryTitle,
      color: item.categoryColor,
      categoryId: item.categoryId,
      hasSubcategories: item.hasSubcategories,
      taskCount: item.taskCount,
      totalDuration: item.totalDuration,
        marker: {
          radius: item.radius * zoom,
          fillColor: item.categoryColor,
          lineWidth: 0
        }
    }));

    const chart = chartInstance.current;
    chart.series[0].setData(scaledData as any, false);
    
    const allX = scaledData.map(b => [b.x - b.marker.radius, b.x + b.marker.radius]).flat();
    const allY = scaledData.map(b => [b.y - b.marker.radius, b.y + b.marker.radius]).flat();
    const padding = 50 * zoom;
    
    chart.xAxis[0].setExtremes(Math.min(...allX) - padding, Math.max(...allX) + padding, false);
    chart.yAxis[0].setExtremes(Math.min(...allY) - padding, Math.max(...allY) + padding, false);
    chart.redraw();
  };

  function calculateBubblePositions(data: AnalyticsData[]) {
    const bubbles = data.map(item => ({
      ...item,
      radius: Math.sqrt(item.totalDuration) * 3,
      x: 0,
      y: 0
    })).sort((a, b) => b.radius - a.radius);

    bubbles.forEach((bubble, i) => {
      if (i === 0) {
        bubble.x = bubble.y = 0;
      } else {
        let placed = false;
        for (let layer = 1; layer <= 20 && !placed; layer++) {
          const itemsInLayer = layer * 6;
          const layerRadius = layer * (bubble.radius * 2 + 30);
          
          for (let pos = 0; pos < itemsInLayer && !placed; pos++) {
            const angle = (pos / itemsInLayer) * 2 * Math.PI;
            const testX = Math.cos(angle) * layerRadius;
            const testY = Math.sin(angle) * layerRadius;

            let overlaps = false;
            for (let j = 0; j < i; j++) {
              const other = bubbles[j];
              const dx = testX - other.x;
              const dy = testY - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < bubble.radius + other.radius + 20) {
                overlaps = true;
                break;
              }
            }

            if (!overlaps) {
              bubble.x = testX;
              bubble.y = testY;
              placed = true;
            }
          }
        }

        if (!placed) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 500 + bubble.radius;
          bubble.x = Math.cos(angle) * distance;
          bubble.y = Math.sin(angle) * distance;
        }
      }
    });

    return bubbles;
  }

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    const allX = positionedBubbles.map(b => [b.x - b.radius, b.x + b.radius]).flat();
    const allY = positionedBubbles.map(b => [b.y - b.radius, b.y + b.radius]).flat();
    const padding = 50;
    const [minX, maxX, minY, maxY] = [
      Math.min(...allX) - padding,
      Math.max(...allX) + padding,
      Math.min(...allY) - padding,
      Math.max(...allY) + padding
    ];

    const series: Highcharts.SeriesOptionsType[] = [{
      type: 'scatter',
      name: 'Categories',
      data: positionedBubbles.map(item => ({
        x: item.x,
        y: item.y,
        name: item.categoryTitle,
        color: item.categoryColor,
        categoryId: item.categoryId,
        hasSubcategories: item.hasSubcategories,
        taskCount: item.taskCount,
        totalDuration: item.totalDuration,
          marker: {
            radius: item.radius,
            fillColor: {
              radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
              stops: [[0, 'rgba(255,255,255,0.5)'], [1, item.categoryColor]]
            },
            lineWidth: 0
          }
      }))
    } as Highcharts.SeriesScatterOptions];

    const options: Highcharts.Options = {
      chart: {
        type: 'scatter',
        backgroundColor: 'transparent',
        margin: [20, 20, 20, 20],
        height: null,
        panKey: 'shift',
        panning: { enabled: true, type: 'xy' }
      },
      title: {
        text: 'Task Analytics by Category',
        style: {
          color: '#f9fafb',
          fontSize: '16px',
          fontWeight: '600'
        }
      },
      xAxis: { min: minX, max: maxX, visible: false },
      yAxis: { min: minY, max: maxY, visible: false },
      tooltip: {
        useHTML: true,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 12,
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          offsetX: 0,
          offsetY: 4,
          opacity: 0.3,
          width: 12
        },
        style: { 
          color: '#1f2937',
          fontSize: '12px',
          fontWeight: '500',
          backdropFilter: 'blur(20px)',
          webkitBackdropFilter: 'blur(20px)'
        },
        formatter: function() {
          const point = this as any;
          return `
            <div class="p-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg">
              <div class="font-semibold text-gray-900 dark:text-gray-100">${point.name}</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">Tasks: ${point.taskCount}</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">Duration: ${point.totalDuration} minutes</div>
              ${point.hasSubcategories ? '<div class="text-sm text-blue-600 dark:text-blue-400">Click to expand</div>' : ''}
            </div>
          `;
        }
      },
      plotOptions: {
        scatter: {
          cursor: 'pointer',
          point: {
            events: {
              click: function() {
                const point = this as any;
                if (point.hasSubcategories && onCategoryDoubleClick) {
                  onCategoryDoubleClick(point.categoryId);
                }
              }
            }
          }
        }
      },
      legend: { enabled: false },
      series,
      credits: { enabled: false }
    };

    // Safely destroy existing chart
    if (chartInstance.current && typeof chartInstance.current.destroy === 'function') {
      try {
        chartInstance.current.destroy();
      } catch (error) {
        console.warn('Error destroying chart:', error);
      }
    }
    chartInstance.current = Highcharts.chart(chartRef.current, options);

    return () => {
      if (chartInstance.current && typeof chartInstance.current.destroy === 'function') {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.warn('Error destroying chart in cleanup:', error);
        }
      }
    };
  }, [data, onCategoryDoubleClick, positionedBubbles]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      updateZoom(zoomLevel * (e.deltaY > 0 ? 0.9 : 1.1));
    };

    const chartElement = chartRef.current;
    chartElement?.addEventListener('wheel', handleWheel, { passive: false });
    return () => chartElement?.removeEventListener('wheel', handleWheel);
  }, [zoomLevel]);

  if (data.length === 0) return <EmptyDataDisplay />;

  return (
    <div className="w-full h-full bg-transparent relative">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={zoomIn} className="bg-background/80 backdrop-blur-sm" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut} className="bg-background/80 backdrop-blur-sm" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetZoom} className="bg-background/80 backdrop-blur-sm" title="Reset Zoom">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div ref={chartRef} className="w-full h-full" />
      
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        <div>Mouse wheel: Zoom | Shift + drag: Pan</div>
        <div className="font-medium">Zoom: {zoomLevel.toFixed(1)}x</div>
      </div>
    </div>
  );
};