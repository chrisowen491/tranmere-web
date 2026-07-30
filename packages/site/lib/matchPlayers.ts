import type {
  Appearance,
  MatchPageData,
} from "@tranmere-web/lib/src/tranmere-web-types";
import {
  getPlayerStatisticsProfiles,
  type PlayerStatisticsProfile,
} from "@/lib/playerStatistics";

export interface MatchAppearanceView extends Omit<Appearance, "bio"> {
  profile: PlayerStatisticsProfile;
}

export interface MatchPageView extends Omit<MatchPageData, "apps"> {
  apps?: MatchAppearanceView[];
}

function withoutLegacyBio(appearance: Appearance) {
  const profilelessAppearance = { ...appearance };
  delete profilelessAppearance.bio;
  return profilelessAppearance;
}

export async function enrichMatchPlayers(
  db: D1Database,
  match: MatchPageData,
): Promise<MatchPageView> {
  const appearances = match.apps ?? [];
  const profiles = await getPlayerStatisticsProfiles(
    db,
    appearances.map((appearance) => appearance.Name),
  );
  return {
    ...match,
    apps: appearances.map((appearance) => ({
      ...withoutLegacyBio(appearance),
      profile: profiles.get(appearance.Name)!,
    })),
  };
}
