"use client";

// src/app/reports/page.tsx
//
// `/reports` — Reports & Publications. Upgraded from a bare StubPage to a
// credible content-forthcoming surface: a catalogue of the reports the
// ecosystem will publish, with brief illustrative descriptions, plus a
// visual-only "notify me" form (same honest pattern as the Events Hub). No
// backend, no network.

import { useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarRange, CheckCircle2, FileText, Mail, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";

const REPORTS = [
  {
    id: "annual-innovation",
    icon: BarChart3,
    title: "Karnataka Annual Innovation Report",
    cadence: "Annual",
    description:
      "A state-of-the-ecosystem review covering funding, startups, GCCs, deep tech, and policy outcomes across the year.",
  },
  {
    id: "sector-deep-dives",
    icon: FileText,
    title: "Sector Deep Dive Reports",
    cadence: "Rolling",
    description:
      "Focused analyses of priority sectors — AI, ESDM, biotech, fintech, agritech — with trends and opportunities.",
  },
  {
    id: "quarterly-updates",
    icon: CalendarRange,
    title: "Quarterly Ecosystem Updates",
    cadence: "Quarterly",
    description:
      "Short, data-led updates on scheme disbursement, registrations, and program milestones each quarter.",
  },
  {
    id: "policy-implementation",
    icon: ScrollText,
    title: "Annual Policy Implementation Review",
    cadence: "Annual",
    description:
      "Transparent reporting on the Karnataka Startup Policy 2025-30 targets, commitments, and progress.",
  },
] as const;

export default function ReportsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().length === 0) return;
    setSubmitted(true);
  }

  return (
    <>
      <section className="bg-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Reports &amp; Publications
            </span>
            <h1 className="font-heading text-h1 text-white">
              Karnataka ecosystem reports
            </h1>
            <p className="text-body text-slate-300">
              The reports below are being prepared for publication. In the
              meantime, explore live ecosystem data in the dashboards and
              intelligence surfaces, or get notified when each report is
              released.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="reports-catalogue-heading" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="reports-catalogue-heading" className="font-heading text-h2 text-dark">
            What&rsquo;s coming
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {REPORTS.map(({ id, icon: Icon, title, cadence, description }) => (
              <div
                key={id}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                    {cadence}
                  </span>
                </div>
                <h3 className="font-heading text-h3 text-dark">{title}</h3>
                <p className="flex-1 text-body text-muted">{description}</p>
                <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-caption font-medium text-muted">
                  In preparation
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-body text-muted">
            Looking for live data now? See the{" "}
            <Link href="/dashboard/admin" className="text-primary underline-offset-4 hover:underline">
              Government Admin Dashboard
            </Link>{" "}
            and{" "}
            <Link href="/intelligence" className="text-primary underline-offset-4 hover:underline">
              Ecosystem Intelligence
            </Link>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="reports-notify-heading" className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm md:p-10">
            <h2 id="reports-notify-heading" className="font-heading text-h2 text-dark">
              Get notified
            </h2>
            <p className="mt-3 text-body text-muted">
              Be the first to know when a report is published. This is a frontend
              preview — real notifications open in Phase 2.
            </p>

            {submitted ? (
              <div role="status" className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-body text-foreground">
                  Thanks — we&rsquo;ve noted your email for the preview. Report
                  notifications go live in Phase 2.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="reports-email" className="sr-only">
                    Email address
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                    <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                    <input
                      id="reports-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-10 w-full bg-transparent text-body text-foreground outline-none placeholder:text-muted"
                    />
                  </div>
                </div>
                <Button type="submit" variant="accent" size="lg">
                  Notify Me
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
