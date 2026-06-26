import { Clock, GaugeCircle, ArrowUpRight } from "lucide-react";

/**
 * HelplineSla — helpline hours, response-time SLAs by category, and the
 * escalation matrix (Req 10.1). Government-grade transparency about expected
 * response times. The figures are indicative service levels.
 *
 * Server Component.
 */
const SLA_ROWS = [
  { category: "General queries", channel: "Helpline / email", target: "Acknowledged within 2 working days" },
  { category: "Scheme-specific queries", channel: "Email / ticket", target: "3\u20135 working days" },
  { category: "Application status", channel: "Official portal", target: "5\u20137 working days" },
  { category: "Escalations", channel: "Ticket + cell contact", target: "Within 7 working days" },
] as const;

const ESCALATION = [
  "Level 1 — KITS helpline and startup cell email",
  "Level 2 — Relevant department cell (ELEVATE, Investor, International)",
  "Level 3 — KDEM partnership / programme leadership",
] as const;

export function HelplineSla() {
  return (
    <section aria-labelledby="sla-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="sla-heading" className="font-heading text-h2 text-dark">
          Helpline Hours &amp; Service Levels
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Helpline Hours</h3>
            <p className="text-body text-muted">
              Monday to Friday, 10:00 to 17:30 IST (excluding government
              holidays). Helpline: 080-22231007.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <GaugeCircle className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Response Time SLAs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <thead>
                  <tr className="border-b border-border text-caption uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 pr-4 font-medium">Category</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Channel</th>
                    <th scope="col" className="py-2 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {SLA_ROWS.map((row) => (
                    <tr key={row.category} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-foreground">{row.category}</td>
                      <td className="py-2 pr-4 text-muted">{row.channel}</td>
                      <td className="py-2 text-muted">{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Escalation Matrix</h3>
          </div>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-body text-muted">
            {ESCALATION.map((level) => (
              <li key={level}>{level}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HelplineSla;
