type SectionPlaceholderProps = {
  title: string;
  description: string;
};

export function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-7 shadow-[0_16px_48px_rgba(7,19,37,0.06)]">
      <h2 className="text-2xl font-bold text-brand-primary">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b6283]">{description}</p>
      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[#c9d5e4] bg-[#f7f9fc] p-5 text-sm text-[#5d728e]">
        Este módulo queda listo para conectar datos y acciones reales en el siguiente paso.
      </div>
    </div>
  );
}
