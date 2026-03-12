"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SpendRow = {
  offer_id: number;
  amount_usd: number;
  spend_date: string;
};

type RevenueRow = {
  offer_id: number;
  amount: number;
  revenue_date: string;
  channel: "facebook" | "tiktok" | null;
};

type ChannelProfitRow = {
  channel: "facebook" | "tiktok";
  label: string;
  spend: number;
  revenue: number;
  result: number;
  roi: number | null;
};

type PeriodKey = "today" | "yesterday" | "7d" | "month";

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hoy" },
  { key: "yesterday", label: "Ayer" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "month", label: "Este mes" },
];

function toDateInputString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(period: PeriodKey) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const end = new Date(today);
  const start = new Date(today);

  if (period === "yesterday") {
    start.setUTCDate(start.getUTCDate() - 1);
    end.setUTCDate(end.getUTCDate() - 1);
  }

  if (period === "7d") {
    start.setUTCDate(start.getUTCDate() - 6);
  }

  if (period === "month") {
    start.setUTCDate(1);
  }

  return {
    start: toDateInputString(start),
    end: toDateInputString(end),
  };
}

function formatCurrency(value: number) {
  const absoluteValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteValue);

  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatTableCurrency(value: number) {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);

  return `$${formatted}`;
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  const absoluteValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteValue);

  return value < 0 ? `-${formatted}%` : `${formatted}%`;
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-[#1d7a46]"
      : tone === "negative"
        ? "text-[#b4235f]"
        : "text-brand-primary";

  return (
    <article className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_12px_32px_rgba(7,19,37,0.05)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6c7f99]">{label}</p>
      <p className={`mt-4 text-4xl font-bold tracking-tight ${valueClass}`}>{formatCurrency(value)}</p>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_12px_32px_rgba(7,19,37,0.05)]"
          >
            <div className="skeleton-shimmer h-5 w-28 rounded-[2px]" />
            <div className="skeleton-shimmer mt-5 h-11 w-40 rounded-[2px]" />
          </article>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div className="skeleton-shimmer h-8 w-56 rounded-[2px]" />
          <div className="skeleton-shimmer h-8 w-24 rounded-[2px]" />
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
          <div className="grid grid-cols-5 gap-4 bg-[#f7f9fc] px-5 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-4 rounded-[2px]" />
            ))}
          </div>

          <div className="divide-y divide-[#eef3f8] bg-white">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="skeleton-shimmer h-8 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const supabase = getSupabaseBrowserClient();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [facebookSpend, setFacebookSpend] = useState<SpendRow[]>([]);
  const [tiktokSpend, setTiktokSpend] = useState<SpendRow[]>([]);
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    const { start, end } = getDateRange(period);
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      const [facebookResponse, tiktokResponse, revenueResponse] = await Promise.all([
        client.from("facebook_offer_spend").select("offer_id,amount_usd,spend_date").gte("spend_date", start).lte("spend_date", end),
        client.from("tiktok_offer_spend").select("offer_id,amount_usd,spend_date").gte("spend_date", start).lte("spend_date", end),
        client.from("offer_revenue").select("offer_id,amount,revenue_date,channel").gte("revenue_date", start).lte("revenue_date", end),
      ]);

      if (!active) {
        return;
      }

      if (facebookResponse.error || tiktokResponse.error || revenueResponse.error) {
        setError("No se pudo cargar el dashboard. Verifica que las tablas y sus políticas existan en Supabase.");
        setFacebookSpend([]);
        setTiktokSpend([]);
        setRevenueRows([]);
        setIsLoading(false);
        return;
      }

      setFacebookSpend(
        ((facebookResponse.data as SpendRow[]) ?? []).map((row) => ({
          offer_id: Number(row.offer_id),
          amount_usd: Number(row.amount_usd ?? 0),
          spend_date: String(row.spend_date),
        })),
      );
      setTiktokSpend(
        ((tiktokResponse.data as SpendRow[]) ?? []).map((row) => ({
          offer_id: Number(row.offer_id),
          amount_usd: Number(row.amount_usd ?? 0),
          spend_date: String(row.spend_date),
        })),
      );
      setRevenueRows(
        ((revenueResponse.data as RevenueRow[]) ?? []).map((row) => ({
          offer_id: Number(row.offer_id),
          amount: Number(row.amount ?? 0),
          revenue_date: String(row.revenue_date),
          channel: (row.channel as "facebook" | "tiktok" | null | undefined) ?? null,
        })),
      );
      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [period, supabase]);

  const channelRows = useMemo<ChannelProfitRow[]>(() => {
    const facebookSpendTotal = facebookSpend.reduce((sum, row) => sum + row.amount_usd, 0);
    const tiktokSpendTotal = tiktokSpend.reduce((sum, row) => sum + row.amount_usd, 0);
    const facebookRevenueTotal = revenueRows
      .filter((row) => row.channel === "facebook" || row.channel === null)
      .reduce((sum, row) => sum + row.amount, 0);
    const tiktokRevenueTotal = revenueRows
      .filter((row) => row.channel === "tiktok")
      .reduce((sum, row) => sum + row.amount, 0);

    return [
      {
        channel: "facebook",
        label: "Facebook Ads",
        spend: facebookSpendTotal,
        revenue: facebookRevenueTotal,
        result: facebookRevenueTotal - facebookSpendTotal,
        roi: facebookSpendTotal > 0 ? ((facebookRevenueTotal - facebookSpendTotal) / facebookSpendTotal) * 100 : null,
      },
      {
        channel: "tiktok",
        label: "TikTok Ads",
        spend: tiktokSpendTotal,
        revenue: tiktokRevenueTotal,
        result: tiktokRevenueTotal - tiktokSpendTotal,
        roi: tiktokSpendTotal > 0 ? ((tiktokRevenueTotal - tiktokSpendTotal) / tiktokSpendTotal) * 100 : null,
      },
    ];
  }, [facebookSpend, revenueRows, tiktokSpend]);

  const totalRevenue = useMemo(() => channelRows.reduce((sum, row) => sum + row.revenue, 0), [channelRows]);
  const totalSpend = useMemo(() => channelRows.reduce((sum, row) => sum + row.spend, 0), [channelRows]);
  const totalResult = totalRevenue - totalSpend;
  const resultTone = totalResult < 0 ? "negative" : totalResult > 0 ? "positive" : "default";
  const periodLabel = periodOptions.find((option) => option.key === period)?.label ?? "Este mes";

  if (!supabase) {
    return (
      <div className="rounded-[1.25rem] border border-[#d9e1ec] bg-white px-5 py-4 text-sm text-[#4b6283]">
        No se pudo inicializar Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)] xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => {
            const active = option.key === period;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError("");
                  setPeriod(option.key);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-primary text-white"
                    : "border border-[#d9e1ec] bg-white text-[#304866] hover:bg-[#f7f9fc]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.25rem] border border-[#f1c8d7] bg-[#fff4f8] px-5 py-4 text-sm text-[#a12856]">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <MetricCard label="Resultado" value={totalResult} tone={resultTone} />
            <MetricCard label="Revenue" value={totalRevenue} />
            <MetricCard label="Gasto" value={totalSpend} />
          </div>

          <div className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-brand-primary">Rentabilidad por canal</h3>
              <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
                {periodLabel}
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
              <table className="min-w-full divide-y divide-[#d9e1ec]">
                <thead className="bg-[#f7f9fc]">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
                    <th className="px-5 py-4">Canal</th>
                    <th className="px-5 py-4">Gasto</th>
                    <th className="px-5 py-4">Revenue</th>
                    <th className="px-5 py-4">Resultado</th>
                    <th className="px-5 py-4">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3f8] bg-white text-sm text-brand-primary">
                  {channelRows.map((row) => (
                    <tr key={row.channel}>
                      <td className="px-5 py-4 font-semibold">{row.label}</td>
                      <td className="px-5 py-4">{formatTableCurrency(row.spend)}</td>
                      <td className="px-5 py-4">{formatTableCurrency(row.revenue)}</td>
                      <td className={`px-5 py-4 font-semibold ${row.result >= 0 ? "text-[#1d7a46]" : "text-[#b4235f]"}`}>
                        {formatTableCurrency(row.result)}
                      </td>
                      <td className={`px-5 py-4 font-semibold ${row.roi !== null && row.roi >= 0 ? "text-[#1d7a46]" : "text-[#b4235f]"}`}>
                        {formatPercent(row.roi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
