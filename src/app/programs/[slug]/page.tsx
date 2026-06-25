import { StubPage } from "@/components/shared/StubPage";
import { flagshipPrograms } from "@/data/flagship-programs";

/** Turn a raw url segment into a readable title. */
function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Program detail stub. Resolves its title from `flagshipPrograms` where the
 * program `href` ends with the route slug (referenced slugs: leap, k-combinator,
 * nain). `nain` has no matching program, so it falls back to a humanized title
 * — the route always resolves.
 */
export default function ProgramDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const program = flagshipPrograms.find((p) =>
    p.href.endsWith(`/${params.slug}`),
  );

  if (program) {
    return <StubPage title={program.name} description={program.tagline} />;
  }

  return (
    <StubPage
      title={humanize(params.slug)}
      description="Details for this program are forthcoming."
    />
  );
}
