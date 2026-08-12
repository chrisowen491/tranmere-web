import { getClubByName } from "@/lib/clubs";
import type { SlugParams } from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound, redirect } from "next/navigation";

export default async function LegacyRoversConnectionPage(props: {
  params: SlugParams;
}) {
  const { slug } = await props.params;
  const requestedName = decodeURIComponent(slug);
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const club = await getClubByName(db, requestedName);

  if (!club || club.name === "Tranmere Rovers") notFound();

  redirect(`/opponents/${encodeURIComponent(club.name)}`);
}
