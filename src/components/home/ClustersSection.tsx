import { SectionHeading } from "@/components/shared/SectionHeading";
import { ClusterCard } from "@/components/shared/ClusterCard";
import { clusters } from "@/data/clusters";
import { isValidCluster } from "@/lib/utils";

/**
 * ClustersSection — the "Beyond Bengaluru" Clusters section of the Home page
 * (Req 12).
 *
 * Government-grade editorial, NOT a SaaS landing section. Flat `bg-surface`,
 * generous vertical rhythm, and a plain responsive grid of bordered white
 * cards. There are NO gradients, blobs, glow, glassmorphism, emoji, or
 * decorative imagery — the section relies on typography, the Karnataka palette,
 * and verified cluster data.
 *
 * Server Component: the cluster cards are rendered statically and each card's
 * single call-to-action is an internal `next/link`, so no client-side state or
 * `"use client"` directive is required.
 *
 * Resilience (Req 12.3): the source `clusters` list is filtered through
 * `isValidCluster`, so any malformed record (missing/empty required fields or an
 * invalid `href`) is skipped while the surviving cards keep their original
 * source order (Mysuru first … Tumakuru last). The layout is preserved
 * regardless of how many records survive.
 */

/** Valid clusters in source order — malformed records are skipped (Req 12.3). */
const validClusters = clusters.filter(isValidCluster);

export function ClustersSection() {
  return (
    <section
      aria-labelledby="clusters-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="clusters-heading"
          eyebrow="Beyond Bengaluru"
          title="Six Innovation Clusters Across Karnataka"
          description="Karnataka's innovation economy reaches well past the capital. Six regional clusters anchor focused sectors, dedicated seed capital, and on-the-ground infrastructure across the state."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {validClusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClustersSection;
