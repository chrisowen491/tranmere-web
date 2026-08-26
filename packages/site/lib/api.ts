// Set a variable that contains all the fields needed for articles when a fetch for

import {
  GraphQLAssetsResponse,
  GraphQLBlogResponse,
  GraphQLPlayerResponse,
} from "./types";
import { cache } from "react";

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
      ... on Graph {
        title
        chart
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

async function fetchGraphQL(query: string, tags: string[]) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CF_SPACE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CF_KEY}`,
      },
      body: JSON.stringify({ query }),
      cache: "force-cache",
      // Cache editorial data independently so a future Contentful webhook can
      // invalidate only the collection or item that was published.
      next: { revalidate: 60 * 60 * 24, tags },
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
  console.log(tag);
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
    [`contentful:gallery:${tag}`],
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
    ["contentful:players"],
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
    ["contentful:articles"],
  );

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
    [`contentful:articles:tag:${tag}`, "contentful:articles"],
  );

  return extractArticleEntries(articles as GraphQLBlogResponse);
}

export const getArticle = cache(async function getArticle(slug: string) {
  const article = await fetchGraphQL(
    `query {
        blogPostCollection(where:{slug: "${slug}"}, limit: 1) {
          items {
            ${ARTICLE_GRAPHQL_FIELDS}
          }
        }
    }`,
    [`contentful:article:${slug}`, "contentful:articles"],
  );
  return extractArticleEntries(article as GraphQLBlogResponse)[0];
});
