import { PlayerAvatarBuilder } from "@/components/apps/PlayerAvatarBuilder";
import { Title } from "@/components/layout/Title";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Player Avatar Builder - Tranmere-Web",
  description:
    "Build a player avatar picture, complete with Tranmere Rovers kit",
};

export default async function PlayerBuilder() {
  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Player Avatar Builder"></Title>
        </div>
      </section>

      <section className="overlay">
        <PlayerAvatarBuilder />
      </section>
      <Footer></Footer>
    </>
  );
}
