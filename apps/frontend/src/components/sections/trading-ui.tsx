import React, { useEffect, useRef } from "react";
import { AreaSeries, createChart, ColorType } from "lightweight-charts";

interface TradingProps {
  data: any[];
  colors: {
    backgroundColor: string;
    lineColor: string;
    textColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  };
}

// ORDER BOOK DATA
export function TradingOrders(props: TradingProps) {
  const {
    data,
    colors: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current!, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor } },
      width: chartContainerRef.current?.clientWidth,
    });

    chart.timeScale().fitContent();

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    series.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // for desktop view
  return (
    <div className="w-full h-full">
      <div
        ref={chartContainerRef}
        style={{ backgroundColor }}
        className="w-full min-h-[400px] rounded-lg border border-gray-200"
      ></div>
    </div>
  );
}

// TIME ORDER DATA
export function TradingTimeOrder(props: TradingProps) {
  return <div></div>;
}
