import React from "react";

export default function MarketTrade({
  params,
}: {
  params: { marketId: string };
}) {
  const { marketId } = params;

  return <div>{marketId}</div>;
}
