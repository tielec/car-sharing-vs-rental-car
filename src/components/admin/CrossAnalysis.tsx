import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type AxisKey = "weekday" | "hour" | "device" | "source";
type Metric = "total" | "cvr" | "donation";

interface Props {
  data: any[];
  classifySource: (domain: string | null, utmSource: string | null) => string;
}

const AXIS_LABELS: Record<AxisKey, string> = {
  weekday: "曜日",
  hour: "時間帯",
  device: "デバイス",
  source: "流入元",
};

const WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_LABELS: Record<string, string> = {
  Mon: "月", Tue: "火", Wed: "水", Thu: "木", Fri: "金", Sat: "土", Sun: "日",
};

function jstParts(iso: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    weekday: "short", hour12: false,
  });
  const parts = fmt.formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value; return acc;
  }, {});
  return {
    hour: parseInt(parts.hour, 10),
    weekday: parts.weekday,
  };
}

export function CrossAnalysis({ data, classifySource }: Props) {
  const [rowAxis, setRowAxis] = useState<AxisKey>("weekday");
  const [colAxis, setColAxis] = useState<AxisKey>("hour");
  const [metric, setMetric] = useState<Metric>("total");

  const { rows, cols, matrix, rowTotals, colTotals, grandTotal, maxVal, peak } = useMemo(() => {
    const getKey = (log: any, axis: AxisKey): string | null => {
      if (axis === "weekday" || axis === "hour") {
        if (!log.created_at) return null;
        const p = jstParts(log.created_at);
        return axis === "weekday" ? p.weekday : String(p.hour);
      }
      if (axis === "device") return log.device_type || "unknown";
      if (axis === "source") return classifySource(log.referrer_domain, log.utm_source);
      return null;
    };

    const cellMap = new Map<string, Map<string, { total: number; interacted: number; donationClicks: number }>>();
    const rowKeys = new Set<string>();
    const colKeys = new Set<string>();

    for (const log of data) {
      const r = getKey(log, rowAxis);
      const c = getKey(log, colAxis);
      if (r === null || c === null) continue;
      rowKeys.add(r);
      colKeys.add(c);
      if (!cellMap.has(r)) cellMap.set(r, new Map());
      const inner = cellMap.get(r)!;
      const cur = inner.get(c) || { total: 0, interacted: 0, donationClicks: 0 };
      cur.total += 1;
      if (log.has_interacted) cur.interacted += 1;
      if (log.donation_clicked) cur.donationClicks += 1;
      inner.set(c, cur);
    }

    // Sort axis keys
    const sortKeys = (axis: AxisKey, keys: Set<string>): string[] => {
      const arr = Array.from(keys);
      if (axis === "weekday") {
        return WEEKDAY_ORDER.filter((d) => keys.has(d));
      }
      if (axis === "hour") {
        return arr.map(Number).sort((a, b) => a - b).map(String);
      }
      // device/source: sort by total descending
      const totals: Record<string, number> = {};
      for (const k of arr) totals[k] = 0;
      cellMap.forEach((inner, r) => {
        inner.forEach((v, c) => {
          if (axis === rowAxis && arr.includes(r)) totals[r] += v.total;
          if (axis === colAxis && arr.includes(c)) totals[c] += v.total;
        });
      });
      return arr.sort((a, b) => (totals[b] || 0) - (totals[a] || 0)).slice(0, 10);
    };

    const rows = sortKeys(rowAxis, rowKeys);
    const cols = sortKeys(colAxis, colKeys);

    const valueOf = (cell: { total: number; interacted: number; donationClicks: number } | undefined): number | null => {
      if (!cell || cell.total === 0) return metric === "total" ? 0 : null;
      if (metric === "total") return cell.total;
      if (metric === "cvr") return Math.round((cell.interacted / cell.total) * 1000) / 10;
      return Math.round((cell.donationClicks / cell.total) * 1000) / 10;
    };

    const matrix: Array<Array<number | null>> = rows.map((r) =>
      cols.map((c) => valueOf(cellMap.get(r)?.get(c)))
    );

    const rowTotals = rows.map((r) => {
      let t = 0;
      cols.forEach((c) => {
        t += cellMap.get(r)?.get(c)?.total || 0;
      });
      return t;
    });
    const colTotals = cols.map((c) => {
      let t = 0;
      rows.forEach((r) => {
        t += cellMap.get(r)?.get(c)?.total || 0;
      });
      return t;
    });
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    let maxVal = 0;
    let peak: { row: string; col: string; val: number } | null = null;
    matrix.forEach((line, i) => {
      line.forEach((v, j) => {
        if (v !== null && v > maxVal) {
          maxVal = v;
          peak = { row: rows[i], col: cols[j], val: v };
        }
      });
    });

    return { rows, cols, matrix, rowTotals, colTotals, grandTotal, maxVal, peak };
  }, [data, rowAxis, colAxis, metric, classifySource]);

  const formatAxisLabel = (axis: AxisKey, key: string): string => {
    if (axis === "weekday") return WEEKDAY_LABELS[key] || key;
    if (axis === "hour") return `${key}時`;
    return key;
  };

  const formatValue = (v: number | null): string => {
    if (v === null) return "-";
    if (metric === "total") return String(v);
    return `${v.toFixed(1)}%`;
  };

  const swapAxes = () => {
    setRowAxis(colAxis);
    setColAxis(rowAxis);
  };

  const metricLabel: Record<Metric, string> = {
    total: "アクセス数",
    cvr: "操作率 (CVR)",
    donation: "投げ銭クリック率",
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">行軸:</span>
          <Select value={rowAxis} onValueChange={(v) => setRowAxis(v as AxisKey)}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(AXIS_LABELS) as AxisKey[]).map((k) => (
                <SelectItem key={k} value={k} disabled={k === colAxis} className="text-xs">{AXIS_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={swapAxes}
          className="text-xs px-2 h-8 rounded border border-border hover:bg-muted/40"
          title="行と列を入れ替え"
        >
          ⇄
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">列軸:</span>
          <Select value={colAxis} onValueChange={(v) => setColAxis(v as AxisKey)}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(AXIS_LABELS) as AxisKey[]).map((k) => (
                <SelectItem key={k} value={k} disabled={k === rowAxis} className="text-xs">{AXIS_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={(v) => v && setMetric(v as Metric)}
            className="gap-0"
          >
            <ToggleGroupItem value="total" className="h-8 text-xs px-2">件数</ToggleGroupItem>
            <ToggleGroupItem value="cvr" className="h-8 text-xs px-2">CVR</ToggleGroupItem>
            <ToggleGroupItem value="donation" className="h-8 text-xs px-2">投げ銭率</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Caption */}
      {peak && grandTotal > 0 && (
        <p className="text-xs text-muted-foreground">
          指標: <span className="font-medium text-foreground">{metricLabel[metric]}</span> / ピーク:{" "}
          <span className="font-medium text-foreground">
            {formatAxisLabel(rowAxis, peak.row)} × {formatAxisLabel(colAxis, peak.col)}
          </span>{" "}
          ({formatValue(peak.val)})
        </p>
      )}

      {/* Heatmap */}
      {rows.length === 0 || cols.length === 0 ? (
        <p className="text-xs text-muted-foreground">表示できるデータがありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card p-1.5 text-muted-foreground font-medium text-left">
                  {AXIS_LABELS[rowAxis]} \ {AXIS_LABELS[colAxis]}
                </th>
                {cols.map((c) => (
                  <th key={c} className="p-1.5 text-muted-foreground font-medium text-center min-w-[36px]">
                    {formatAxisLabel(colAxis, c)}
                  </th>
                ))}
                <th className="p-1.5 text-muted-foreground font-bold text-center bg-muted/30">合計</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r}>
                  <th className="sticky left-0 bg-card p-1.5 text-foreground font-medium text-left whitespace-nowrap">
                    {formatAxisLabel(rowAxis, r)}
                  </th>
                  {cols.map((c, j) => {
                    const v = matrix[i][j];
                    const ratio = v === null || maxVal === 0 ? 0 : Math.min(v / maxVal, 1);
                    const opacity = ratio === 0 ? 0 : 0.1 + ratio * 0.7;
                    return (
                      <td
                        key={c}
                        className="p-1.5 text-center tabular-nums border border-border/40"
                        style={{
                          backgroundColor: opacity > 0 ? `hsl(var(--primary) / ${opacity})` : undefined,
                          color: ratio > 0.6 ? "hsl(var(--primary-foreground))" : undefined,
                        }}
                        title={`${formatAxisLabel(rowAxis, r)} × ${formatAxisLabel(colAxis, c)}: ${formatValue(v)}`}
                      >
                        {formatValue(v)}
                      </td>
                    );
                  })}
                  <td className="p-1.5 text-center tabular-nums font-bold bg-muted/30">{rowTotals[i]}</td>
                </tr>
              ))}
              <tr>
                <th className="sticky left-0 bg-muted/30 p-1.5 text-foreground font-bold text-left">合計</th>
                {colTotals.map((t, j) => (
                  <td key={j} className="p-1.5 text-center tabular-nums font-bold bg-muted/30">{t}</td>
                ))}
                <td className="p-1.5 text-center tabular-nums font-bold bg-muted/50">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        ※ セルの濃淡は選択中指標の相対値（最大値=最も濃い）。件数は実数、CVR/投げ銭率はそのセルの分母に対する割合です。
      </p>
    </div>
  );
}
