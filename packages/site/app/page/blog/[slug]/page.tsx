export const runtime = "edge";

import { Gallery } from "@/components/Gallery";
import { SideBar } from "@/components/sidebar/SideBar";
import { getAllArticles, getArticle, getAssetsByTag } from "@/lib/api";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateStaticParams() {
  const allArticles = await getAllArticles();

  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export var metadata: Metadata = {
  title: "Match Summary - Tranmere-Web",
  description: "Match Summary",
};

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  metadata.title = article.title;
  metadata.description = article.description;

  const gallery = article.galleryTag
    ? await getAssetsByTag(article.galleryTag)
    : null;

  return (
    <>
      <Navbar showSearch={true}></Navbar>
      <section className="hero bg-blue overlay">
        <div className="container">
          <div className="row align-items-end justify-content-between">
            {article.pic ? (
              <>
                <div className="col-md-6 text-white mb-3 mb-md-0">
                  <div className="row gutter-2">
                    <div className="col-12">
                      <h1 className="h2 font-weight-normal" itemProp="headline">
                        {article.title}
                      </h1>
                      <h3
                        className="h3 font-weight-normal"
                        itemProp="datePublished"
                      >
                        Date: {article.datePosted.substring(0, 10)}
                      </h3>
                      <h3
                        className="h3 font-weight-normal"
                        itemProp="datePublished"
                      >
                        Author: {article.author}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 pl-md-5">
                  <meta itemProp="image" content={article.pic.url} />
                  <img
                    src={`${article.pic.url}?h=300`}
                    alt="Image"
                    className="overlay-item-bottom"
                  />
                </div>
              </>
            ) : (
              <div className="col-md-12 text-white mb-3 mb-md-0">
                <div className="row gutter-2">
                  <div className="col-12">
                    <h1 className="h2 font-weight-normal">{article.title}</h1>
                    <h3
                        className="h3 font-weight-normal"
                        itemProp="datePublished"
                      >
                        Date: {article.datePosted.substring(0, 10)}
                      </h3>
                      <h3
                        className="h3 font-weight-normal"
                        itemProp="datePublished"
                      >
                        Author: {article.author}
                      </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white" style={{ padding: "0px" }}>
        <div className="container">
          <div className="row">
            <article className="col-md-8 content-body">
              <div className="row">
                <div className="col-12">
                  {documentToReactComponents(article.blog.json)}
                  {gallery ? <Gallery gallery={gallery}></Gallery> : ""}
                  {article.galleryCollection && article.galleryCollection.items.length > 0 ? <Gallery gallery={article.galleryCollection.items}></Gallery> : ""}
                </div>
              </div>
              <div className="row gutter-2"></div>
              <div className="row">
                <div className="col-12">
                  {article.tags.map((tag, idx) => (
                    <><span className="badge badge-primary" key={idx}>
                      <a href={`/page/tag/${tag}`} style={{ color: "white" }}>
                        {tag}
                      </a>
                    </span>&nbsp;</>
                  ))}
                </div>
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
