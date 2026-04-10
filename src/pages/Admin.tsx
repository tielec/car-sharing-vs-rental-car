import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGasolinePrice } from "@/hooks/useGasolinePrice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Car, LogOut, Fuel, ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PriceOverride {
  id: string;
  price: number;
  note: string | null;
  is_active: boolean;
  created_at: string;
  set_by: string;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const gasolinePrice = useGasolinePrice();

  const [overrides, setOverrides] = useState<PriceOverride[]>([]);
  const [newPrice, setNewPrice] = useState("");
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fetchingApi, setFetchingApi] = useState(false);

  const fetchOverrides = async () => {
    const { data } = await supabase
      .from("gasoline_price_overrides")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setOverrides(data);
  };

  useEffect(() => {
    fetchOverrides();
  }, []);

  const activeOverride = overrides.find((o) => o.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    // Deactivate existing active overrides
    if (activeOverride) {
      await supabase
        .from("gasoline_price_overrides")
        .update({ is_active: false })
        .eq("is_active", true);
    }

    const { error } = await supabase.from("gasoline_price_overrides").insert({
      price: Number(newPrice),
      note: newNote || null,
      set_by: user.id,
      is_active: true,
    });

    if (error) {
      toast({ title: "エラー", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ガソリン価格を設定しました" });
      setNewPrice("");
      setNewNote("");
      fetchOverrides();
    }
    setSubmitting(false);
  };

  const handleClearOverride = async () => {
    await supabase
      .from("gasoline_price_overrides")
      .update({ is_active: false })
      .eq("is_active", true);
    toast({ title: "手動設定をクリアしました（自動取得に戻ります）" });
    fetchOverrides();
  };

  const handleDeleteOverride = async (id: string) => {
    await supabase.from("gasoline_price_overrides").delete().eq("id", id);
    toast({ title: "削除しました" });
    fetchOverrides();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">管理画面</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              トップへ
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-3xl">
        {/* Current Price Status */}
        <section className="bg-card rounded-xl p-5 border border-border space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            現在のガソリン価格
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">API自動取得価格</p>
              <p className="text-2xl font-bold text-foreground">
                {gasolinePrice.isLoading ? "取得中..." : `${gasolinePrice.price}円/L`}
              </p>
              {gasolinePrice.fetchDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  データ日: {gasolinePrice.fetchDate}
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">手動上書き価格</p>
              {activeOverride ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    {activeOverride.price}円/L
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activeOverride.created_at).toLocaleString("ja-JP")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleClearOverride}
                  >
                    自動取得に戻す
                  </Button>
                </>
              ) : (
                <p className="text-2xl font-bold text-muted-foreground">未設定</p>
              )}
            </div>
          </div>
        </section>

        {/* Set Override */}
        <section className="bg-card rounded-xl p-5 border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground">手動価格設定</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">ガソリン単価（円/L）</Label>
                <Input
                  id="price"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  min={100}
                  max={300}
                  required
                  placeholder="例: 165"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">メモ（任意）</Label>
                <Textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="例: 2024年1月の全国平均"
                  rows={1}
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : "価格を設定"}
            </Button>
          </form>
        </section>

        {/* History */}
        <section className="bg-card rounded-xl p-5 border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground">設定履歴</h2>
          {overrides.length === 0 ? (
            <p className="text-muted-foreground text-sm">履歴はありません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>価格</TableHead>
                  <TableHead>メモ</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>日時</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.price}円/L</TableCell>
                    <TableCell className="text-muted-foreground">{o.note || "-"}</TableCell>
                    <TableCell>
                      {o.is_active ? (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">有効</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">無効</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOverride(o.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
}
