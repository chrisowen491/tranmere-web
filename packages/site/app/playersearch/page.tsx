import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/layout/Title"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Players Home - Tranmere-Web',
    description: 'Tranmere Rovers player infomation index',
  };

export default async function PlayerSearchPage() {

  return (
    <>
        <section className="hero bg-blue">
            <div className="container">
            <Title title="Players Home"></Title>
            </div>
        </section>

        <section className="overlay">
            <PlayerSearch />
        </section>

    </>
  );
}
