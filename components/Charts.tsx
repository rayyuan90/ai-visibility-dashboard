"use client";
import ReactECharts from "echarts-for-react";
import type { Dashboard } from "@/lib/types";
export function TrendChart({ data }: { data: Dashboard["trend"] }) {
  return (
    <ReactECharts
      style={{ height: 270 }}
      option={{
        tooltip: { trigger: "axis" },
        legend: { bottom: 0, icon: "circle", textStyle: { color: "#82858e" } },
        grid: { left: 35, right: 15, top: 20, bottom: 45 },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: data.map((x) => x.date.slice(5)),
          axisLabel: { color: "#898b93", fontSize: 10 },
          axisLine: { lineStyle: { color: "#e9e8e4" } },
        },
        yAxis: {
          type: "value",
          max: 100,
          axisLabel: { color: "#898b93" },
          splitLine: { lineStyle: { color: "#efeee9" } },
        },
        series: [
          {
            name: "可见度",
            type: "line",
            smooth: true,
            data: data.map((x) => x.visibility),
            lineStyle: { color: "#5e67e8", width: 3 },
            itemStyle: { color: "#5e67e8" },
            areaStyle: { color: "rgba(94,103,232,.09)" },
          },
          {
            name: "提及",
            type: "bar",
            barWidth: 9,
            data: data.map((x) => x.mentions),
            itemStyle: { color: "#c6c9ff", borderRadius: [4, 4, 0, 0] },
          },
          {
            name: "推荐",
            type: "bar",
            barWidth: 9,
            data: data.map((x) => x.recommendations),
            itemStyle: { color: "#b8dfce", borderRadius: [4, 4, 0, 0] },
          },
        ],
      }}
    />
  );
}
export function PlatformChart({ data }: { data: Dashboard["platforms"] }) {
  return (
    <ReactECharts
      style={{ height: 240 }}
      option={{
        tooltip: { trigger: "axis" },
        grid: { left: 75, right: 30, top: 10, bottom: 20 },
        xAxis: {
          type: "value",
          max: 100,
          axisLabel: { color: "#92949b", formatter: "{value}%" },
          splitLine: { lineStyle: { color: "#efeee9" } },
        },
        yAxis: {
          type: "category",
          data: data.map((x) => x.name).reverse(),
          axisLabel: { color: "#565862" },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: [...data]
              .reverse()
              .map((x, i) => ({
                value: x.visibility,
                itemStyle: {
                  color: [
                    "#aeb3fb",
                    "#9399f1",
                    "#7d84ec",
                    "#686fe3",
                    "#535bd5",
                  ][i],
                  borderRadius: [0, 6, 6, 0],
                },
              })),
            barWidth: 13,
            label: {
              show: true,
              position: "right",
              formatter: "{c}%",
              color: "#656875",
            },
          },
        ],
      }}
    />
  );
}
