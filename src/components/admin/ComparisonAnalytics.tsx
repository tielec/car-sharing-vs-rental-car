import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Filter } from "lucide-react";
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
  recentLogs: Array<{
    session_id: string;
    vehicle_type: string | null;
    total_hours: number | null;
    distance: number | null;
    cheaper_service: string | null;
    has_interacted: boolean | null;
    donation_clicked: boolean | null;
    donation_amount: number | null;
    created_at: string;
    updated_at: string;
  }>;
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
    let totalHours = 0;
    let totalDistance = 0;
    let interactedLogs = 0;
    let donationClicks = 0;
    const donationAmountCounts: Record<number, number> = {};

    data.forEach((log) => {
      if (log.has_interacted) interactedLogs++;
      if (log.donation_clicked) {
        donationClicks++;
        if (log.donation_amount) {
          donationAmountCounts[log.donation_amount] = (donationAmountCounts[log.donation_amount] || 0) + 1;
        }
      }
      if (log.vehicle_type) {
        vehicleCounts[log.vehicle_type] = (vehicleCounts[log.vehicle_type] || 0) + 1;
      }
      if (log.cheaper_service) {
        cheaperCounts[log.cheaper_service] = (cheaperCounts[log.cheaper_service] || 0) + 1;
      }
      totalHours += log.total_hours || 0;
      totalDistance += log.distance || 0;
    });

    setStats({
      totalLogs: data.length,
      interactedLogs,
      vehicleCounts,
      cheaperCounts,
      avgHours: data.length > 0 ? Math.round(totalHours / data.length) : 0,
      avgDistance: data.length > 0 ? Math.round(totalDistance / data.length) : 0,
      donationClicks,
      donationAmountCounts,
      recentLogs: data.slice(0, 20),
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
    sedan: "セダン",
    suv: "SUV",
    wagon: "ワゴン",
    van: "ミニバン",
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                <TableHead>車種</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>距離</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>投げ銭</TableHead>
                <TableHead>結果</TableHead>
                <TableHead>日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.session_id}>
                  <TableCell>{vehicleLabels[log.vehicle_type || ""] || log.vehicle_type || "-"}</TableCell>
                  <TableCell>{log.total_hours != null ? `${log.total_hours}h` : "-"}</TableCell>
                  <TableCell>{log.distance != null ? `${log.distance}km` : "-"}</TableCell>
                  <TableCell>
                    {log.has_interacted ? (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">操作あり</span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">閲覧のみ</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.donation_clicked ? (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                        {log.donation_amount?.toLocaleString()}円
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.cheaper_service === "carShare" ? (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">シェア</span>
                    ) : log.cheaper_service === "rentalCar" ? (
                      <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded">レンタカー</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.updated_at).toLocaleString("ja-JP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
