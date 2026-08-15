import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchContentfulBlogPosts } from '../src/contentfulBlogPosts';

describe('fetchContentfulBlogPosts', () => {
  afterEach(() => vi.restoreAllMocks());

  it('maps published Contentful posts to search index rows', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            blogPostCollection: {
              items: [
                {
                  sys: { id: 'post-1' },
                  title: 'A night at Wembley',
                  slug: 'a-night-at-wembley',
                  description: 'Remembering a famous final',
                  pic: { url: 'https://images.ctfassets.net/cover.jpg' }
                },
                { sys: { id: 'draft-without-slug' }, title: 'Incomplete' }
              ]
            }
          }
        }),
        { status: 200 }
      )
    );

    await expect(
      fetchContentfulBlogPosts({ space: 'space-id', accessToken: 'token' })
    ).resolves.toEqual([
      {
        id: 'post-1',
        title: 'A night at Wembley',
        slug: 'a-night-at-wembley',
        description: 'Remembering a famous final',
        image_url: 'https://images.ctfassets.net/cover.jpg'
      }
    ]);
  });

  it('rejects Contentful GraphQL errors without exposing the access token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'Invalid query' }] }), {
        status: 200
      })
    );

    await expect(
      fetchContentfulBlogPosts({ space: 'space-id', accessToken: 'secret' })
    ).rejects.toThrow('Invalid query');
  });
});
