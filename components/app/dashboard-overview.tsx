"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OfferRow = {
  id: number;
  offer_number: number | null;
  name: string;
};

type SpendRow = {
  offer_id: number;
  amount_usd: number;
  spend_date: string;
};

type RevenueRow = {
  offer_id: number;
  amount: number;
  revenue_date: string;
};

type DashboardOfferRow = {
  id: number;
  offerNumber: number | null;
  name: string;
  revenue: number;
  spend: number;
  result: number;
};

type SortField = "revenue" | "spend" | "result";
type SortDirection = "desc" | "asc";
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

function SortFunnelIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition ${active ? "text-brand-primary" : "text-[#8aa0bd]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 5.25h13" />
      <path d="M6 9.5h8" />
      <path d="M8.5 13.75h3" />
    </svg>
  );
}

function SortHeaderButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-left transition hover:text-brand-primary"
      aria-label={`${label}. Orden actual ${direction === "desc" ? "de mayor a menor" : "de menor a mayor"}`}
    >
      <span>{label}</span>
      <SortFunnelIcon active={active} />
    </button>
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
        <div className="skeleton-shimmer h-8 w-48 rounded-[2px]" />

        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
          <div className="grid grid-cols-5 gap-4 bg-[#f7f9fc] px-5 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-4 rounded-[2px]" />
            ))}
          </div>

          <div className="divide-y divide-[#eef3f8] bg-white">
            {Array.from({ length: 6 }).map((_, index) => (
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
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [facebookSpend, setFacebookSpend] = useState<SpendRow[]>([]);
  const [tiktokSpend, setTiktokSpend] = useState<SpendRow[]>([]);
  const [revenueRows, setRevenueRows] = useState<RevenueRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortState, setSortState] = useState<{ field: SortField; direction: SortDirection } | null>(null);

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

      const [offersResponse, facebookResponse, tiktokResponse, revenueResponse] = await Promise.all([
        client.from("offers").select("id,offer_number,name").order("offer_number", { ascending: true, nullsFirst: false }),
        client.from("facebook_offer_spend").select("offer_id,amount_usd,spend_date").gte("spend_date", start).lte("spend_date", end),
        client.from("tiktok_offer_spend").select("offer_id,amount_usd,spend_date").gte("spend_date", start).lte("spend_date", end),
        client.from("offer_revenue").select("offer_id,amount,revenue_date").gte("revenue_date", start).lte("revenue_date", end),
      ]);

      if (!active) {
        return;
      }

      if (offersResponse.error || facebookResponse.error || tiktokResponse.error || revenueResponse.error) {
        setError("No se pudo cargar el dashboard. Verifica que las tablas y sus politicas existan en Supabase.");
        setOffers([]);
        setFacebookSpend([]);
        setTiktokSpend([]);
        setRevenueRows([]);
        setIsLoading(false);
        return;
      }

      setOffers((offersResponse.data as OfferRow[]) ?? []);
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
        })),
      );
      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [period, supabase]);

  const dashboardRows = useMemo<DashboardOfferRow[]>(() => {
    const spendByOffer = new Map<number, number>();
    const revenueByOffer = new Map<number, number>();

    for (const row of facebookSpend) {
      spendByOffer.set(row.offer_id, (spendByOffer.get(row.offer_id) ?? 0) + row.amount_usd);
    }

    for (const row of tiktokSpend) {
      spendByOffer.set(row.offer_id, (spendByOffer.get(row.offer_id) ?? 0) + row.amount_usd);
    }

    for (const row of revenueRows) {
      revenueByOffer.set(row.offer_id, (revenueByOffer.get(row.offer_id) ?? 0) + row.amount);
    }

    return offers
      .map((offer) => {
        const revenue = revenueByOffer.get(offer.id) ?? 0;
        const spend = spendByOffer.get(offer.id) ?? 0;

        return {
          id: offer.id,
          offerNumber: offer.offer_number,
          name: offer.name,
          revenue,
          spend,
          result: revenue - spend,
        };
      })
      .sort((a, b) => {
        if (a.offerNumber && b.offerNumber) {
          return a.offerNumber - b.offerNumber;
        }

        if (a.offerNumber) {
          return -1;
        }

        if (b.offerNumber) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      });
  }, [facebookSpend, offers, revenueRows, tiktokSpend]);

  const sortedDashboardRows = useMemo(() => {
    if (!sortState) {
      return dashboardRows;
    }

    const multiplier = sortState.direction === "desc" ? -1 : 1;

    return [...dashboardRows].sort((a, b) => {
      const difference = (a[sortState.field] - b[sortState.field]) * multiplier;

      if (difference !== 0) {
        return difference;
      }

      if (a.offerNumber && b.offerNumber) {
        return a.offerNumber - b.offerNumber;
      }

      return a.name.localeCompare(b.name);
    });
  }, [dashboardRows, sortState]);

  const totalRevenue = useMemo(
    () => dashboardRows.reduce((sum, row) => sum + row.revenue, 0),
    [dashboardRows],
  );

  const totalSpend = useMemo(
    () => dashboardRows.reduce((sum, row) => sum + row.spend, 0),
    [dashboardRows],
  );

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

  function toggleSort(field: SortField) {
    setSortState((current) => {
      if (!current || current.field !== field) {
        return { field, direction: "desc" };
      }

      return {
        field,
        direction: current.direction === "desc" ? "asc" : "desc",
      };
    });
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
              <h3 className="text-2xl font-bold text-brand-primary">Detalle por oferta</h3>
              <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
                {periodLabel}
              </span>
            </div>

            {dashboardRows.length === 0 ? (
              <p className="mt-6 text-sm text-[#5d728e]">Todavía no hay ofertas para mostrar en el dashboard.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
                <table className="min-w-full divide-y divide-[#d9e1ec]">
                  <thead className="bg-[#f7f9fc]">
                    <tr className="text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">Nombre</th>
                      <th className="px-5 py-4">
                        <SortHeaderButton
                          label="Revenue"
                          active={sortState?.field === "revenue"}
                          direction={sortState?.field === "revenue" ? sortState.direction : "desc"}
                          onClick={() => toggleSort("revenue")}
                        />
                      </th>
                      <th className="px-5 py-4">
                        <SortHeaderButton
                          label="Gasto"
                          active={sortState?.field === "spend"}
                          direction={sortState?.field === "spend" ? sortState.direction : "desc"}
                          onClick={() => toggleSort("spend")}
                        />
                      </th>
                      <th className="px-5 py-4">
                        <SortHeaderButton
                          label="Resultado"
                          active={sortState?.field === "result"}
                          direction={sortState?.field === "result" ? sortState.direction : "desc"}
                          onClick={() => toggleSort("result")}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f8] bg-white text-sm text-brand-primary">
                    {sortedDashboardRows.map((row) => {
                      const rowResultClass =
                        row.result < 0 ? "text-[#b4235f]" : row.result > 0 ? "text-[#1d7a46]" : "text-brand-primary";

                      return (
                        <tr key={row.id}>
                          <td className="px-5 py-4 font-semibold">{row.offerNumber ? `#${row.offerNumber}` : `#${row.id}`}</td>
                          <td className="px-5 py-4 font-semibold">{row.name}</td>
                          <td className="px-5 py-4 font-semibold">{formatCurrency(row.revenue)}</td>
                          <td className="px-5 py-4 font-semibold">{formatCurrency(row.spend)}</td>
                          <td className={`px-5 py-4 font-semibold ${rowResultClass}`}>{formatCurrency(row.result)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
