import { Mail, Phone } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { departmentContacts } from "@/data/department-contacts";

/**
 * DepartmentContacts — "Department Contacts" (Req 10.1). Cards for KDEM, KITS,
 * ELEVATE Cell, Investor Cell, and International Cell. Illustrative contacts are
 * clearly marked.
 *
 * Server Component.
 */
export function DepartmentContacts() {
  return (
    <section aria-labelledby="dept-contacts-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="dept-contacts-heading" className="font-heading text-h2 text-dark">
          Department Contacts
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departmentContacts.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-h3 text-dark">{c.name}</h3>
                {c.illustrative && <IllustrativeBadge variant="inline" />}
              </div>
              <a
                href={`mailto:${c.email}`}
                className="inline-flex items-center gap-1.5 break-all text-body text-primary hover:text-accent"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {c.email}
              </a>
              <a
                href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-body text-primary hover:text-accent"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DepartmentContacts;
