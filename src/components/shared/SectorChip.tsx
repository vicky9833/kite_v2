import {
  Atom,
  Banknote,
  Bot,
  BrainCircuit,
  Car,
  Cloud,
  Cpu,
  Factory,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Leaf,
  Plane,
  Rocket,
  ShieldCheck,
  Sprout,
  Truck,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { Sector } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Maps the optional `icon` name carried on each {@link Sector} to its concrete
 * `lucide-react` component. Keeping the map local to the chip keeps the data
 * layer free of React/runtime imports — the data only carries icon *names*. A
 * sector with no `icon` (or an unrecognised name) simply renders without a
 * glyph.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Atom,
  BrainCircuit,
  Banknote,
  HeartPulse,
  Sprout,
  FlaskConical,
  ShieldCheck,
  Cpu,
  Rocket,
  Waves,
  Leaf,
  Factory,
  Bot,
  GraduationCap,
  HandHeart,
  Gamepad2,
  Car,
  Plane,
  Cloud,
  Truck,
};

export interface SectorChipProps {
  /** The sector this chip represents. */
  sector: Sector;
  /** Whether this chip is the currently selected one. */
  selected: boolean;
  /** Called with the sector id when the chip is activated. */
  onSelect: (id: string) => void;
  /** Extra classes merged onto the chip root. */
  className?: string;
}

/**
 * SectorChip — a single clickable pill in the Sector Explorer tag-cloud
 * (Req 14.3, 14.6). Renders as a `button` so it is natively focusable and
 * keyboard-activatable, exposes the sector name as its accessible name, and
 * reflects its selection via `aria-pressed`.
 *
 * Editorial restraint: hairline border on a white surface with an optional
 * small leading glyph. Selection is a flat colour shift (no gradient/glow), and
 * hover only tints the border — there is no transform/scale.
 */
export function SectorChip({ sector, selected, onSelect, className }: SectorChipProps) {
  const Icon = sector.icon ? ICON_MAP[sector.icon] : undefined;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(sector.id)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm outline-none transition-colors",
        // min-h-11 (44px) gives the chip a comfortable mobile touch target
        // without changing the compact pill aesthetic.
        "min-h-11",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-dark hover:border-primary/40",
        className,
      )}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {sector.name}
    </button>
  );
}

export default SectorChip;
