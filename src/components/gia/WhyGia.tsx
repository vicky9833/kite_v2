import { Globe2, HandCoins, Store } from "lucide-react";

/**
 * WhyGia — three-column editorial explaining the GIA mission (Req 7.1).
 * Server Component.
 */
const CARDS = [
  {
    id: "knowledge",
    icon: Globe2,
    title: "International Knowledge Exchange",
    body: "The GIA links Karnataka with leading innovation ecosystems, enabling two-way exchange of research, talent, and best practice across priority sectors.",
  },
  {
    id: "co-invest",
    icon: HandCoins,
    title: "Co-investment Opportunities",
    body: "Partner-country investors and funds gain a structured channel into Karnataka's deal flow, while Karnataka startups access international capital.",
  },
  {
    id: "market-access",
    icon: Store,
    title: "Market Access",
    body: "Bilateral programs open soft-landing support and market entry for Karnataka startups expanding into partner-country markets.",
  },
] as const;

export function WhyGia() {
  return (
    <section aria-labelledby="why-gia-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="why-gia-heading" className="font-heading text-h2 text-dark">
          Why the Global Innovation Alliance
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map(({ id, icon: Icon, title, body }) => (
            <div
              key={id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-h3 text-dark">{title}</h3>
              <p className="text-body text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyGia;
