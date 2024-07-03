import { Title } from "@/components/layout/Title";
import { SideBar } from "@/components/sidebar/SideBar";
import { getAllArticles } from "@/lib/api";
import { ToTitleCase } from "@/lib/apiFunctions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: "article.title",
    description: "article.description",
  };
}

export default async function TagPage({
  params,
}: {
  params: { slug: string };
}) {
  const articles = await getAllArticles(100);

  const list = articles.filter((a) => {
    return a.tags.includes(ToTitleCase(decodeURI(params.slug)));
  });

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue">
        <div className="container">
          <Title title={ToTitleCase(decodeURI(params.slug))}></Title>
        </div>
      </section>

      <section className="overlay">
        <div className="container overlay-item-top">
          <div className="row">
            <div className="col">
              <div className="content boxed">
                <div className="row separated">
                  <article className="col-md-8 content-body">
                    <div className="list-group list-group-related">
                      {list.map((article, idx) => (
                        <a
                          href={`/page/blog/${article.slug}`}
                          key={idx}
                          className="list-group-item list-group-item-action d-flex align-items-center active"
                        >
                          <i className="fs-20 icon-file-text2 text-primary mr-1"></i>
                          {article.title}
                        </a>
                      ))}
                    </div>
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
