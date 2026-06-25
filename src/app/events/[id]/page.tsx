import { StubPage } from "@/components/shared/StubPage";
import { events } from "@/data/events";

/** Turn a raw url segment into a readable title. */
function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Last path segment of an href, e.g. "/events/bts-2026" → "bts-2026". */
function slugFromHref(href: string): string {
  const parts = href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/**
 * Event detail stub. Each event's slug is derived from the last segment of its
 * `href` (e.g. `/events/bts-2026` → `bts-2026`) and matched against the route
 * param. Falls back to a humanized title for any unknown slug.
 */
export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = events.find((e) => slugFromHref(e.href) === params.id);

  if (event) {
    return <StubPage title={event.name} description={event.description} />;
  }

  return (
    <StubPage
      title={humanize(params.id)}
      description="Details for this event are forthcoming."
    />
  );
}
