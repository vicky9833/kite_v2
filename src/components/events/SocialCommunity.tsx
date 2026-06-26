import { Linkedin, Twitter, Youtube } from "lucide-react";

/**
 * SocialCommunity — "Connect with the Ecosystem" (Req 6.1). A card row linking
 * to the official Karnataka government social presence. Lucide social icons
 * only; no emoji.
 *
 * Server Component.
 */
const SOCIAL_LINKS = [
  {
    id: "x",
    label: "X (Twitter)",
    handle: "@KarnatakaVarthe",
    href: "https://twitter.com/KarnatakaVarthe",
    Icon: Twitter,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Karnataka Digital Economy Mission",
    href: "https://www.linkedin.com/company/karnataka-digital-economy-mission",
    Icon: Linkedin,
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "Karnataka EITBT",
    href: "https://www.youtube.com/@GovernmentofKarnataka",
    Icon: Youtube,
  },
] as const;

export function SocialCommunity() {
  return (
    <section aria-labelledby="social-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="social-heading" className="font-heading text-h2 text-dark">
          Connect with the Ecosystem
        </h2>
        <p className="mt-3 max-w-2xl text-body text-muted">
          Follow Karnataka&rsquo;s official channels for announcements, event
          updates, and ecosystem stories.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOCIAL_LINKS.map(({ id, label, handle, href, Icon }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-h3 text-dark">{label}</span>
                <span className="text-caption text-muted">{handle}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialCommunity;
