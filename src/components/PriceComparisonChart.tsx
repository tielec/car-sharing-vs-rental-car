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
import { PriceProgressionDataPoint } from "@/lib/pricing";

interface PriceComparisonChartProps {
  data: PriceProgressionDataPoint[];
  currentDistance: number;
  breakEvenDistance: number | null;
}

export function PriceComparisonChart({
  data,
  currentDistance,
  breakEvenDistance,
}: PriceComparisonChartProps) {
  const formatPrice = (value: number) => `¥${value.toLocaleString()}`;
  const formatDistance = (value: number) => `${value}km`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{formatDistance(label)}</p>
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

  return (
    <div className="w-full bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">
        距離別料金比較
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="distance"
              tickFormatter={(value) => `${value}`}
              className="text-xs"
              label={{ value: "km", position: "insideBottomRight", offset: -5 }}
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
            
            {/* Current distance reference line */}
            <ReferenceLine
              x={currentDistance}
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
            
            {/* Break-even point reference line */}
            {breakEvenDistance && (
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
        ※ 走行距離に応じた料金の推移を表示しています
      </p>
    </div>
  );
}
