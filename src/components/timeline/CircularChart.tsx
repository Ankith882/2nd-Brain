import React, { useEffect, useMemo } from 'react';
import { BaseChartProps } from '@/types/analytics';
import { useChartBase } from '@/hooks/useChartBase';
import { transformAnalyticsData, createColorSet, EmptyDataDisplay, loadScript } from '@/utils/chartUtils';

declare const am5: any;
declare const am5percent: any;
declare const am5themes_Animated: any;

export const CircularChart: React.FC<BaseChartProps> = ({ 
  data, 
  onCategoryDoubleClick 
}) => {
  const { chartRef, rootRef, disposeChart, initializeRoot } = useChartBase();

  const chartData = useMemo(() => transformAnalyticsData(data), [data]);
  const colors = useMemo(() => createColorSet(data), [data]);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await Promise.all([
          loadScript('https://cdn.amcharts.com/lib/5/index.js'),
          loadScript('https://cdn.amcharts.com/lib/5/percent.js'),
          loadScript('https://cdn.amcharts.com/lib/5/themes/Animated.js')
        ]);
        initializeChart();
      } catch (error) {
        console.error('Failed to load amCharts scripts:', error);
      }
    };

    loadScripts();
    return disposeChart;
  }, []);

  useEffect(() => {
    if (typeof am5 !== 'undefined' && data.length > 0) {
      initializeChart();
    }
  }, [data]);

  const initializeChart = () => {
    const root = initializeRoot(am5, am5themes_Animated);
    if (!root) return;

    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      endAngle: 270,
      layout: root.verticalLayout,
      innerRadius: am5.percent(60)
    }));

    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "displayName",
      endAngle: 270
    }));
     
    series.slices.template.set("tooltipText", "{displayName}: {value} minutes\n{hierarchyLevel} Data");
    series.set("colors", am5.ColorSet.new(root, { colors: colors.map(c => am5.color(c)) }));

    series.slices.template.setAll({
      strokeWidth: 0,
      cornerRadius: 10,
      cursorOverStyle: "pointer"
    });

    series.slices.template.states.create("hover", { shadowOpacity: 0.3 });
    series.ticks.template.setAll({ strokeOpacity: 0.4, strokeDasharray: [2, 2] });
    series.states.create("hidden", { endAngle: -90 });

    if (onCategoryDoubleClick) {
      series.slices.template.on("click", function(ev: any) {
        const dataItem = ev.target.dataItem;
        if (dataItem) {
          const categoryData = data.find(item => item.categoryTitle === dataItem.get("displayName"));
          if (categoryData?.hasSubcategories) {
            onCategoryDoubleClick(categoryData.categoryId);
          }
        }
      });
    }

    series.data.setAll(chartData);

    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15,
    }));

    legend.data.setAll(series.dataItems);
    series.appear(1000, 100);
  };

  if (data.length === 0) return <EmptyDataDisplay />;

  return <div ref={chartRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
};