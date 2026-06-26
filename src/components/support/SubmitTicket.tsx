"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SupportTicketDraft } from "@/types";

/**
 * SubmitTicket — "Submit a Support Ticket" (Req 10.1). Visual-only form (no
 * backend). On submit it shows an honest success message with a synthetic
 * ticket id in the format SUP-YYYY-XXXXXX. Fully labeled inputs (Req 10.4).
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function syntheticTicketId(): string {
  const year = new Date().getFullYear();
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * ALPHABET.length);
    suffix += ALPHABET[Math.min(Math.max(index, 0), ALPHABET.length - 1)];
  }
  return `SUP-${year}-${suffix}`;
}

const EMPTY: SupportTicketDraft = { name: "", email: "", subject: "", message: "" };

export function SubmitTicket() {
  const [draft, setDraft] = useState<SupportTicketDraft>(EMPTY);
  const [ticketId, setTicketId] = useState<string | null>(null);

  function update<K extends keyof SupportTicketDraft>(key: K, value: SupportTicketDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      draft.name.trim() === "" ||
      draft.email.trim() === "" ||
      draft.subject.trim() === "" ||
      draft.message.trim() === ""
    ) {
      return;
    }
    setTicketId(syntheticTicketId());
  }

  return (
    <section aria-labelledby="ticket-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="ticket-heading" className="font-heading text-h2 text-dark">
          Submit a Support Ticket
        </h2>
        <p className="mt-3 text-body text-muted">
          This is a frontend preview — tickets are not yet submitted to a backend.
          You&rsquo;ll receive a sample reference id on submit.
        </p>

        {ticketId ? (
          <div role="status" className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface p-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-body text-foreground">
                Thanks, {draft.name || "there"}. Your support request has been
                noted with reference{" "}
                <span className="font-heading font-semibold text-dark">{ticketId}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDraft(EMPTY);
                  setTicketId(null);
                }}
                className="mt-3 inline-flex items-center text-body text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Submit another ticket
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticket-name" className="text-caption font-medium text-foreground">
                  Name
                </label>
                <input
                  id="ticket-name"
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticket-email" className="text-caption font-medium text-foreground">
                  Email
                </label>
                <input
                  id="ticket-email"
                  type="email"
                  required
                  value={draft.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-subject" className="text-caption font-medium text-foreground">
                Subject
              </label>
              <input
                id="ticket-subject"
                type="text"
                required
                value={draft.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-message" className="text-caption font-medium text-foreground">
                Message
              </label>
              <textarea
                id="ticket-message"
                required
                rows={5}
                value={draft.message}
                onChange={(e) => update("message", e.target.value)}
                className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-attachment" className="text-caption font-medium text-foreground">
                Attachment (optional)
              </label>
              <input
                id="ticket-attachment"
                type="file"
                disabled
                aria-describedby="ticket-attachment-note"
                className="text-caption text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-caption"
              />
              <span id="ticket-attachment-note" className="text-caption text-muted">
                Attachments are a visual placeholder in this preview.
              </span>
            </div>
            <Button type="submit" variant="accent" size="lg" className="w-fit">
              Submit Ticket
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

export default SubmitTicket;
