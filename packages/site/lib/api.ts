// Set a variable that contains all the fields needed for articles when a fetch for

import { GraphQLResponse } from "./types";

// content is performed
const ARTICLE_GRAPHQL_FIELDS = `
  sys {
    id
  }
  title
  slug
  description
  blog {
    json
  }
  author
  pic {
    url
  }
`;

async function fetchGraphQL(query: string) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      // Associate all fetches for articles with an "articles" cache tag so content can
      // be revalidated or updated from Contentful on publish
      next: { tags: ["articles"] },
    },
  ).then((response) => response.json());
}

function extractArticleEntries(fetchResponse: GraphQLResponse) {
  return fetchResponse?.data?.blogPostCollection?.items;
}

export async function getAllArticles(limit = 3) {
  const articles = await fetchGraphQL(
    `query {
        blogPostCollection(where:{slug_exists: true}, order: datePosted_DESC, limit: ${limit}) {
          items {
            ${ARTICLE_GRAPHQL_FIELDS}
          }
        }
      }`,
  );

  //console.log(JSON.stringify(articles))

  return extractArticleEntries(articles as GraphQLResponse);
}

export async function getArticle(slug: string) {
  const article = await fetchGraphQL(
    `query {
        blogPostCollection(where:{slug: "${slug}"}, limit: 1) {
          items {
            ${ARTICLE_GRAPHQL_FIELDS}
          }
        }
      }`,
  );
  return extractArticleEntries(article as GraphQLResponse)[0];
}
