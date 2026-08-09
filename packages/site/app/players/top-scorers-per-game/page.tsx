import { redirect } from "next/navigation";

export default function TopScorersPerGameRedirect() {
  redirect("/players/lethal-finishers");
}
