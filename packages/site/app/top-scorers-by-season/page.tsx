import { redirect } from "next/navigation";

export default function TopScorersBySeasonRedirect() {
  redirect("/players/top-scorers-by-season");
}
