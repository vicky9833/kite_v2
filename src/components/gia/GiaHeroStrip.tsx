import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GiaHeroStrip — compact dark hero for the GIA index (Req 7.1). Names the
 * verified 32 partner countries and Karnataka's international engagement
 * framework. Two CTAs anchor to the country grid and the contact section.
 *
 * Server Component.
 */
export interface GiaHeroStripProps {
  countryCount: number;
}

export function GiaHeroStrip({ countryCount }: GiaHeroStripProps) {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Global Innovation Alliance
          </span>
          <h1 className="font-heading text-h1 text-white">
            Karnataka&rsquo;s gateway to {countryCount} partner countries
          </h1>
          <p className="text-body text-slate-300">
            The Global Innovation Alliance connects Karnataka&rsquo;s ecosystem
            with {countryCount} partner countries across five regions — opening
            international knowledge exchange, co-investment, and market access for
            Karnataka startups.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#all-countries"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Browse Partner Countries
            </a>
            <a
              href="#gia-contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Submit Partnership Inquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiaHeroStrip;
