import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PriceProgressionDataPoint, TimeProgressionDataPoint } from "@/lib/pricing";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceComparisonChartProps {
  distanceData: PriceProgressionDataPoint[];
  timeData: TimeProgressionDataPoint[];
  currentDistance: number;
  currentHours: number;
  breakEvenDistance: number | null;
}

type ChartMode = "distance" | "time";

export function PriceComparisonChart({
  distanceData,
  timeData,
  currentDistance,
  currentHours,
  breakEvenDistance,
}: PriceComparisonChartProps) {
  const [mode, setMode] = useState<ChartMode>("distance");

  const formatPrice = (value: number) => `¥${value.toLocaleString()}`;
  const formatDistance = (value: number) => `${value}km`;
  const formatHours = (value: number) => {
    if (value < 24) return `${value}h`;
    const days = Math.floor(value / 24);
    const hours = value % 24;
    return hours > 0 ? `${days}d${hours}h` : `${days}d`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const labelText = mode === "distance" ? formatDistance(label) : formatHours(label);
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{labelText}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const data = mode === "distance" ? distanceData : timeData;
  const dataKey = mode === "distance" ? "distance" : "hours";
  const currentValue = mode === "distance" ? currentDistance : currentHours;
  const xAxisLabel = mode === "distance" ? "km" : "時間";
  const xTickFormatter = mode === "distance" 
    ? (value: number) => `${value}`
    : (value: number) => formatHours(value);

  return (
    <div className="w-full bg-card rounded-lg border border-border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-foreground text-center sm:text-left">
          {mode === "distance" ? "距離別料金比較" : "時間別料金比較"}
        </h3>
        <Tabs value={mode} onValueChange={(v) => setMode(v as ChartMode)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="distance" className="text-sm">距離で比較</TabsTrigger>
            <TabsTrigger value="time" className="text-sm">時間で比較</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={dataKey}
              tickFormatter={xTickFormatter}
              className="text-xs"
              label={{ value: xAxisLabel, position: "insideBottomRight", offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              className="text-xs"
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
            
            {/* Current value reference line */}
            <ReferenceLine
              x={currentValue}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "現在",
                position: "top",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            
            {/* Break-even point reference line (only for distance mode) */}
            {mode === "distance" && breakEvenDistance && (
              <ReferenceLine
                x={breakEvenDistance}
                stroke="hsl(var(--accent))"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: "損益分岐",
                  position: "top",
                  fill: "hsl(var(--accent-foreground))",
                  fontSize: 12,
                }}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="carShare"
              name="カーシェア"
              stroke="#FDD101"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#FDD101" }}
            />
            <Line
              type="monotone"
              dataKey="rentalCar"
              name="レンタカー"
              stroke="#000000"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#000000" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        {mode === "distance" 
          ? "※ 走行距離に応じた料金の推移を表示しています（利用時間固定）"
          : "※ 利用時間に応じた料金の推移を表示しています（走行距離固定）"
        }
      </p>
    </div>
  );
}