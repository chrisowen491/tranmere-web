import { CupArchivePage } from "../fa-cup/page";
import { pageMetadata } from "@/lib/seo";

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
