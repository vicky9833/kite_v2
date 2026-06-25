"use client";

import { quickActions } from "@/data/quick-actions";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { QuickActionCard } from "@/components/shared/QuickActionCard";
import { RegisterQuickActionCard } from "@/components/home/RegisterQuickActionCard";

/** Id of the "Register Your Startup" quick action (see `data/quick-actions`). */
const REGISTER_ACTION_ID = "register-startup";

/**
 * QuickActionsSection — the "What are you looking for?" grid of common entry
 * points (Req 10).
 *
 * Renders the eight verified {@link quickActions} as fully clickable
 * {@link QuickActionCard}s. The grid is responsive: a single column on mobile,
 * two columns on tablet (2×4) and four columns on desktop (4×2) (Req 10.4).
 * Cards navigate via the safe-navigation helper, so unavailable routes keep the
 * visitor on the page (Req 10.6).
 *
 * The "Register Your Startup" card slot is rendered through
 * {@link RegisterQuickActionCard}, an additive client island that shows a
 * completed-state treatment (checkmark badge + a secondary "See Your Schemes" →
 * `/schemes` affordance within the same card) while registered, and the
 * standard {@link QuickActionCard} while unregistered. The card stays in place
 * either way, so the eight-action grid cardinality is preserved (Req 24.3, 24.4,
 * 24.5; design Reconciliation Note 1).
 *
 * Client Component because the cards navigate via `useRouter` / `safeNavigate`.
 */
export function QuickActionsSection() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Get Started"
          title="What are you looking for?"
          description="Reach the task you came to perform in a single step."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) =>
            action.id === REGISTER_ACTION_ID ? (
              <RegisterQuickActionCard key={action.id} action={action} />
            ) : (
              <QuickActionCard key={action.id} action={action} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default QuickActionsSection;
