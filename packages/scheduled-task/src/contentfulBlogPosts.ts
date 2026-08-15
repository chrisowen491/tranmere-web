import type { SearchIndexBlogRow } from '@tranmere-web/lib/src/d1-types';

interface ContentfulBlogResponse {
  data?: {
    blogPostCollection?: {
      items?: Array<{
        sys: { id: string };
        title?: string | null;
        slug?: string | null;
        description?: string | null;
        pic?: { url?: string | null } | null;
      } | null>;
    };
  };
  errors?: Array<{ message?: string }>;
}

export interface ContentfulSearchConfig {
  space: string;
  accessToken: string;
}

export async function fetchContentfulBlogPosts(
  config: ContentfulSearchConfig
): Promise<SearchIndexBlogRow[]> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${encodeURIComponent(config.space)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `query SearchIndexBlogPosts {
          blogPostCollection(where: { slug_exists: true }, limit: 1000) {
            items {
              sys { id }
              title
              slug
              description
              pic { url }
            }
          }
        }`
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Contentful search indexing failed with ${response.status}.`
    );
  }

  const body = (await response.json()) as ContentfulBlogResponse;
  if (body.errors?.length) {
    throw new Error(
      body.errors.map((error) => error.message ?? 'Unknown error').join('; ')
    );
  }

  return (body.data?.blogPostCollection?.items ?? []).flatMap((item) =>
    item?.title && item.slug
      ? [
          {
            id: item.sys.id,
            title: item.title,
            slug: item.slug,
            description: item.description,
            image_url: item.pic?.url
          }
        ]
      : []
  );
}
