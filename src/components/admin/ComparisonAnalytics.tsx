import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Filter, Monitor, Smartphone, Tablet, HelpCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface LogStats {
  totalLogs: number;
  interactedLogs: number;
  vehicleCounts: Record<string, number>;
  cheaperCounts: Record<string, number>;
  avgHours: number;
  avgDistance: number;
  donationClicks: number;
  donationAmountCounts: Record<number, number>;
  sourceCounts: Record<string, number>;
  campaignCounts: Record<string, number>;
  deviceCounts: Record<string, number>;
  browserCounts: Record<string, number>;
  languageCounts: Record<string, number>;
  timezoneCounts: Record<string, number>;
  recentLogs: Array<{
    session_id: string;
    vehicle_type: string | null;
    total_hours: number | null;
    distance: number | null;
    cheaper_service: string | null;
    has_interacted: boolean | null;
    donation_clicked: boolean | null;
    donation_amount: number | null;
    referrer_domain: string | null;
    utm_source: string | null;
    device_type: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

function classifySource(domain: string | null, utmSource: string | null): string {
  if (utmSource) return `utm:${utmSource}`;
  if (!domain) return "Direct/直接アクセス";
  const d = domain.toLowerCase();
  if (/google\./.test(d)) return "Google検索";
  if (/bing\./.test(d)) return "Bing検索";
  if (/yahoo\./.test(d)) return "Yahoo検索";
  if (/duckduckgo\./.test(d)) return "DuckDuckGo";
  if (/t\.co|twitter\.com|x\.com/.test(d)) return "X (Twitter)";
  if (/facebook\.com|fb\.com/.test(d)) return "Facebook";
  if (/instagram\.com/.test(d)) return "Instagram";
  if (/linkedin\.com/.test(d)) return "LinkedIn";
  if (/youtube\.com|youtu\.be/.test(d)) return "YouTube";
  if (/reddit\.com/.test(d)) return "Reddit";
  if (/hatena\.ne\.jp|b\.hatena/.test(d)) return "はてな";
  if (/note\.com/.test(d)) return "note";
  if (/tielec\.blog|tielec\./.test(d)) return "自社サイト";
  return d;
}

export function ComparisonAnalytics() {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterInteracted, setFilterInteracted] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comparison_logs")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (error || !data) {
      setLoading(false);
      return;
    }

    const vehicleCounts: Record<string, number> = {};
    const cheaperCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const campaignCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    const timezoneCounts: Record<string, number> = {};
    let totalHoursInteracted = 0;
    let totalDistanceInteracted = 0;
    let interactedLogs = 0;
    let donationClicks = 0;
    const donationAmountCounts: Record<number, number> = {};

    data.forEach((log: any) => {
      if (log.has_interacted) {
        interactedLogs++;
        totalHoursInteracted += log.total_hours || 0;
        totalDistanceInteracted += log.distance || 0;
        if (log.cheaper_service) {
          cheaperCounts[log.cheaper_service] = (cheaperCounts[log.cheaper_service] || 0) + 1;
        }
      }
      if (log.donation_clicked) {
        donationClicks++;
        if (log.donation_amount) {
          donationAmountCounts[log.donation_amount] = (donationAmountCounts[log.donation_amount] || 0) + 1;
        }
      }
      if (log.vehicle_type) {
        vehicleCounts[log.vehicle_type] = (vehicleCounts[log.vehicle_type] || 0) + 1;
      }
      // Access source breakdown
      const source = classifySource(log.referrer_domain, log.utm_source);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      if (log.utm_campaign) {
        const key = `${log.utm_source || "?"} / ${log.utm_campaign}`;
        campaignCounts[key] = (campaignCounts[key] || 0) + 1;
      }
      if (log.device_type) {
        deviceCounts[log.device_type] = (deviceCounts[log.device_type] || 0) + 1;
      }
      if (log.browser) {
        browserCounts[log.browser] = (browserCounts[log.browser] || 0) + 1;
      }
      if (log.language) {
        languageCounts[log.language] = (languageCounts[log.language] || 0) + 1;
      }
      if (log.timezone) {
        timezoneCounts[log.timezone] = (timezoneCounts[log.timezone] || 0) + 1;
      }
    });

    setStats({
      totalLogs: data.length,
      interactedLogs,
      vehicleCounts,
      cheaperCounts,
      avgHours: interactedLogs > 0 ? Math.round(totalHoursInteracted / interactedLogs) : 0,
      avgDistance: interactedLogs > 0 ? Math.round(totalDistanceInteracted / interactedLogs) : 0,
      donationClicks,
      donationAmountCounts,
      sourceCounts,
      campaignCounts,
      deviceCounts,
      browserCounts,
      languageCounts,
      timezoneCounts,
      recentLogs: data.slice(0, 20) as any,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="bg-card rounded-xl p-5 border border-border">
        <p className="text-muted-foreground">読み込み中...</p>
      </section>
    );
  }

  if (!stats || stats.totalLogs === 0) {
    return (
      <section className="bg-card rounded-xl p-5 border border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          利用データ分析
        </h2>
        <p className="text-muted-foreground text-sm mt-2">データがまだありません。</p>
      </section>
    );
  }

  const vehicleLabels: Record<string, string> = {
    compact: "コンパクト",
    compactMinivan: "コンパクトミニバン",
    minivan: "ミニバン",
  };

  const filteredLogs = filterInteracted
    ? stats.recentLogs.filter((log) => log.has_interacted)
    : stats.recentLogs;

  return (
    <section className="bg-card rounded-xl p-5 border border-border space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        利用データ分析
      </h2>

      {/* Funnel Analysis */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">ファネル分析</h3>
        {(() => {
          const steps = [
            { label: "ページアクセス", count: stats.totalLogs, rate: null as number | null },
            { label: "操作あり", count: stats.interactedLogs, rate: stats.totalLogs > 0 ? (stats.interactedLogs / stats.totalLogs) * 100 : 0 },
            { label: "投げ銭クリック", count: stats.donationClicks, rate: stats.interactedLogs > 0 ? (stats.donationClicks / stats.interactedLogs) * 100 : 0 },
          ];
          const maxCount = steps[0].count || 1;
          return (
            <div className="space-y-1">
              {steps.map((step, i) => (
                <div key={step.label}>
                  {i > 0 && (
                    <div className="flex items-center gap-2 pl-4 py-0.5">
                      <span className="text-muted-foreground text-xs">↓</span>
                      <span className="text-xs font-medium text-primary">{step.rate!.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div
                        className="h-10 rounded-md bg-primary/20 flex items-center px-3 transition-all"
                        style={{ width: `${Math.max((step.count / maxCount) * 100, 12)}%` }}
                      >
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground w-16 text-right">{step.count}件</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
          <p className="text-xs text-muted-foreground">総アクセス数</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-primary">{stats.interactedLogs}</p>
          <p className="text-xs text-muted-foreground">操作あり</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{stats.avgHours}h</p>
          <p className="text-xs text-muted-foreground">平均利用時間</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{stats.avgDistance}km</p>
          <p className="text-xs text-muted-foreground">平均走行距離</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-primary">
            {stats.cheaperCounts["carShare"] || 0} vs {stats.cheaperCounts["rentalCar"] || 0}
          </p>
          <p className="text-xs text-muted-foreground">シェア vs レンタカー</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.donationClicks}</p>
          <p className="text-xs text-muted-foreground">投げ銭クリック</p>
        </div>
      </div>

      {/* Donation Amount Distribution */}
      {stats.donationClicks > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">投げ銭金額別内訳</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.donationAmountCounts)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([amount, count]) => (
                <span
                  key={amount}
                  className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-sm"
                >
                  {Number(amount).toLocaleString()}円: {count}件
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Vehicle Type Distribution */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">車種別利用数</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.vehicleCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <span
                key={type}
                className="px-3 py-1 rounded-full bg-muted/50 border border-border text-sm"
              >
                {vehicleLabels[type] || type}: {count}件
              </span>
            ))}
        </div>
      </div>

      {/* Access Source Analysis */}
      <div className="space-y-3 pt-2 border-t border-border">
        <h3 className="text-sm font-bold text-foreground">📡 アクセス元分析</h3>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">流入元 TOP10</h4>
          <div className="space-y-1">
            {Object.entries(stats.sourceCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([source, count]) => {
                const pct = stats.totalLogs > 0 ? (count / stats.totalLogs) * 100 : 0;
                return (
                  <div key={source} className="flex items-center gap-2">
                    <div className="flex-1 relative h-7 bg-muted/30 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/30 flex items-center px-2"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      >
                        <span className="text-xs font-medium text-foreground whitespace-nowrap">
                          {source}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground w-24 text-right">
                      {count}件 ({pct.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {Object.keys(stats.campaignCounts).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">キャンペーン (utm)</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.campaignCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([key, count]) => (
                  <span
                    key={key}
                    className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-xs"
                  >
                    {key}: {count}件
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">デバイス内訳</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.deviceCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => (
                  <span key={k} className="px-3 py-1 rounded-full bg-muted/50 border border-border text-sm">
                    {k}: {v}件
                  </span>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">ブラウザ内訳</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.browserCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([k, v]) => (
                  <span key={k} className="px-3 py-1 rounded-full bg-muted/50 border border-border text-sm">
                    {k}: {v}件
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">言語 TOP5</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.languageCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([k, v]) => (
                  <span key={k} className="px-3 py-1 rounded-full bg-muted/50 border border-border text-xs">
                    {k}: {v}件
                  </span>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">タイムゾーン TOP5</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.timezoneCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([k, v]) => (
                  <span key={k} className="px-3 py-1 rounded-full bg-muted/50 border border-border text-xs">
                    {k}: {v}件
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">直近のログ（最新20件）</h3>
          <Button
            variant={filterInteracted ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterInteracted(!filterInteracted)}
            className="text-xs gap-1"
          >
            <Filter className="w-3 h-3" />
            操作ありのみ
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">利用条件</TableHead>
                <TableHead className="whitespace-nowrap">流入元</TableHead>
                <TableHead className="whitespace-nowrap text-center">デバイス</TableHead>
                <TableHead className="whitespace-nowrap">ステータス</TableHead>
                <TableHead className="whitespace-nowrap">投げ銭</TableHead>
                <TableHead className="whitespace-nowrap">日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const dt = new Date(log.updated_at);
                const shortDate = `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
                const fullDate = dt.toLocaleString("ja-JP");
                const device = (log.device_type || "").toLowerCase();
                const DeviceIcon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : device === "desktop" ? Monitor : HelpCircle;
                const sourceLabel = classifySource(log.referrer_domain, log.utm_source);

                return (
                  <TableRow key={log.session_id}>
                    {/* 利用条件: 車種 / 時間・距離 */}
                    <TableCell className="whitespace-nowrap py-2">
                      <div className="text-sm font-medium text-foreground">
                        {vehicleLabels[log.vehicle_type || ""] || log.vehicle_type || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {log.total_hours != null ? `${log.total_hours}h` : "-h"}
                        {" / "}
                        {log.distance != null ? `${log.distance}km` : "-km"}
                      </div>
                    </TableCell>
                    {/* 流入元 */}
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate whitespace-nowrap" title={sourceLabel}>
                      {sourceLabel}
                    </TableCell>
                    {/* デバイス: アイコン */}
                    <TableCell className="text-center" title={log.device_type || "unknown"}>
                      <DeviceIcon className="w-4 h-4 inline-block text-muted-foreground" />
                    </TableCell>
                    {/* ステータス: 操作 + 結果 */}
                    <TableCell className="whitespace-nowrap">
                      {log.has_interacted ? (
                        log.cheaper_service === "carShare" ? (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded whitespace-nowrap">シェア勝ち</span>
                        ) : log.cheaper_service === "rentalCar" ? (
                          <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded whitespace-nowrap">レンタカー勝ち</span>
                        ) : (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded whitespace-nowrap">操作あり</span>
                        )
                      ) : (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded whitespace-nowrap">閲覧のみ</span>
                      )}
                    </TableCell>
                    {/* 投げ銭 */}
                    <TableCell className="whitespace-nowrap">
                      {log.donation_clicked ? (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded whitespace-nowrap tabular-nums">
                          {log.donation_amount?.toLocaleString()}円
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {/* 日時 */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap tabular-nums" title={fullDate}>
                      {shortDate}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
