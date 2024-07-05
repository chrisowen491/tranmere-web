export const runtime = "edge";
import { Title } from "@/components/layout/Title";
import { SideBar } from "@/components/sidebar/SideBar";
import { GetAllHatTricks } from "@/lib/apiFunctions";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Tranmere Hat Tricks",
  description: "Tranmere Rovers Hat Trick Scorers",
};

export default async function HatTricks() {
  const players = await GetAllHatTricks();

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Tranmere Hat Tricks"></Title>
        </div>
      </section>

      <section className="overlay">
        <div className="container overlay-item-top">
          <div className="row">
            <div className="col">
              <div className="content boxed">
                <div className="row separated">
                  <article className="col-md-8 content-body">
                    <p>Data only goes as far back as the 1977-78 season.</p>
                    {players.map((player) => (
                      <div
                        className="card stacked"
                        style={{ marginBottom: "50px" }}
                        key={player.Season}
                      >
                        <div className="card-body">
                          <div className="row gutter-2 align-items-center">
                            <div className="col">
                              <a
                                href={`/match/${player.Season}/${player.Date}`}
                                className="topic"
                              >
                                <h3 className="card-title mb-1">
                                  {player.Date}
                                </h3>
                                <h3 className="card-title mb-1">
                                  {player.Player}
                                </h3>
                                <h3 className="card-title mb-1">
                                  {player.Opposition}
                                </h3>
                                <p className="card-text mb-2">
                                  {player.Goals} goals
                                </p>
                                <i className="icon-soccer icon-background"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="row gutter-2"></div>
                  </article>

                  <SideBar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  );
}
