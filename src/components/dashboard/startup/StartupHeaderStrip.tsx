"use client";

import { useRegistration } from "@/context/RegistrationContext";
import { daysSince } from "@/lib/startup-selectors";
import { sectors } from "@/data/sectors";

/**
 * StartupHeaderStrip — the compact identity/status header at the top of the
 * startup dashboard (Req 2). Reads the session profile from
 * `RegistrationContext` and renders, in a `py-8` strip:
 *
 *  - "Welcome back, {founderName}" with the kiteId in caption style (Req 2.1, 2.2).
 *  - Three right-aligned quick-stat tiles: days since registration (Req 2.3, 2.4),
 *    scheme applications status (fixed `0`, marked illustrative — Req 2.3, 2.5),
 *    and a Status badge labelled "Active" (Req 2.3).
 *  - A thin label/value row: company name, primary sector label (resolved from
 *    canonical `sectors.ts`), location, current stage, and DPIIT status (Req 2.6, 2.7).
 *
 * Rendered inside `StartupGate`, so a profile is guaranteed in practice; the
 * null-guard keeps the component safe in isolation and under strict types.
 */
export function StartupHeaderStrip() {
  const { registrationProfile } = useRegistration();

  if (!registrationProfile) {
    return null;
  }

  const {
    founderName,
    kiteId,
    registeredAt,
    companyName,
    primarySector,
    location,
    currentStage,
    dpiitRecognized,
  } = registrationProfile;

  // Whole-day difference between now and registration (Req 2.4).
  const days = daysSince(registeredAt, new Date());

  // Resolve the primary sector label from canonical data (Req 2.7).
  const sectorLabel =
    sectors.find((s) => s.id === primarySector)?.name ?? primarySector;

  const detailItems: ReadonlyArray<{ label: string; value: string }> = [
    { label: "Company", value: companyName },
    { label: "Primary sector", value: sectorLabel },
    { label: "Location", value: location },
    { label: "Current stage", value: currentStage },
    {
      label: "DPIIT recognized",
      value: dpiitRecognized ? "Recognized" : "Not yet",
    },
  ];

  return (
    <header className="py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Identity */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-h2 text-dark">
            Welcome back, {founderName}
          </h1>
          <p className="text-caption text-muted">{kiteId}</p>
        </div>

        {/* Quick-stat tiles */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:max-w-md">
          <QuickStatTile label="Days registered" value={String(days)} />
          <QuickStatTile label="Applications" value="0" illustrative />
          <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
              Active
            </span>
            <p className="mt-2 text-caption text-muted">Status</p>
          </div>
        </div>
      </div>

      {/* Thin label/value detail row */}
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
        {detailItems.map((item) => (
          <div key={item.label} className="flex flex-col">
            <dt className="text-caption uppercase tracking-wide text-muted">
              {item.label}
            </dt>
            <dd className="text-body font-medium text-dark">{item.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

/** A single right-aligned quick-stat tile within the header strip. */
function QuickStatTile({
  label,
  value,
  illustrative = false,
}: {
  label: string;
  value: string;
  illustrative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <p className="font-heading text-h3 font-bold text-dark">{value}</p>
      <p className="mt-1 text-caption text-muted">{label}</p>
      {illustrative ? (
        <p className="mt-0.5 text-[0.625rem] uppercase tracking-wide text-muted/70">
          Illustrative
        </p>
      ) : null}
    </div>
  );
}

export default StartupHeaderStrip;
