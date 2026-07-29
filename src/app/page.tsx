import { ArchitectureStory } from "@/components/sections/ArchitectureStory";
import { DayTimeline } from "@/components/sections/DayTimeline";
import { EditorialIntro } from "@/components/sections/EditorialIntro";
import { HeroArrival } from "@/components/sections/HeroArrival";
import { JournalPreview } from "@/components/sections/JournalPreview";
import { ReservationCTA } from "@/components/sections/ReservationCTA";
import { RoomGallery } from "@/components/sections/RoomGallery";
import { SeasonalTable } from "@/components/sections/SeasonalTable";
import { SurroundingsSection } from "@/components/sections/SurroundingsSection";

/**
 * The single-page narrative, in order.
 *
 * Note the media rhythm: video (01) → stills (02, 03, 04) → one clip inside a
 * timeline of stills (05) → one clip (06) → stills (07, 08) → one clip (09).
 * No two video sections are ever adjacent, and only one clip can be playing at
 * any moment because the others are outside the viewport and paused.
 */
export default function NaraHousePage() {
  return (
    <>
      <HeroArrival />
      <EditorialIntro />
      <ArchitectureStory />
      <RoomGallery />
      <DayTimeline />
      <SeasonalTable />
      <SurroundingsSection />
      <JournalPreview />
      <ReservationCTA />
    </>
  );
}
