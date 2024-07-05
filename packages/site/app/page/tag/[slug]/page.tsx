import { Title } from "@/components/layout/Title";
import { SideBar } from "@/components/sidebar/SideBar";
import { getAllArticlesForTag } from "@/lib/api";
import { ToTitleCase } from "@/lib/apiFunctions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `Articles Tagged ${params.slug}`,
    description: `All TranmereWeb.com articles tagged with  ${params.slug}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: { slug: string };
}) {
  const articles = await getAllArticlesForTag(100, decodeURI(params.slug));

  const list = articles
    ? articles.filter((a) => {
        return a.tags.includes(ToTitleCase(decodeURI(params.slug)));
      })
    : [];

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title={ToTitleCase(decodeURI(params.slug))}></Title>
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
