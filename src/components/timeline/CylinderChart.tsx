import React, { useEffect, useMemo } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { BaseChartProps } from '@/types/analytics';
import { useChartBase } from '@/hooks/useChartBase';
import { transformAnalyticsData, createColorSet, EmptyDataDisplay } from '@/utils/chartUtils';

export const CylinderChart: React.FC<BaseChartProps> = ({ 
  data, 
  onCategoryDoubleClick 
}) => {
  const { chartRef, disposeChart } = useChartBase();
  const chartData = useMemo(() => transformAnalyticsData(data), [data]);
  const colors = useMemo(() => createColorSet(data), [data]);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      layout: root.verticalLayout
    }));

    chart.set("colors", am5.ColorSet.new(root, { 
      colors: colors.map(c => am5.color(c)) 
    }));

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "category",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    // Use displayName for axis labels
    xAxis.get("renderer").labels.template.adapters.add("text", function(text, target) {
      const dataItem = target.dataItem;
      if (dataItem) {
        const categoryData = dataItem.dataContext as any;
        return categoryData.displayName;
      }
      return text;
    });

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })
    }));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Category Duration",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "category",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{displayName}: {valueY} minutes\nTasks: {taskCount}"
      })
    }));

    series.columns.template.setAll({
      tooltipText: "{displayName}: {valueY} minutes\nTasks: {taskCount}\n{hierarchyLevel}",
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
      cornerRadiusTL: 50,
      cornerRadiusTR: 50,
      cursorOverStyle: "pointer"
    });

    series.columns.template.states.create("hover", { shadowOpacity: 0.3 });

    series.columns.template.adapters.add("fill", function (fill, target) {
      const dataItem = target.dataItem;
      if (dataItem) {
        const categoryData = dataItem.dataContext as any;
        return am5.color(categoryData.color);
      }
      return fill;
    });

    xAxis.data.setAll(chartData);
    series.data.setAll(chartData);
    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, [data]);

  if (data.length === 0) return <EmptyDataDisplay />;

  return <div ref={chartRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
};