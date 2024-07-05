// Set a variable that contains all the fields needed for articles when a fetch for

import { GraphQLAssetsResponse, GraphQLBlogResponse, GraphQLPlayerResponse } from "./types";

const ARTICLE_GROUP_FIELDS = `
  sys {
    id
  }
  title
  slug
  tags
  datePosted
  description
  blog {
    json
  }
  author
  pic {
    url
  }
`;

// content is performed
const ARTICLE_GRAPHQL_FIELDS = `
  sys {
    id
  }
  title
  slug
  tags
  datePosted
  description
  galleryCollection {
    items {
      url
      title
      description
    }
  }
  blocksCollection {
    items {
      __typename
      ... on Kit {
        season
        img
      }
      ... on Star {
        season
        name
        date
        notes
        match
        programme
      }
    }
  }
  galleryTag
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

function extractPlayerEntries(fetchResponse: GraphQLPlayerResponse) {
  return fetchResponse?.data?.playerCollection?.items;
}

function extractArticleEntries(fetchResponse: GraphQLBlogResponse) {
  return fetchResponse?.data?.blogPostCollection?.items;
}

function extractGalleryImageEntries(fetchResponse: GraphQLAssetsResponse) {
  return fetchResponse?.data?.assetCollection?.items;
}

export async function getAssetsByTag(tag: string) {
  console.log(tag)
  const articles = await fetchGraphQL(
    `query {
      assetCollection(where:{contentfulMetadata:{ tags: { id_contains_all: "${tag}"}}} , order: sys_publishedAt_DESC ) {
        items {
          title
          description
          url
        }
      }
    }`,
  );

  return extractGalleryImageEntries(articles as GraphQLAssetsResponse);
}

export async function getAllPlayers(limit = 500) {
  const players = await fetchGraphQL(
    `query {
      playerCollection(limit: ${limit}) {
        items {
          name
        }
      }
    }`,
  );

  return extractPlayerEntries(players as GraphQLPlayerResponse);
}

export async function getAllArticles(limit = 3) {
  const articles = await fetchGraphQL(
    `query {
        blogPostCollection(where:{slug_exists: true}, order: datePosted_DESC, limit: ${limit}) {
          items {
            ${ARTICLE_GROUP_FIELDS}
          }
        }
      }`,
  );

  //console.log(JSON.stringify(articles))

  return extractArticleEntries(articles as GraphQLBlogResponse);
}

export async function getAllArticlesForTag(limit = 3, tag: string) {
  const articles = await fetchGraphQL(
    `query {
        blogPostCollection(where:{tags_contains_all: "${tag}"}, order: datePosted_DESC, limit: ${limit}) {
          items {
            ${ARTICLE_GROUP_FIELDS}
          }
        }
      }`,
  );

  //console.log(JSON.stringify(articles))

  return extractArticleEntries(articles as GraphQLBlogResponse);
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
  return extractArticleEntries(article as GraphQLBlogResponse)[0];
}
