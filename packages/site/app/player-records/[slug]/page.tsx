import { redirect } from "next/navigation";
import type { SlugParams } from "@/lib/types";

export default async function PlayerRecordsRedirect(props: {
  params: SlugParams;
}) {
  const params = await props.params;
  redirect(`/players/records/${encodeURIComponent(params.slug)}`);
}
