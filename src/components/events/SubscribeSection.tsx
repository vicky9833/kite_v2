"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * SubscribeSection — "Stay Updated" (Req 6.1). Visual-only inline form; on
 * submit it shows an honest success message stating real subscription opens in
 * Phase 2. No backend, no network.
 */
export function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().length === 0) return;
    setSubmitted(true);
  }

  return (
    <section id="stay-updated" aria-labelledby="subscribe-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm md:p-10">
          <h2 id="subscribe-heading" className="font-heading text-h2 text-dark">
            Stay Updated
          </h2>
          <p className="mt-3 text-body text-muted">
            Get event announcements and ecosystem updates. This is a frontend
            preview — real subscription opens in Phase 2.
          </p>

          {submitted ? (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-body text-foreground">
                Thanks for your interest. We&rsquo;ve noted your email for the preview
                — live subscriptions go live in Phase 2.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="subscribe-email" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                  <input
                    id="subscribe-email"
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
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default SubscribeSection;
