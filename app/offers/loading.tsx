function TopOffersSkeleton({ title }: { title: string }) {
  return (
    <article className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className={`h-9 animate-pulse rounded-xl bg-[#d9dee7] ${title.includes("best") ? "w-48" : "w-52"}`} />
        <div className="h-8 w-24 animate-pulse rounded-2xl bg-[#d9dee7]" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[1.15rem] bg-[#f4f7fb] px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="mt-0.5 h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#dbe2eb]" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-6 animate-pulse rounded-md bg-[#dbe2eb]" />
                  <div
                    className={`mt-2 h-4 animate-pulse rounded-md bg-[#dbe2eb] ${
                      index === 0 ? "w-32" : index === 1 ? "w-44" : "w-36"
                    }`}
                  />
                  <div
                    className={`mt-2 h-3 animate-pulse rounded-md bg-[#dbe2eb] ${
                      index === 0 ? "w-48" : index === 1 ? "w-52" : "w-44"
                    }`}
                  />
                </div>
              </div>
              <div className="w-24 pt-0.5">
                <div className="ml-auto h-4 w-16 animate-pulse rounded-md bg-[#dbe2eb]" />
                <div className="mt-2 ml-auto h-3 w-20 animate-pulse rounded-md bg-[#dbe2eb]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <div className="h-12 w-40 animate-pulse rounded-xl bg-[#d9dee7]" />
      </header>

      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-6 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-[4.6rem] animate-pulse rounded-xl bg-[#9ca6b5]" />
            <div className="h-10 w-[4.8rem] animate-pulse rounded-xl border border-[#d9e1ec] bg-[#f7f9fc]" />
            <div className="h-10 w-[5.3rem] animate-pulse rounded-xl border border-[#d9e1ec] bg-[#f7f9fc]" />
            <div className="h-10 w-[6.9rem] animate-pulse rounded-xl border border-[#d9e1ec] bg-[#f7f9fc]" />
          </div>
          <div className="h-11 w-40 animate-pulse rounded-xl bg-[#edf1f6]" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopOffersSkeleton title="Top 5 best offers" />
        <TopOffersSkeleton title="Top 5 worst offers" />
      </div>

      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,19,37,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-[#d9dee7]" />
          <div className="h-8 w-28 animate-pulse rounded-2xl bg-[#d9dee7]" />
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#d9e1ec]">
          <div className="grid grid-cols-5 gap-4 bg-[#f7f9fc] px-6 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`h-4 animate-pulse rounded-md bg-[#dbe2eb] ${
                  index === 0 ? "w-10" : index === 1 ? "w-28" : "w-20"
                }`}
              />
            ))}
          </div>

          <div className="divide-y divide-[#eef3f8] bg-white">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-4 px-6 py-5">
                <div className="h-4 w-16 animate-pulse rounded-md bg-[#dbe2eb]" />
                <div className={`h-4 animate-pulse rounded-md bg-[#dbe2eb] ${rowIndex % 2 === 0 ? "w-32" : "w-28"}`} />
                <div className="h-4 w-20 animate-pulse rounded-md bg-[#dbe2eb]" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe2eb]" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe2eb]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
