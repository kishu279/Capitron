"use client";

import React, { useEffect, useRef } from "react";
import { AreaSeries, ColorType, createChart } from "lightweight-charts";

interface TradingUIProps {
  data: any;
  colors?: {
    backgroundColor: string;
    textColor: string;
    lineColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  };
}

export default function TradingUI(props: TradingUIProps) {
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

  const chartContainerRef = useRef<HTMLElement | string>("");

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current?.clientWidth,
      height: 300,
    });

    chart.timeScale().fitContent();

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    // data to be shown
    newSeries.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ]);

  return (
    <div className="w-full">
      <div ref={chartContainerRef} />
    </div>
  );
}
