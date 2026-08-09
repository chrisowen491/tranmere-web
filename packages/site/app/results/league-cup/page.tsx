import { CupArchivePage } from "../fa-cup/page";
import { pageMetadata } from "@/lib/seo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers League Cup record",
  description:
    "Explore Tranmere Rovers' League Cup results, season-by-season records and best runs through the archive.",
  pathname: "/results/league-cup",
});

export default function LeagueCupPage() {
  return (
    <CupArchivePage competition="League Cup" pathname="/results/league-cup" />
  );
}
