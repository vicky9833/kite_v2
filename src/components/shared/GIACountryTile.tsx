import { cn } from "@/lib/utils";
import type { GIACountry } from "@/types";

/**
 * GIACountryTile — a compact, dark-friendly tile for the GIA Partner Countries
 * density grid (Req 16). Renders the country's SVG flag via the `flag-icons`
 * sprite (`fi fi-${countryCode}`), the country `name` in small white text, and
 * its `focusAreas` joined as tiny muted text below.
 *
 * The flag span is purely decorative (`aria-hidden`); the visible country name
 * supplies the text alternative (Property 20 / Req 21.5). `countryCode` is
 * already lowercase in the data source, as required by the flag-icons classes.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface GIACountryTileProps {
  /** The country to render. Callers pass only validated entries (Req 16.3). */
  country: GIACountry;
  /** Extra classes merged onto the tile wrapper. */
  className?: string;
}

export function GIACountryTile({ country, className }: GIACountryTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3",
        className,
      )}
    >
      <span
        className={cn("fi", `fi-${country.countryCode}`, "text-base leading-none")}
        aria-hidden
      />
      <span className="text-caption font-medium leading-tight text-white">
        {country.name}
      </span>
      {country.focusAreas.length > 0 ? (
        <span className="text-[0.6875rem] leading-snug text-slate-400">
          {country.focusAreas.join(" · ")}
        </span>
      ) : null}
    </div>
  );
}

export default GIACountryTile;
