// src/app/events/page.tsx
//
// `/events` — Events & Media Hub (Req 6). Server shell composing the hero,
// featured event, the upcoming-events grid (client island with inline detail
// panel), media coverage (client island), government announcements, reports,
// subscribe (client island), social, and resources. Verified events data is
// canonical; all media/announcement surfaces are synthetic and badged.

import type { Metadata } from "next";

import { EventsHeroStrip } from "@/components/events/EventsHeroStrip";
import { FeaturedEvent } from "@/components/events/FeaturedEvent";
import { UpcomingEventsGrid } from "@/components/events/UpcomingEventsGrid";
import { MediaPressSection } from "@/components/events/MediaPressSection";
import { GovAnnouncementsSection } from "@/components/events/GovAnnouncementsSection";
import { ReportsPublications } from "@/components/events/ReportsPublications";
import { SubscribeSection } from "@/components/events/SubscribeSection";
import { SocialCommunity } from "@/components/events/SocialCommunity";
import { EventsResources } from "@/components/events/EventsResources";
import { events } from "@/data/events";
import { generatePressMentions } from "@/lib/synthetic-media-data";

export const metadata: Metadata = {
  title: "Events & Media — KITE",
  description:
    "Karnataka's startup events calendar, ecosystem media coverage, and government announcements.",
};

export default function EventsPage() {
  const mentions = generatePressMentions();
  const featured =
    events.find((e) => e.id === "bengaluru-tech-summit-2026") ?? events[0];

  return (
    <>
      <EventsHeroStrip upcomingCount={events.length} mediaCount={mentions.length} />
      {featured && <FeaturedEvent event={featured} />}
      <UpcomingEventsGrid events={events} />
      <MediaPressSection mentions={mentions} />
      <GovAnnouncementsSection />
      <ReportsPublications />
      <SubscribeSection />
      <SocialCommunity />
      <EventsResources />
    </>
  );
}
