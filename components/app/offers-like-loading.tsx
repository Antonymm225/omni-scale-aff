type OffersLikeLoadingProps = {
  titleWidthClass?: string;
};

function TopCardSkeleton() {
  return (
    <article className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-4 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div className="skeleton-shimmer h-7 w-40 rounded-sm" />
        <div className="skeleton-shimmer h-9 w-[5.5rem] rounded-sm" />
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-[3.1rem] rounded-[0.8rem]" />
        ))}
      </div>
    </article>
  );
}

export function OffersLikeLoading({ titleWidthClass = "w-40" }: OffersLikeLoadingProps) {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <div className={`skeleton-shimmer h-12 rounded-sm ${titleWidthClass}`} />
      </header>

      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex h-10 w-[4.6rem] items-center justify-center rounded-xl bg-brand-primary text-sm font-semibold text-white">
              Hoy
            </div>
            <div className="flex h-10 w-[4.8rem] items-center justify-center rounded-xl border border-[#cdd7e4] bg-white text-sm font-semibold text-[#334a67]">
              Ayer
            </div>
            <div className="flex h-10 w-[5.3rem] items-center justify-center rounded-xl border border-[#cdd7e4] bg-white text-sm font-semibold text-[#334a67]">
              7 días
            </div>
            <div className="flex h-10 w-[6.9rem] items-center justify-center rounded-xl border border-[#cdd7e4] bg-white text-sm font-semibold text-[#334a67]">
              Este mes
            </div>
          </div>
          <div className="flex h-11 w-40 items-center justify-center rounded-xl bg-brand-primary text-sm font-semibold text-white">
            Agregar oferta
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopCardSkeleton />
        <TopCardSkeleton />
      </div>

      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div className="skeleton-shimmer h-10 w-56 rounded-sm" />
          <span className="rounded-full bg-[#edf3ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#315da6]">
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
    </div>
  );
}
