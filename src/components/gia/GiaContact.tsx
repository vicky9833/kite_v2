import { Mail, Phone, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GiaContact — "Partner with Karnataka" (Req 7.1). Contact information for
 * international partnership inquiries with a Schedule-a-Briefing mailto CTA and
 * a note about the consulate engagement path. The KITS email is verified; the
 * international cell phone is illustrative.
 *
 * Server Component.
 */
export function GiaContact() {
  return (
    <section id="gia-contact" aria-labelledby="gia-contact-heading" className="bg-dark py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 id="gia-contact-heading" className="font-heading text-h2 text-white">
            Partner with Karnataka
          </h2>
          <p className="text-body text-slate-300">
            International partners can engage Karnataka&rsquo;s EITBT Department
            international cell to explore co-investment, market access, and joint
            programming. Formal partnership initiation typically proceeds through
            the relevant India consulate.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-heading text-h3 text-white">Email</span>
            <a href="mailto:gia@kdem.in" className="text-body text-slate-300 hover:text-white">
              gia@kdem.in
            </a>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-heading text-h3 text-white">Phone</span>
            <a href="tel:+918022341030" className="text-body text-slate-300 hover:text-white">
              080-22341030
            </a>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-6">
            <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-heading text-h3 text-white">International Cell</span>
            <span className="text-body text-slate-300">
              EITBT Department, Bengaluru, Karnataka
            </span>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="mailto:gia@kdem.in?subject=GIA%20Partnership%20Briefing"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
          >
            Schedule a Briefing
          </a>
        </div>
      </div>
    </section>
  );
}

export default GiaContact;
