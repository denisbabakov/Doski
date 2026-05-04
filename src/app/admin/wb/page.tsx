"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RefreshCw, ExternalLink, TrendingUp, MousePointerClick, ShoppingBag, Percent } from "lucide-react";

interface AnalyticsData {
  totalClicks: number;
  wbOrders: { total: number; byDay: Record<string, number> };
  clicksByDay: Record<string, number>;
  topProducts: Array<{ id: string; name: string; wbArticle: number; images: string[]; clicks: number }>;
}

function last30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

function BarChart({ clicks, orders }: { clicks: Record<string, number>; orders: Record<string, number> }) {
  const days = last30Days();
  const maxVal = Math.max(1, ...days.map((d) => Math.max(clicks[d] ?? 0, orders[d] ?? 0)));
  const w = 100 / days.length;

  return (
    <div className="relative h-40 flex items-end gap-px px-1">
      {days.map((day, i) => {
        const c = clicks[day] ?? 0;
        const o = orders[day] ?? 0;
        const label = day.slice(5);
        return (
          <div key={day} className="flex-1 flex items-end gap-px group relative" style={{ minWidth: 0 }}>
            <div
              className="flex-1 bg-[var(--amber)] opacity-80 rounded-t-sm transition-all group-hover:opacity-100"
              style={{ height: `${(c / maxVal) * 100}%` }}
            />
            <div
              className="flex-1 bg-emerald-500 opacity-60 rounded-t-sm transition-all group-hover:opacity-90"
              style={{ height: `${(o / maxVal) * 100}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center bg-black border border-[var(--border)] px-2 py-1 text-[10px] whitespace-nowrap z-10">
              <span className="text-[var(--text-dim)]">{label}</span>
              <span className="text-[var(--amber)]">↗ {c} кликов</span>
              <span className="text-emerald-400">🛒 {o} заказов</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WbAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/analytics/wb")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync/wb", { method: "POST" });
      const json = await res.json();
      setSyncResult(json.ok ? { synced: json.synced } : { synced: 0, error: json.error });
      if (json.ok) load();
    } catch {
      setSyncResult({ synced: 0, error: "Ошибка сети" });
    } finally {
      setSyncing(false);
    }
  };

  const conv = data && data.totalClicks > 0
    ? ((data.wbOrders.total / data.totalClicks) * 100).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-1">Интеграция</p>
            <h1 className="text-2xl font-black font-[family-name:var(--font-exo)]">
              Wildberries <span className="text-[var(--amber)]">Аналитика</span>
            </h1>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--amber)] text-black text-sm font-bold hover:bg-[var(--sky-hi)] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Синхронизация..." : "Синхронизировать с WB"}
          </button>
        </div>

        {syncResult && (
          <div className={`mb-6 px-4 py-3 border text-sm ${syncResult.error ? "border-red-500 text-red-400 bg-red-500/10" : "border-emerald-500 text-emerald-400 bg-emerald-500/10"}`}>
            {syncResult.error
              ? `Ошибка: ${syncResult.error}`
              : `✓ Синхронизировано ${syncResult.synced} товаров из Wildberries`}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { icon: MousePointerClick, label: "Кликов с сайта",  value: loading ? "—" : (data?.totalClicks ?? 0).toString(), color: "text-[var(--amber)]" },
            { icon: ShoppingBag,       label: "Заказов на WB",   value: loading ? "—" : (data?.wbOrders.total ?? 0).toString(), color: "text-emerald-400" },
            { icon: Percent,           label: "Конверсия",        value: loading ? "—" : `${conv}%`, color: "text-sky-400" },
            { icon: TrendingUp,        label: "Период",           value: "30 дней", color: "text-[var(--text-muted)]" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
              <Icon className={`w-4 h-4 mb-3 ${color}`} />
              <p className={`text-2xl font-black font-[family-name:var(--font-exo)] ${color}`}>{value}</p>
              <p className="text-xs text-[var(--text-dim)] mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)]">Активность за 30 дней</h2>
            <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--amber)] inline-block rounded-sm" /> Клики</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 inline-block rounded-sm" /> Заказы WB</span>
            </div>
          </div>
          {loading
            ? <div className="h-40 flex items-center justify-center text-[var(--text-dim)]">Загрузка...</div>
            : <BarChart clicks={data?.clicksByDay ?? {}} orders={data?.wbOrders.byDay ?? {}} />
          }
        </div>

        {/* Top products */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-dim)] mb-5">Топ товаров по кликам</h2>
          {loading ? (
            <p className="text-[var(--text-dim)] text-sm">Загрузка...</p>
          ) : !data?.topProducts.length ? (
            <p className="text-[var(--text-dim)] text-sm">Кликов пока нет. Синхронизируйте товары и поделитесь ссылкой на категорию.</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs font-bold text-[var(--text-dim)] w-5 text-right">{i + 1}</span>
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden bg-[var(--bg-card-2)]">
                    {p.images?.[0]
                      ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg text-[var(--border-hi)]">◻</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                    <p className="text-xs text-[var(--text-dim)]">Арт. {p.wbArticle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[var(--amber)]">{p.clicks}</p>
                    <p className="text-[10px] text-[var(--text-dim)]">кликов</p>
                  </div>
                  <a
                    href={`https://www.wildberries.ru/catalog/${p.wbArticle}/detail.aspx`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-dim)] hover:text-[var(--amber)] transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
