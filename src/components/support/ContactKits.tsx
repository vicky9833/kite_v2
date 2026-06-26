import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

/**
 * ContactKits — "Contact KITS" (Req 10.1). Three contact cards using the
 * verified footer details: helpline (tel), email (mailto), and office address
 * with a Google Maps link.
 *
 * Server Component.
 */
export function ContactKits() {
  return (
    <section id="contact-kits" aria-labelledby="contact-kits-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="contact-kits-heading" className="font-heading text-h2 text-dark">
          Contact KITS
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Helpline</h3>
            <a href="tel:+918022231007" className="text-body text-primary hover:text-accent">
              080-22231007
            </a>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Email</h3>
            <a href="mailto:startupcell@karnataka.gov.in" className="break-all text-body text-primary hover:text-accent">
              startupcell@karnataka.gov.in
            </a>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-heading text-h3 text-dark">Office</h3>
            <p className="text-body text-muted">
              Department of Electronics, IT, Bt and S&amp;T, Bengaluru, Karnataka
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Vikasa+Soudha+Bengaluru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body text-primary hover:text-accent"
            >
              Open in Maps
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactKits;
