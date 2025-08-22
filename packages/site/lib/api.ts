// Set a variable that contains all the fields needed for articles when a fetch for

import {
  GraphQLAssetsResponse,
  GraphQLBlogResponse,
  GraphQLPlayerResponse,
  Shirt,
  ShirtColor,
  ShirtUsageType,
} from "./types";

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

async function fetchGraphQL(query: string) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CF_SPACE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CF_KEY}`,
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

export async function getShirts() : Promise<Shirt[]> {
    const shirt : Shirt = {
        id: '1989-home-shirt',
        name: '1989 Home Shirt',
        price: '',
        manufacturer: 'Enkay',
        href: '/shirts/1989-home-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/home/1989/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: '/images/shirts/home/1989/2.png',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 3,
                imageSrc: '/images/shirts/home/1989/3.png',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
          'Long Sleeve',
          'Wembley Edition'
        ],
        use: ShirtUsageType.Home,
        seasons: [1989, 1990],
        color: ShirtColor.White,
        decade: "1980s"
    }

    const shirt2 : Shirt = {
        id: '1999-home-shirt',
        name: '1999 Home Shirt',
        price: '',
        manufacturer: 'Patrick',
        href: '/shirts/1999-home-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/home/1999/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: '/images/shirts/home/1999/2.png',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 3,
                imageSrc: '/images/shirts/home/1999/3.png',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
          'Long Sleeve',
          'Wembley Edition'
        ],
        use: ShirtUsageType.Home,
         seasons: [1999],
        color: ShirtColor.White,
        decade: "1990s"
    }

     const shirt3 : Shirt = {
        id: '2005-third-shirt',
        name: '2005 Third Shirt',
        price: '',
        manufacturer: 'Vandanel',
        href: '/shirts/2005-third-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/third/2005/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: '/images/shirts/third/2005/2.png',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 3,
                imageSrc: '/images/shirts/third/2005/3.png',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 4,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIyMDA1LTA2L1NjYW4gMjkuanBlZyJ9',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 5,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIyMDA1LTA2L1NjYW4gMTYuanBlZyJ9',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
          'Long Sleeve',
        ],
        use: ShirtUsageType.Third,
         seasons: [2005],
        color: ShirtColor.Blue,
        decade: "2000s"
    }

      const shirt4 : Shirt = {
        id: '2021-third-shirt',
        name: '2021 Third Shirt',
        price: '',
        manufacturer: 'Mills',
        href: '/shirts/2021-third-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/third/2021/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: '/images/shirts/third/2021/2.png',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Third,
        seasons: [2021],
        color: ShirtColor.Yellow,
        decade: "2020s"
    }

    const shirt5 : Shirt = {
        id: '1995-home-shirt',
        name: '1995 Home Shirt',
        price: '',
        manufacturer: 'Mizuno',
        href: '/shirts/1995-home-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/home/1995/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: '/images/shirts/home/1995/2.png',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Home,
        seasons: [1995,1996],
        color: ShirtColor.White,
        decade: "1990s"
    }

    const shirt6 : Shirt = {
        id: '1993-home-shirt',
        name: '1993 Home Shirt',
        price: '',
        manufacturer: 'Rover Sports',
        href: '/shirts/1993-home-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/home/1993/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIxOTkzLTk0L1NjYW4gMTMuanBlZyJ9',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 3,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIxOTkzLTk0L1NjYW4gMjQuanBlZyJ9',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 4,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIxOTkzLTk0L1NjYW4gMjQuanBlZyJ9',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Home,
        seasons: [1993,1994],
        color: ShirtColor.White,
        decade: "1990s"
    }

    const shirt7 : Shirt = {
        id: '1997-home-shirt',
        name: '1997 Home Shirt',
        price: '',
        manufacturer: 'Mizuno',
        href: '/shirts/1997-home-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/home/1997/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            },
            {
                id: 2,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIxOTk4LTk5L1NjYW4gNC5qcGVnIn0',
                imageAlt: "Side profile of women's Basic Tee in black.",
                primary: false,
            },
            {
                id: 3,
                imageSrc: 'https://images.tranmere-web.com/eyJidWNrZXQiOiJ0cmZjLXByb2dyYW1tZXMiLCJrZXkiOiIxOTk3LTk4L1NjYW4gMTkuanBlZyJ9',
                imageAlt: "Front of women's Basic Tee in black.",
                primary: false,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Home,
        seasons: [1997,1998],
        color: ShirtColor.White,
        decade: "1990s"
    }

    const shirt8 : Shirt = {
        id: '1989-third-shirt',
        name: '1989 Third Shirt',
        price: '',
        manufacturer: 'Enkay',
        href: '/shirts/1989-third-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/third/1989/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Third,
        seasons: [1989,1990],
        color: ShirtColor.Blue,
        decade: "1990s"
    }

    const shirt9 : Shirt = {
        id: '2020-away-shirt',
        name: '2020 Away Shirt',
        price: '',
        manufacturer: 'Puma',
        href: '/shirts/2020-away-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/away/2020/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Away,
        seasons: [2020],
        color: ShirtColor.Black,
        decade: "2020s"
    }

    const shirt10 : Shirt = {
        id: '1993-away-shirt',
        name: '1993 Away Shirt',
        price: '',
        manufacturer: 'Rover Sports',
        href: '/shirts/1993-away-shirt',
        images: [
            {
                id: 1,
                imageSrc: '/images/shirts/away/1993/1.png',
                imageAlt: "Back of women's Basic Tee in black.",
                primary: true,
            }
        ],
        description: "",
        variants: [
        ],
        use: ShirtUsageType.Away,
        seasons: [1993, 1994],
        color: ShirtColor.Green,
        decade: "1990s"
    }

    return [shirt, shirt2, shirt3, shirt4, shirt5, shirt6, shirt7, shirt8, shirt9, shirt10].sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
}