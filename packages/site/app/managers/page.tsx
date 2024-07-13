import { Title } from "@/components/fragments/Title";
import { SideBar } from "@/components/fragments/SideBar";
import { GetAllTranmereManagers } from "@/lib/apiFunctions";
import { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Tranmere Rovers Managerial Records",
  description: "Records of all Tranmere Rovers managers",
};

export default async function ManagerRecords() {
  const managers = await GetAllTranmereManagers();

  return (
    <>
      <section className="hero bg-blue">
        <div className="container">
          <Title title="Tranmere Rovers Managerial Records"></Title>
        </div>
      </section>

      <section className="overlay">
        <div className="container overlay-item-top">
          <div className="row">
            <div className="col">
              <div className="content boxed">
                <div className="row separated">
                  <article className="col-md-8 content-body">
                    <p>A complete list of Tranmere Rovers managers</p>
                    {managers.map((manager) => (
                      <div
                        className="card stacked"
                        style={{ marginBottom: "50px" }}
                        key={manager.name}
                      >
                        <div className="card-body">
                          <div className="row gutter-2 align-items-center">
                            <div className="col">
                              <h3 className="card-title mb-1" itemProp="name">
                                {manager.name}
                              </h3>
                              <p className="card-text mb-2">
                                <small>
                                  From
                                  <time
                                    dateTime={manager.dateJoined}
                                    className="text-muted d-block"
                                  >
                                    {manager.dateJoined}
                                  </time>
                                </small>
                              </p>
                              <p className="card-text mb-2">
                                <small>
                                  To
                                  <time
                                    dateTime={manager.dateLeft}
                                    className="text-muted d-block"
                                  >
                                    {manager.dateLeft}
                                  </time>
                                </small>
                              </p>
                            </div>
                          </div>
                          <i className="icon-photo icon-background text-blue"></i>
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
    </>
  );
}
