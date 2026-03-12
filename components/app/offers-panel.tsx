"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAppShell } from "@/components/app/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Offer = {
  id: number;
  offer_number: number;
  owner_user_id: string;
  name: string;
  category: string;
  offer_type: string;
  language: string;
  payout: number;
  payout_currency: string;
  is_active: boolean;
  created_at: string;
};

type SpendMetric = {
  offer_id: number;
  amount_usd: number;
};

type RevenueMetric = {
  offer_id: number;
  amount: number;
};

type OfferRow = {
  id: number;
  offerNumber: number;
  name: string;
  category: string;
  spend: number;
  revenue: number;
  result: number;
};

type PeriodKey = "today" | "yesterday" | "7d" | "month";

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hoy" },
  { key: "yesterday", label: "Ayer" },
  { key: "7d", label: "7 días" },
  { key: "month", label: "Este mes" },
];

const categoryOptions = ["Auto", "Life Insurance", "Final Expenses", "Otra"];
const typeOptions = ["PPC", "PPL", "Otro"];
const languageOptions = ["EN", "ES", "Otro"];
const currencyOptions = ["USD", "EUR", "GBP", "CAD", "MXN", "Otro"];

function SelectOrCustomField({
  label,
  value,
  options,
  placeholder,
  customOption,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  customOption: string;
  onChange: (value: string) => void;
}) {
  const isCustom = !options.includes(value) || value === customOption;

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-brand-primary">{label}</span>
      {isCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value === "Otro" ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
            required
          />
          <button
            type="button"
            onClick={() => onChange(options[0])}
            className="shrink-0 rounded-[12px] border border-[#d9e1ec] px-4 py-3 text-sm font-semibold text-[#304866] transition hover:bg-[#f7f9fc]"
          >
            Lista
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}

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

function formatUsd(value: number) {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);

  return `$${formatted}`;
}

function RankingCard({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: OfferRow[];
  tone: "best" | "worst";
}) {
  const accentClass =
    tone === "best"
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
        <p className="mt-5 text-sm text-[#5d728e]">Aún no hay datos suficientes para este período.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <div key={`${title}-${row.id}`} className="flex items-start justify-between rounded-[0.9rem] bg-[#f7f9fc] px-3 py-1.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] uppercase leading-none tracking-[0.18em] text-[#7c8ea6]">#{index + 1}</p>
                <p className="truncate text-[15px] font-semibold leading-none text-brand-primary">{row.name}</p>
                <p className="truncate text-xs leading-none text-[#5d728e]">{row.category}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[15px] font-semibold leading-none text-brand-primary">{formatUsd(row.result)}</p>
                <p className="text-[11px] leading-none text-[#5d728e]">
                  Rev {formatUsd(row.revenue)} / Gasto {formatUsd(row.spend)}
                </p>
              </div>
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

function OffersTableSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-brand-primary">Tabla de ofertas</h3>
        <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
          Hoy
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#d9e1ec]">
        <div className="grid grid-cols-5 gap-4 bg-[#f7f9fc] px-6 py-4 text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
          <div>ID</div>
          <div>Categoría</div>
          <div>Gasto</div>
          <div>Revenue</div>
          <div>Resultado</div>
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

export function OffersPanel() {
  const rowsPerPage = 10;
  const { session } = useAppShell();
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [facebookSpend, setFacebookSpend] = useState<SpendMetric[]>([]);
  const [tiktokSpend, setTiktokSpend] = useState<SpendMetric[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    offerNumber: "",
    name: "",
    category: "Auto",
    offerType: "PPC",
    language: "EN",
    payoutCurrency: "USD",
    payout: "",
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const { start, end } = getDateRange(period);
    let active = true;

    Promise.all([
      supabase
        .from("offers")
        .select("id,offer_number,owner_user_id,name,category,offer_type,language,payout,payout_currency,is_active,created_at")
        .order("id", { ascending: false }),
      supabase
        .from("facebook_offer_spend")
        .select("offer_id,amount_usd")
        .gte("spend_date", start)
        .lte("spend_date", end),
      supabase
        .from("tiktok_offer_spend")
        .select("offer_id,amount_usd")
        .gte("spend_date", start)
        .lte("spend_date", end),
      supabase
        .from("offer_revenue")
        .select("offer_id,amount")
        .gte("revenue_date", start)
        .lte("revenue_date", end),
    ]).then(([offersResponse, facebookResponse, tiktokResponse, revenueResponse]) => {
      if (!active) {
        return;
      }

      if (offersResponse.error || facebookResponse.error || tiktokResponse.error || revenueResponse.error) {
        setError("No se pudieron cargar las ofertas.");
      } else {
        setOffers((offersResponse.data as Offer[]) ?? []);
        setFacebookSpend((facebookResponse.data as SpendMetric[]) ?? []);
        setTiktokSpend((tiktokResponse.data as SpendMetric[]) ?? []);
        setRevenueMetrics((revenueResponse.data as RevenueMetric[]) ?? []);
      }

      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [period]);

  const summaryRows = useMemo<OfferRow[]>(() => {
    const spendByOffer = new Map<number, number>();
    const revenueByOffer = new Map<number, number>();

    for (const metric of facebookSpend) {
      spendByOffer.set(metric.offer_id, (spendByOffer.get(metric.offer_id) ?? 0) + Number(metric.amount_usd ?? 0));
    }

    for (const metric of tiktokSpend) {
      spendByOffer.set(metric.offer_id, (spendByOffer.get(metric.offer_id) ?? 0) + Number(metric.amount_usd ?? 0));
    }

    for (const metric of revenueMetrics) {
      revenueByOffer.set(metric.offer_id, (revenueByOffer.get(metric.offer_id) ?? 0) + Number(metric.amount ?? 0));
    }

    return offers.map((offer) => {
      const spend = spendByOffer.get(offer.id) ?? 0;
      const revenue = revenueByOffer.get(offer.id) ?? 0;
      const result = revenue - spend;

      return {
        id: offer.id,
        offerNumber: offer.offer_number,
        name: offer.name,
        category: offer.category,
        spend: Number(spend.toFixed(2)),
        revenue: Number(revenue.toFixed(2)),
        result: Number(result.toFixed(2)),
      };
    });
  }, [facebookSpend, offers, revenueMetrics, tiktokSpend]);

  const bestRows = useMemo(
    () =>
      [...summaryRows]
        .sort((a, b) => b.result - a.result || b.revenue - a.revenue || a.spend - b.spend)
        .slice(0, 5),
    [summaryRows],
  );

  const worstRows = useMemo(
    () =>
      [...summaryRows]
        .sort((a, b) => a.result - b.result || b.spend - a.spend || a.revenue - b.revenue)
        .slice(0, 5),
    [summaryRows],
  );

  const sortedTableRows = useMemo(
    () => [...summaryRows].sort((a, b) => b.id - a.id),
    [summaryRows],
  );

  const totalRows = sortedTableRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const tableRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return sortedTableRows.slice(startIndex, startIndex + rowsPerPage);
  }, [rowsPerPage, safeCurrentPage, sortedTableRows]);

  function updateFormField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      return;
    }

    const category = form.category.trim();
    const offerType = form.offerType.trim();
    const language = form.language.trim();
    const payoutCurrency = form.payoutCurrency.trim().toUpperCase();
    const normalizedOfferNumber = form.offerNumber.trim();
    const offerNumber = Number(normalizedOfferNumber);
    const normalizedPayout = form.payout.trim();
    const payout = Number(normalizedPayout);

    if (!/^\d+$/.test(normalizedOfferNumber) || Number.isNaN(offerNumber) || offerNumber <= 0) {
      setError("El ID debe ser un número mayor a 0.");
      return;
    }

    if (!form.name.trim()) {
      setError("Escribe el nombre de la oferta.");
      return;
    }

    if (!category) {
      setError("Selecciona o escribe una categoría.");
      return;
    }

    if (!offerType) {
      setError("Selecciona o escribe un tipo.");
      return;
    }

    if (!language) {
      setError("Selecciona o escribe un idioma.");
      return;
    }

    if (!payoutCurrency) {
      setError("Selecciona o escribe una divisa.");
      return;
    }

    if (!normalizedPayout || Number.isNaN(payout) || payout < 0) {
      setError("El payout debe ser un número igual o mayor a 0.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("offers")
      .insert({
        owner_user_id: session.user.id,
        offer_number: offerNumber,
        name: form.name.trim(),
        category,
        offer_type: offerType,
        language,
        payout,
        payout_currency: payoutCurrency,
      })
      .select("id,offer_number,owner_user_id,name,category,offer_type,language,payout,payout_currency,is_active,created_at")
      .single();

    if (insertError) {
      setError("No se pudo crear la oferta. Verifica que el SQL de Supabase esté aplicado y que el ID no esté repetido.");
      setIsSubmitting(false);
      return;
    }

    setOffers((current) => [data as Offer, ...current]);
    setForm({
      offerNumber: "",
      name: "",
      category: "Auto",
      offerType: "PPC",
      language: "EN",
      payoutCurrency: "USD",
      payout: "",
    });
    setShowForm(false);
    setSuccess("Oferta creada correctamente.");
    setCurrentPage(1);
    setIsSubmitting(false);
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

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
        >
          Agregar oferta
        </button>
      </div>

      {success ? (
        <div className="rounded-[1.25rem] border border-[#d5eadf] bg-[#eef9f2] px-5 py-4 text-sm text-[#256c4a]">
          {success}
        </div>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071325]/60 px-4 py-8 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="Cerrar popup"
            className="absolute inset-0 cursor-default"
            onClick={() => setShowForm(false)}
          />

          <form
            onSubmit={handleCreateOffer}
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-brand-primary/10 bg-white p-6 shadow-[0_30px_90px_rgba(7,19,37,0.24)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-brand-primary">Registrar oferta</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d728e]">
                  Crea una nueva oferta y déjala lista para empezar a cargar métricas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#d9e1ec] px-3 py-2 text-sm font-semibold text-[#304866] transition hover:bg-[#f7f9fc]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">ID</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.offerNumber}
                  onChange={(event) => updateFormField("offerNumber", event.target.value)}
                  placeholder="1001"
                  className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
                  pattern="[0-9]+"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">Nombre</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Nombre de la oferta"
                  className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a]"
                  required
                />
              </label>

              <SelectOrCustomField
                label="Categoría"
                value={form.category}
                options={categoryOptions}
                placeholder="Escribe la categoría"
                customOption="Otra"
                onChange={(value) => updateFormField("category", value)}
              />

              <SelectOrCustomField
                label="Tipo"
                value={form.offerType}
                options={typeOptions}
                placeholder="Escribe el tipo"
                customOption="Otro"
                onChange={(value) => updateFormField("offerType", value)}
              />

              <SelectOrCustomField
                label="Idioma"
                value={form.language}
                options={languageOptions}
                placeholder="Escribe el idioma"
                customOption="Otro"
                onChange={(value) => updateFormField("language", value)}
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold text-brand-primary">Payout principal</span>
                <div className="flex items-center rounded-[12px] border border-[#cbd5e1] bg-white focus-within:border-[#1e3a8a]">
                  <span className="pl-4 text-sm font-semibold text-brand-primary">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.001"
                    value={form.payout}
                    onChange={(event) => updateFormField("payout", event.target.value)}
                    placeholder="9.360"
                    className="w-full rounded-[12px] bg-transparent px-2 py-3 text-sm outline-none"
                    required
                  />
                </div>
              </label>

              <SelectOrCustomField
                label="Divisa"
                value={form.payoutCurrency}
                options={currencyOptions}
                placeholder="Escribe la divisa"
                customOption="Otro"
                onChange={(value) => updateFormField("payoutCurrency", value)}
              />
            </div>

            {error ? <p className="mt-5 text-sm text-brand-secondary">{error}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#d9e1ec] px-4 py-3 text-sm font-semibold text-[#304866] transition hover:bg-[#f7f9fc]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSubmitting ? "Guardando..." : "Guardar oferta"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <RankingCardSkeleton />
            <RankingCardSkeleton />
          </div>
          <OffersTableSkeleton />
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <RankingCard title="Top 5 mejores ofertas" rows={bestRows} tone="best" />
            <RankingCard title="Top 5 peores ofertas" rows={worstRows} tone="worst" />
          </div>

          <div className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-brand-primary">Tabla de ofertas</h3>
          </div>
          <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
            {periodOptions.find((option) => option.key === period)?.label}
          </span>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-[#5d728e]">Cargando ofertas...</p>
        ) : tableRows.length === 0 ? (
          <p className="mt-6 text-sm text-[#5d728e]">No hay ofertas creadas todavía.</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
            <table className="min-w-full divide-y divide-[#d9e1ec]">
              <thead className="bg-[#f7f9fc]">
                <tr className="text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Categoría</th>
                  <th className="px-5 py-4">Gasto</th>
                  <th className="px-5 py-4">Revenue</th>
                  <th className="px-5 py-4">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef3f8] bg-white text-sm text-brand-primary">
                {tableRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold">#{row.offerNumber}</td>
                    <td className="px-5 py-4">{row.category}</td>
                    <td className="px-5 py-4">{formatUsd(row.spend)}</td>
                    <td className="px-5 py-4">{formatUsd(row.revenue)}</td>
                    <td className={`px-5 py-4 font-semibold ${row.result >= 0 ? "text-[#1d7a46]" : "text-[#b4235f]"}`}>
                      {formatUsd(row.result)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && totalRows > 0 ? (
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
