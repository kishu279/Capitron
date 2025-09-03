const binanceService = ["btcusdt", "ethusdt", "bnbusdt"]; // service

function getBinanceLink() {
  return binanceService.map((service) => `${service}@bookTicker`).join("/");
}

function getStream() {
  return binanceService.map((service) => `${service}@bookTicker`);
}

export { binanceService, getBinanceLink, getStream };
