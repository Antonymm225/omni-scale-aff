import type { ReactNode } from "react";

type AppPageProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AppPage({ title, description, children }: AppPageProps) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-brand-primary">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-lg leading-8 text-[#4b6283]">{description}</p> : null}
      </header>
      {children}
    </div>
  );
}
