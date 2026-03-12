"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OfferOption = {
  id: number;
  offer_number: number | null;
  name: string;
};

type AdSpendRecord = {
  id: number;
  offer_id: number;
  spend_date: string;
  amount_usd: number;
  created_at: string;
};

type PeriodKey = "today" | "yesterday" | "7d" | "month";

type RankingRow = {
  offerId: number;
  offerName: string;
  amountUsd: number;
};

type SpendTableRow = {
  id: number;
  offerName: string;
  spendDate: string;
  amountUsd: number;
};

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hoy" },
  { key: "yesterday", label: "Ayer" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "month", label: "Este mes" },
];

function toDateInputString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getTodayDateString() {
  return toDateInputString(new Date());
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

function formatUsd(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `$${formatted}`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function RankingSpendCard({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: RankingRow[];
  tone: "high" | "low";
}) {
  const accentClass =
    tone === "high"
      ? "bg-[#e8f7ef] text-[#1d7a46]"
      : "bg-[#fde9ef] text-[#b4235f]";

  return (
    <article className="rounded-[1.25rem] border border-brand-primary/10 bg-white p-4 shadow-[0_12px_32px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-brand-primary">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${accentClass}`}>
          Top 5
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-[#5d728e]">Aún no hay gasto registrado en este período.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <div
              key={`${title}-${row.offerId}`}
              className="flex items-center justify-between rounded-[0.9rem] bg-[#f7f9fc] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7c8ea6]">#{index + 1}</p>
                <p className="truncate text-[15px] font-semibold text-brand-primary">{row.offerName}</p>
              </div>
              <p className="text-[15px] font-semibold text-brand-primary">{formatUsd(row.amountUsd)}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function RankingCardSkeleton() {
  return (
    <article className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-4 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div className="skeleton-shimmer h-7 w-40 shrink-0 rounded-[2px]" />
        <div className="skeleton-shimmer h-8 w-[4.8rem] shrink-0 rounded-[2px]" />
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-[3rem] rounded-[0.5rem]" />
        ))}
      </div>
    </article>
  );
}

function SpendMetricCardSkeleton() {
  return (
    <article className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="skeleton-shimmer h-7 w-32 rounded-[2px]" />
      <div className="skeleton-shimmer mt-5 h-12 w-36 rounded-[2px]" />
      <div className="skeleton-shimmer mt-4 h-4 w-28 rounded-[2px]" />
    </article>
  );
}

function SpendTableSkeleton({ periodLabel }: { periodLabel: string }) {
  return (
    <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-brand-primary">Tabla de gasto</h3>
        <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#d9e1ec]">
        <div className="grid grid-cols-3 gap-4 bg-[#f7f9fc] px-6 py-4 text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
          <div>Oferta</div>
          <div>Fecha</div>
          <div>Gasto (USD)</div>
        </div>

        <div className="divide-y divide-[#eef3f8] bg-white">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="px-4 py-3">
              <div className="skeleton-shimmer h-7 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type SpendModalMode = "update" | null;

type AdSpendPanelProps = {
  sourceLabel: string;
  tableName: "facebook_offer_spend" | "tiktok_offer_spend";
};

export function AdSpendPanel({ sourceLabel, tableName }: AdSpendPanelProps) {
  const rowsPerPage = 10;
  const supabase = getSupabaseBrowserClient();
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [offers, setOffers] = useState<OfferOption[]>([]);
  const [spendRows, setSpendRows] = useState<AdSpendRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<SpendModalMode>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updateForm, setUpdateForm] = useState({
    offerId: "",
    spendDate: getTodayDateString(),
    amountUsd: "",
  });

  const periodLabel = periodOptions.find((option) => option.key === period)?.label ?? "Hoy";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const { start, end } = getDateRange(period);
    let active = true;

    Promise.all([
      supabase.from("offers").select("id,offer_number,name").order("name"),
      supabase
        .from(tableName)
        .select("id,offer_id,spend_date,amount_usd,created_at")
        .gte("spend_date", start)
        .lte("spend_date", end)
        .order("spend_date", { ascending: false })
        .order("id", { ascending: false }),
    ]).then(([offersResponse, spendResponse]) => {
      if (!active) {
        return;
      }

      if (offersResponse.error) {
        setError("No se pudieron cargar las ofertas.");
      } else {
        const nextOffers = (offersResponse.data as OfferOption[]) ?? [];
        setOffers(nextOffers);

        if (nextOffers.length > 0) {
          const firstOfferId = String(nextOffers[0].id);

          setUpdateForm((current) => ({
            ...current,
            offerId: current.offerId || firstOfferId,
          }));
        }
      }

      if (spendResponse.error) {
        setSpendRows([]);
        setError(`No se pudo cargar el gasto de ${sourceLabel}. Verifica que la tabla y sus políticas ya existan en Supabase.`);
      } else {
        setSpendRows((spendResponse.data as AdSpendRecord[]) ?? []);
      }

      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [period, sourceLabel, supabase, tableName]);

  const offersById = useMemo(() => {
    return new Map(
      offers.map((offer) => [
        offer.id,
        offer.offer_number ? `#${offer.offer_number} · ${offer.name}` : offer.name,
      ]),
    );
  }, [offers]);

  const totalSpend = useMemo(() => {
    return spendRows.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0);
  }, [spendRows]);

  const rankingRows = useMemo<RankingRow[]>(() => {
    const totalsByOffer = new Map<number, number>();

    for (const row of spendRows) {
      totalsByOffer.set(row.offer_id, (totalsByOffer.get(row.offer_id) ?? 0) + Number(row.amount_usd ?? 0));
    }

    return [...totalsByOffer.entries()].map(([offerId, amountUsd]) => ({
      offerId,
      offerName: offersById.get(offerId) ?? `Oferta #${offerId}`,
      amountUsd: Number(amountUsd.toFixed(3)),
    }));
  }, [offersById, spendRows]);

  const highestSpendRows = useMemo(
    () => [...rankingRows].sort((a, b) => b.amountUsd - a.amountUsd).slice(0, 5),
    [rankingRows],
  );

  const lowestSpendRows = useMemo(
    () => [...rankingRows].sort((a, b) => a.amountUsd - b.amountUsd).slice(0, 5),
    [rankingRows],
  );

  const sortedTableRows = useMemo<SpendTableRow[]>(() => {
    return spendRows.map((row) => ({
      id: row.id,
      offerName: offersById.get(row.offer_id) ?? `Oferta #${row.offer_id}`,
      spendDate: row.spend_date,
      amountUsd: Number(row.amount_usd ?? 0),
    }));
  }, [offersById, spendRows]);

  const totalRows = sortedTableRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const tableRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return sortedTableRows.slice(startIndex, startIndex + rowsPerPage);
  }, [rowsPerPage, safeCurrentPage, sortedTableRows]);

  function mergeSpendRow(nextRow: AdSpendRecord) {
    setSpendRows((current) => {
      const nextRows = [...current];
      const existingIndex = nextRows.findIndex(
        (row) => row.offer_id === nextRow.offer_id && row.spend_date === nextRow.spend_date,
      );

      if (existingIndex >= 0) {
        nextRows[existingIndex] = nextRow;
      } else {
        nextRows.unshift(nextRow);
      }

      return nextRows.sort((a, b) => {
        if (a.spend_date === b.spend_date) {
          return b.id - a.id;
        }

        return b.spend_date.localeCompare(a.spend_date);
      });
    });
  }

  function openModal(mode: Exclude<SpendModalMode, null>) {
    setError("");
    setSuccess("");

    const defaultOfferId = offers[0] ? String(offers[0].id) : "";

    setUpdateForm((current) => ({
      ...current,
      offerId: current.offerId || defaultOfferId,
      spendDate: current.spendDate || getTodayDateString(),
    }));

    setModalMode(mode);
  }

  function closeModal() {
    setModalMode(null);
  }

  async function handleUpsertSpend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      return;
    }

    const offerId = Number(updateForm.offerId);
    const amountUsd = Number(updateForm.amountUsd);

    if (!offerId) {
      setError("Selecciona una oferta.");
      return;
    }

    if (!updateForm.spendDate) {
      setError("Selecciona una fecha.");
      return;
    }

    if (!updateForm.amountUsd.trim() || Number.isNaN(amountUsd) || amountUsd < 0) {
      setError("Escribe un monto válido.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: upsertError } = await supabase
      .from(tableName)
      .upsert(
        {
          offer_id: offerId,
          spend_date: updateForm.spendDate,
          amount_usd: amountUsd,
        },
        {
          onConflict: "offer_id,spend_date",
        },
      )
      .select("id,offer_id,spend_date,amount_usd,created_at")
      .single();

    if (upsertError) {
      setError("No se pudo actualizar el gasto.");
      setIsSubmitting(false);
      return;
    }

    mergeSpendRow(data as AdSpendRecord);
    setUpdateForm({
      offerId: updateForm.offerId,
      spendDate: getTodayDateString(),
      amountUsd: "",
    });
    setCurrentPage(1);
    setSuccess("Gasto actualizado correctamente.");
    closeModal();
    setIsSubmitting(false);
  }

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
                  setCurrentPage(1);
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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openModal("update")}
            disabled={offers.length === 0}
            className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Actualizar gasto
          </button>
        </div>
      </div>

      {!isLoading && offers.length === 0 ? (
        <div className="rounded-[1.25rem] border border-[#d9e1ec] bg-white px-5 py-4 text-sm text-[#4b6283]">
          Primero crea una oferta en el módulo de Ofertas para poder registrar gasto de {sourceLabel}.
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[1.25rem] border border-[#d5eadf] bg-[#eef9f2] px-5 py-4 text-sm text-[#256c4a]">
          {success}
        </div>
      ) : null}

      {error && !modalMode ? (
        <div className="rounded-[1.25rem] border border-[#f1c8d7] bg-[#fff4f8] px-5 py-4 text-sm text-[#a12856]">
          {error}
        </div>
      ) : null}

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071325]/60 px-4 py-8 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="Cerrar popup"
            className="absolute inset-0 cursor-default"
            onClick={closeModal}
          />

          <form
            onSubmit={handleUpsertSpend}
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-brand-primary/10 bg-white p-6 shadow-[0_30px_90px_rgba(7,19,37,0.24)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-brand-primary">Actualizar gasto</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d728e]">
                  Actualiza el monto de una oferta. Si no existe, se crea automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#d9e1ec] px-3 py-2 text-sm font-semibold text-[#304866] transition hover:bg-[#f7f9fc]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">Oferta</span>
                <select
                  value={updateForm.offerId}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setUpdateForm((current) => ({ ...current, offerId: nextValue }));
                  }}
                  className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
                  required
                >
                  {offers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.offer_number ? `#${offer.offer_number} · ${offer.name}` : offer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">Fecha</span>
                <input
                  type="date"
                  value={updateForm.spendDate}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setUpdateForm((current) => ({ ...current, spendDate: nextValue }));
                  }}
                  className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">Nuevo monto (USD)</span>
                <div className="flex items-center rounded-[12px] border border-[#cbd5e1] bg-white focus-within:border-[#1e3a8a]">
                  <span className="pl-4 text-sm font-semibold text-brand-primary">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.001"
                    value={updateForm.amountUsd}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setUpdateForm((current) => ({ ...current, amountUsd: nextValue }));
                    }}
                    placeholder="120.500"
                    className="w-full rounded-[12px] bg-transparent px-2 py-3 text-sm outline-none"
                    required
                  />
                </div>
              </label>
            </div>

            {error ? <p className="mt-5 text-sm text-brand-secondary">{error}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#d9e1ec] px-4 py-3 text-sm font-semibold text-[#304866] transition hover:bg-[#f7f9fc]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSubmitting ? "Guardando..." : "Actualizar gasto"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-3">
            <SpendMetricCardSkeleton />
            <RankingCardSkeleton />
            <RankingCardSkeleton />
          </div>
          <SpendTableSkeleton periodLabel={periodLabel} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-[1.25rem] border border-brand-primary/10 bg-white p-5 shadow-[0_12px_32px_rgba(7,19,37,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6c7f99]">Gasto total</p>
              <p className="mt-4 text-4xl font-bold tracking-tight text-brand-primary">{formatUsd(totalSpend)}</p>
              <p className="mt-3 text-sm text-[#5d728e]">USD según el rango de fecha seleccionado.</p>
            </article>

            <RankingSpendCard title="Top 5 ofertas con mayor gasto" rows={highestSpendRows} tone="high" />
            <RankingSpendCard title="Top 5 ofertas con menor gasto" rows={lowestSpendRows} tone="low" />
          </div>

          <div className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-brand-primary">Tabla de gasto</h3>
              <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
                {periodLabel}
              </span>
            </div>

            {tableRows.length === 0 ? (
              <p className="mt-6 text-sm text-[#5d728e]">No hay gasto registrado en este período.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
                <table className="min-w-full divide-y divide-[#d9e1ec]">
                  <thead className="bg-[#f7f9fc]">
                    <tr className="text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
                      <th className="px-5 py-4">Oferta</th>
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">Gasto (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3f8] bg-white text-sm text-brand-primary">
                    {tableRows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4 font-semibold">{row.offerName}</td>
                        <td className="px-5 py-4">{formatDateLabel(row.spendDate)}</td>
                        <td className="px-5 py-4 font-semibold">{formatUsd(row.amountUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalRows > 0 ? (
              <div className="mt-4 flex items-center justify-end gap-3 text-sm text-[#304866]">
                <span>{totalRows} Total</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="px-1 text-[#6c7f99] transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Primera página"
                >
                  |&lt;
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-1 text-[#6c7f99] transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Página anterior"
                >
                  &lt;
                </button>
                <span className="min-w-4 text-center font-semibold text-brand-primary">{safeCurrentPage}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-1 text-[#6c7f99] transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Página siguiente"
                >
                  &gt;
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="px-1 text-[#6c7f99] transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Última página"
                >
                  &gt;|
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export function FacebookSpendPanel() {
  return <AdSpendPanel sourceLabel="Facebook Ads" tableName="facebook_offer_spend" />;
}
