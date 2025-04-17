import { PlayerAvatarBuilder } from "@/components/apps/PlayerAvatarBuilder";
import { Title } from "@/components/fragments/Title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Avatar Builder",
  description:
    "Build a player avatar picture, complete with Tranmere Rovers kit",
};

export default async function PlayerBuilder() {
  return (
    <>
      <Title title="Player Avatar Builder" subTitle="Media">
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">
          Create your own avatar
        </p>
      </Title>
      <PlayerAvatarBuilder />
    </>
  );
}
