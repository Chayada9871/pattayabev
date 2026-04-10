import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-hero-glow px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[28px] border border-[#e9dfd1] bg-white/95 px-6 py-8 shadow-card sm:px-10">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#ebdfcf] bg-[#fff8ee] px-4 py-2">
            <span className="relative h-10 w-10 overflow-hidden rounded-full border border-[#d9c9b4] bg-white">
              <Image src="/images/branding/logo.png" alt="PattayaBev logo" fill className="object-contain p-1" sizes="40px" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#8b6a2b]">Curated Wine & Spirits</p>
              <p className="text-lg font-bold text-ink">PattayaBev</p>
            </div>
          </div>

          <h1 className="text-center text-4xl font-extrabold uppercase tracking-[0.04em] text-black sm:text-5xl">{title}</h1>
          <div className="mt-5 text-center text-sm tracking-[0.04em] text-[#423b35] sm:text-base">{subtitle}</div>
          <div className="mt-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
