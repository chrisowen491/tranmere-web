import { PlayerAvatarBuilder } from "@/components/apps/PlayerAvatarBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Avatar Builder",
  description:
    "Build a player avatar picture, complete with Tranmere Rovers kit",
};

export default async function PlayerBuilder() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-10 lg:px-12">
        <p className="section-kicker">Avatar studio</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Build a Rovers icon
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#071a2b]/60">
          Choose a classic kit, hairstyle and features to create your own
          Tranmere-inspired player portrait.
        </p>
      </div>
      <PlayerAvatarBuilder />
    </main>
  );
}
