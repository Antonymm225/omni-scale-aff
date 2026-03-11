type AppPageSkeletonProps = {
  cards?: number;
  showTable?: boolean;
};

export function AppPageSkeleton({ cards = 3, showTable = true }: AppPageSkeletonProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-[#dfe7f1]" />
        <div className="h-6 w-[32rem] max-w-full animate-pulse rounded-xl bg-[#e8eef6]" />
      </header>

      {cards > 0 ? (
        <div className={`grid gap-4 ${cards > 2 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.5rem] bg-white shadow-[0_16px_48px_rgba(7,19,37,0.04)]"
            />
          ))}
        </div>
      ) : null}

      {showTable ? (
        <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_48px_rgba(7,19,37,0.04)]">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-[#e8eef6]" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-[#f4f7fb]" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
