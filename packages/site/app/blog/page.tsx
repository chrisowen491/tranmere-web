export const runtime = "edge";

import { SideBar } from "@/components/sidebar/SideBar";
import { getAllArticles } from "@/lib/api";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export var metadata: Metadata = {
  title: "Blog Index",
  description: "A listing of all blog article for the site",
};

export default async function BlogHome() {
  const articles = await getAllArticles(50);

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue overlay">
        <div className="container">
          <div className="row align-items-end justify-content-between">
            <div className="col-md-12 text-white mb-3 mb-md-0">
              <div className="row gutter-2">
                <div className="col-12">
                  <h1 className="h2 font-weight-normal">Blog Pages</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white" style={{ padding: "0px" }}>
        <div className="container">
          <div className="row">
            <article className="col-md-8 content-body">
              <div className="row">
                <div className="col-12">
                  {articles.map((article) => (
                    <div
                      className="card stacked"
                      style={{ marginBottom: "50px" }}
                      key={article.sys.id}
                    >
                      <div className="card-body">
                        <div className="row gutter-2 align-items-center">
                          <div className="col">
                            <Link href={`/page/blog/${article.slug}`}>
                              <h3>{article.title}</h3>
                            </Link>
                            <p>{article.description}</p>
                            <p>Written by: {article.author}</p>
                            <Link
                              href={`/page/blog/${article.slug.toLowerCase()}`}
                            >
                              Read More →
                            </Link>
                            <i className="icon-pencil icon-background"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="row gutter-2"></div>
              <div className="row">
                <div className="col-12"></div>
              </div>
            </article>
            <SideBar></SideBar>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  );
}
