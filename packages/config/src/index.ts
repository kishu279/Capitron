const binanceService = ["btcusdt", "ethusdt", "bnbusdt"]; // service

function getBinanceLink() {
  // return binanceService.map((service) => `${service}@bookTicker`).join("/");
  return binanceService.map((service) => `${service}@trade`).join("/");
}

function getStream() {
  // return binanceService.map((service) => `${service}@bookTicker`);
  return binanceService.map((service) => `${service}@trade`);
}

export { binanceService, getBinanceLink, getStream };
