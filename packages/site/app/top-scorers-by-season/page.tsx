import { Title } from "@/components/layout/Title";
import { SideBar } from "@/components/sidebar/SideBar";
import { GetTopScorersBySeason } from "@/lib/apiFunctions";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Top Scorers By Season - Tranmere-Web",
  description: "Tranmere Rovers Top Scorers By Season",
};

export default async function TopScorersBySeason() {
  const topScorers = await GetTopScorersBySeason();

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Top Scorers By Season"></Title>
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
                    {topScorers.map((player) => (
                      <div
                        className="card stacked"
                        style={{ marginBottom: "50px" }}
                        key={player.Season}
                      >
                        <div
                          className="card-body"
                          style={{
                            backgroundImage: `url(${player.bio?.picLink})`,
                            backgroundPositionX: "right",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div className="row gutter-2 align-items-center">
                            <div className="col">
                              <a
                                href={`/page/player/${player.Player}`}
                                className="topic"
                              >
                                <h3 className="card-title mb-1">
                                  {player.Season}
                                </h3>
                                <h3 className="card-title mb-1">
                                  {player.Player}
                                </h3>
                                <p className="card-text mb-2">
                                  {player.goals} goals
                                </p>
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
