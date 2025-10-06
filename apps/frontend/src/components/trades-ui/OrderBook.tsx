import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import type { Options } from "highcharts";

import HighchartsReact from "highcharts-react-official";

function getRandomNumber(min: number, max: number): number {
  return Math.round(Math.random() * (max - min)) + min;
}

function generateBidAndAskData(n: number) {
  const data: [any[], any[]] = [[], []];
  let bidPrice = getRandomNumber(29000, 30000),
    askPrice = bidPrice + 0.5;
  for (let i = 0; i < n; i++) {
    bidPrice -= i * getRandomNumber(8, 10);
    askPrice += i * getRandomNumber(8, 10);
    data[0].push({
      x: i,
      y: (i + 1) * getRandomNumber(70000, 110000),
      price: bidPrice,
    });

    data[1].push({
      x: i,
      y: (i + 1) * getRandomNumber(70000, 110000),
      price: askPrice,
    });
  }

  return data;
}

const OrderBookChartAskAndBid = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [bidsData, asksData] = generateBidAndAskData(10);

  function updateData(chart: Highcharts.Chart) {
    const data = generateBidAndAskData(10);
    chart.series.forEach((s, i) => {
      s.setData(data[i], false);
    });
    chart.redraw();
  }

  useEffect(() => {
    if (chartRef.current) {
      const options: Options = {
        chart: {
          animation: {
            duration: 200,
          },
          type: "bar",
          backgroundColor: "#23232f",
          marginTop: 70,
          events: {
            load() {
              const chart = this;
              let intervalId = null;

              const toggleInterval = () => {
                if (intervalId) {
                  chart.update({
                    accessibility: {
                      enabled: true,
                    },
                  });
                  clearInterval(intervalId);
                  intervalId = null;
                } else {
                  chart.update({
                    accessibility: {
                      enabled: false,
                    },
                  });
                  intervalId = setInterval(() => {
                    if (this.series) {
                      updateData(this);
                    }
                  }, 200);
                }
              };

              // Start the animation by default
              toggleInterval();
            },
          },
        },

        accessibility: {
          point: {
            descriptionFormat: "Price: {price:.1f}USD, " + "{series.name}: {y}",
          },
        },

        title: {
          text: "Order book live chart",
          style: {
            color: "#ffffff",
          },
        },

        tooltip: {
          headerFormat: "Price: <b>${point.point.price:,.1f}</b></br>",
          pointFormat: "{series.name}: <b>{point.y:,.0f}</b>",
          shape: "rect",
          positioner(labelWidth, _, point) {
            const { plotX, plotY } = point;
            const negative = plotX < (this.chart.yAxis[0] as any).left || 0;

            return {
              x: negative ? plotX + 50 - labelWidth + 10 : plotX - 50 + 10,
              y: plotY,
            };
          },
        },

        xAxis: [
          {
            reversed: true,
            visible: false,
            title: {
              text: "Market depth / price",
            },
            accessibility: {
              description: "Bid orders",
            },
          },
          {
            opposite: true,
            visible: false,
            title: {
              text: "Market depth / price",
            },
            accessibility: {
              description: "Ask orders",
            },
          },
        ],

        yAxis: [
          {
            offset: 0,
            visible: true,
            opposite: true,
            gridLineWidth: 0,
            tickAmount: 1,
            left: "50%",
            width: "50%",
            title: {
              text: "Amount of ask orders",
              style: {
                visibility: "hidden",
              },
            },
            min: 0,
            max: 1200000,
            labels: {
              enabled: true,
              format: "{#if isLast}Asks{/if}",
              style: {
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "700",
              },
              y: 10,
            },
          },
          {
            offset: 0,
            visible: true,
            opposite: true,
            gridLineWidth: 0,
            tickAmount: 2,
            left: "0%",
            width: "50%",
            reversed: true,
            title: {
              text: "Amount of bid orders",
              style: {
                visibility: "hidden",
              },
            },
            min: 0,
            max: 1200000,
            labels: {
              enabled: true,
              format: `
                {#if (eq pos 0)}Price ($){/if}
                {#if isLast}Bids{/if}
            `,
              style: {
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "700",
              },
              y: 10,
            },
          },
        ],

        legend: {
          enabled: false,
        },

        navigation: {
          buttonOptions: {
            theme: {
              fill: "none",
            },
          },
        },

        plotOptions: {
          series: {
            animation: false,
            dataLabels: {
              enabled: true,
              color: "#ffffff",
            },
            borderWidth: 0,
            crisp: false,
          },
        },

        series: [
          {
            dataLabels: [
              {
                align: "right",
                alignTo: "plotEdges",
                style: {
                  fontSize: "14px",
                  textOutline: "none",
                },
                format: "{point.y:,.0f}",
              },
              {
                align: "left",
                inside: true,
                style: {
                  fontSize: "13px",
                  textOutline: "none",
                },
                format: "{point.price:,.1f}",
              },
            ],
            name: "Asks",
            color: "#ce4548",
            data: asksData,
          },
          {
            dataLabels: [
              {
                align: "left",
                alignTo: "plotEdges",
                style: {
                  fontSize: "14px",
                  textOutline: "none",
                },
                format: "{point.y:,.0f}",
              },
              {
                align: "right",
                inside: true,
                style: {
                  fontSize: "13px",
                  textOutline: "none",
                },
                format: "{point.price:,.1f}",
              },
            ],
            name: "Bids",
            color: "#107db7",
            data: bidsData,
            yAxis: 1,
          },
        ] as any,
      };

      Highcharts.chart(chartRef.current, options);
    }
  }, []);

  return <div ref={chartRef} style={{ height: "400px", width: "100%" }} />;
};

export default OrderBookChart;
