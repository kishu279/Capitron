import MarketTradePage from "@/components/page/MarketTradePage";
import React from "react";

export default async function MarketTrade({
  params,
}: {
  params: { marketId: string };
}) {
  const { marketId } = await params;

  return <MarketTradePage marketId={marketId} />;
}
