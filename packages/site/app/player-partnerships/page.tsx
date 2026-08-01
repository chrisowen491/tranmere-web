import { redirect } from "next/navigation";

export default async function PlayerPartnershipsRedirect(props: {
  searchParams: Promise<{ player?: string }>;
}) {
  const searchParams = await props.searchParams;
  const player = searchParams.player
    ? `?player=${encodeURIComponent(searchParams.player)}`
    : "";
  redirect(`/players/partnerships${player}`);
}
