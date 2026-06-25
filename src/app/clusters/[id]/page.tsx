import { StubPage } from "@/components/shared/StubPage";
import { clusters } from "@/data/clusters";

/** Turn a raw url segment into a readable title. */
function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Cluster detail stub. Resolves its title from the matching `clusters` record
 * by `id` (mysuru, mangaluru, hdb, kalaburagi, shivamogga, tumakuru). Falls back
 * to a humanized title for any other id so the route always resolves.
 */
export default function ClusterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cluster = clusters.find((c) => c.id === params.id);

  if (cluster) {
    return <StubPage title={cluster.name} description={cluster.tagline} />;
  }

  return (
    <StubPage
      title={humanize(params.id)}
      description="Details for this cluster are forthcoming."
    />
  );
}
