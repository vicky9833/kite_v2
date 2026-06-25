"use client";

// src/components/dashboard/investor/PortfolioSection.tsx
//
// Investor Dashboard — "Your Portfolio" (Req 21).
//
// A compact, semantic table of the investor's portfolio companies. Each row is
// expandable (click the company button) to reveal synthetic detail; the
// "Current Estimated Value" column is SYNTHETIC, derived via
// `getCurrentEstimatedValue` and flagged with an inline Illustrative marker
// (Req 21.1, 21.2). When the investor has no portfolio companies, an inline
// "Add Portfolio Company" form builds a synthetic entry and commits it through
// `addPortfolioCompany` (Req 21.3, 21.4).
//
// Reads session state via `useInvestor`. Charts/recharts are NOT used here.

import { useMemo, useState } from "react";

import { useInvestor } from "@/context/InvestorContext";
import { getCurrentEstimatedValue } from "@/lib/investor-dashboard-data";
import { sectors } from "@/data/sectors";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { cn } from "@/lib/utils";
import type {
  InvestmentStage,
  PortfolioCompany,
  PortfolioStatus,
} from "@/types";

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
];

const PORTFOLIO_STATUSES: readonly PortfolioStatus[] = [
  "Active",
  "Exited",
  "Written-Off",
  "Folded",
];

/** Map a sector id to its display name (falls back to the raw id). */
function sectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/** Format a lakhs figure as a compact ₹ label. */
function formatLakhs(lakhs: number): string {
  if (lakhs >= 100) {
    const crore = lakhs / 100;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

const STATUS_BADGE_CLASS: Record<PortfolioStatus, string> = {
  Active: "border-success/30 bg-success/10 text-success",
  Exited: "border-primary/30 bg-primary/10 text-primary",
  "Written-Off": "border-border bg-surface text-muted",
  Folded: "border-border bg-surface text-muted",
};

function StatusBadge({ status }: { status: PortfolioStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        STATUS_BADGE_CLASS[status],
      )}
    >
      {status}
    </span>
  );
}

export function PortfolioSection() {
  const { investorProfile, addPortfolioCompany } = useInvestor();
  const companies = useMemo<PortfolioCompany[]>(
    () => investorProfile?.portfolioCompanies ?? [],
    [investorProfile],
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="portfolio-heading"
      className="bg-background py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="portfolio-heading"
          eyebrow="Holdings"
          title="Your Portfolio"
          description="Your current and historical positions across Karnataka's startup ecosystem."
        />

        <div className="mt-8">
          {companies.length === 0 ? (
            <AddPortfolioCompanyForm onAdd={addPortfolioCompany} />
          ) : (
            <PortfolioTable
              companies={companies}
              expandedId={expandedId}
              onToggle={(id) =>
                setExpandedId((current) => (current === id ? null : id))
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

interface PortfolioTableProps {
  companies: PortfolioCompany[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

function PortfolioTable({ companies, expandedId, onToggle }: PortfolioTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-dark">
          {companies.length} portfolio{" "}
          {companies.length === 1 ? "company" : "companies"}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          Current Estimated Value is <IllustrativeBadge variant="inline" />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Portfolio companies with sector, stage at investment, invested
            amount, invested date, current status, and synthetic current
            estimated value. Each row can be expanded for more detail.
          </caption>
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-3 font-semibold">
                Company
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Sector
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Stage at Investment
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Invested Amount
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Invested Date
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Current Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Current Estimated Value
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const estimated = getCurrentEstimatedValue(company);
              const isExpanded = expandedId === company.id;
              const multiple =
                company.investedAmountLakhs > 0
                  ? estimated / company.investedAmountLakhs
                  : 0;
              return (
                <tr key={company.id} className="border-b border-border last:border-0">
                  <td className="px-0 py-0" colSpan={7}>
                    <div>
                      <div className="grid grid-cols-1 items-center gap-1 px-4 py-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr]">
                        <button
                          type="button"
                          onClick={() => onToggle(company.id)}
                          aria-expanded={isExpanded}
                          className="rounded-sm text-left font-semibold text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          {company.companyName}
                        </button>
                        <span className="text-slate-700 md:px-0">
                          {sectorName(company.sector)}
                        </span>
                        <span className="text-slate-700">{company.stage}</span>
                        <span className="text-right text-slate-700 md:text-right">
                          {formatLakhs(company.investedAmountLakhs)}
                        </span>
                        <span className="text-slate-700">{company.investedDate}</span>
                        <span>
                          <StatusBadge status={company.currentStatus} />
                        </span>
                        <span className="text-right font-semibold text-dark">
                          {formatLakhs(estimated)}
                        </span>
                      </div>

                      {isExpanded ? (
                        <div className="border-t border-dashed border-border bg-surface px-4 py-4 text-sm text-slate-700">
                          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted">
                                Location
                              </dt>
                              <dd className="mt-0.5 text-dark">
                                {company.location ?? "Karnataka"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted">
                                Unrealised Multiple
                              </dt>
                              <dd className="mt-0.5 text-dark">
                                {multiple.toFixed(2)}×
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted">
                                Value Movement
                              </dt>
                              <dd className="mt-0.5 text-dark">
                                {estimated >= company.investedAmountLakhs
                                  ? `Up ${formatLakhs(estimated - company.investedAmountLakhs)}`
                                  : `Down ${formatLakhs(company.investedAmountLakhs - estimated)}`}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-muted">
                                Holding
                              </dt>
                              <dd className="mt-0.5 text-dark">
                                {company.stage} · {company.currentStatus}
                              </dd>
                            </div>
                          </dl>
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
                            Estimated value is{" "}
                            <IllustrativeBadge variant="inline" /> and synthesised
                            for preview only.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AddPortfolioCompanyFormProps {
  onAdd: (company: PortfolioCompany) => void;
}

function AddPortfolioCompanyForm({ onAdd }: AddPortfolioCompanyFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState<string>(sectors[0]?.id ?? "deep-tech");
  const [stage, setStage] = useState<InvestmentStage>("Seed");
  const [investedAmount, setInvestedAmount] = useState("100");
  const [investedDate, setInvestedDate] = useState("2024-01-01");
  const [currentStatus, setCurrentStatus] = useState<PortfolioStatus>("Active");

  const trimmedName = companyName.trim();
  const amountLakhs = Number(investedAmount);
  const canSubmit =
    trimmedName.length >= 2 && Number.isFinite(amountLakhs) && amountLakhs >= 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const company: PortfolioCompany = {
      id: `pf-user-${Date.now()}`,
      companyName: trimmedName,
      sector,
      stage,
      investedAmountLakhs: Math.round(amountLakhs),
      investedDate,
      currentStatus,
      location: "Bengaluru Urban",
    };
    onAdd(company);
    setCompanyName("");
    setInvestedAmount("100");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-dark">
        No portfolio companies yet
      </h3>
      <p className="mt-1 text-sm text-muted">
        Add your first holding to populate the portfolio table. Entries are kept
        in this session only.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Company name</span>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            minLength={2}
            placeholder="e.g. Kaveri Labs"
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Sector</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Stage at investment</span>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as InvestmentStage)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {INVESTMENT_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Invested amount (₹ lakhs)</span>
          <input
            type="number"
            min={0}
            value={investedAmount}
            onChange={(e) => setInvestedAmount(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Invested date</span>
          <input
            type="date"
            value={investedDate}
            onChange={(e) => setInvestedDate(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark">Current status</span>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value as PortfolioStatus)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {PORTFOLIO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
              "bg-primary text-white hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            Add Portfolio Company
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioSection;
