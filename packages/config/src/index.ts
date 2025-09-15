const binanceService = ["btcusdt", "ethusdt", "bnbusdt"]; // service

interface BinanceBookTicker {
  stream: String;
  data: {
    e: "bookTicker"; // Event type
    u: number; // Order book updateId
    s: string; // Symbol
    b: string; // Best bid price
    B: string; // Best bid qty
    a: string; // Best ask price
    A: string; // Best ask qty
  };
}

interface BinanceTrade {
  stream: string;
  data: {
    e: "trade";
    E: number;
    s: string;
    t: number;
    p: string;
    q: string;
    T: number;
    m: boolean;
    M: boolean;
  };
}

function getBinanceLink() {
  // return binanceService.map((service) => `${service}@bookTicker`).join("/");
  return binanceService.map((service) => `${service}@trade`).join("/");
}

function getStream() {
  // return binanceService.map((service) => `${service}@bookTicker`);
  return binanceService.map((service) => `${service}@trade`);
}

export { binanceService, getBinanceLink, getStream };
export type { BinanceTrade, BinanceBookTicker };
