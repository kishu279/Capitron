import React from "react";

interface TradingProps {
  data: any[];
  color: {
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
    color: {
      // default colot
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    },
  } = props;
  return <div></div>;
}

// TIME ORDER DATA
export function TradingTimeOrder(props: TradingProps) {
  return <div></div>;
}
