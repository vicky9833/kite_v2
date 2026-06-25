import { StubPage } from "@/components/shared/StubPage";
import { policies } from "@/data/policies";

/** Turn a raw url segment into a readable title. */
function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Last path segment of an href, e.g. "/policies/startup-2025-30" → "startup-2025-30". */
function slugFromHref(href: string): string {
  const parts = href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Policy detail stub. Each policy's slug is derived from the last segment of its
 * `href` (e.g. `/policies/startup-2025-30` → `startup-2025-30`) and matched
 * against the route param. Falls back to a humanized title for any unknown slug.
 */
export default function PolicyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const policy = policies.find((p) => slugFromHref(p.href) === params.id);

  if (policy) {
    return <StubPage title={policy.name} description={policy.summary} />;
  }

  return (
    <StubPage
      title={humanize(params.id)}
      description="Details for this policy are forthcoming."
    />
  );
}
