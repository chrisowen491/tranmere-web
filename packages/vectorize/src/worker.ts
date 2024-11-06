import type {
  VectorizeIndex,
  Fetcher,
  Request
} from '@cloudflare/workers-types';

import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings
} from '@langchain/cloudflare';
import { IBlogPost, IBlogPostFields } from '@tranmere-web/lib/src/contentful';

export interface Env {
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Fetcher;
  CF_SPACE: string;
  CF_KEY: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    const embeddings = new CloudflareWorkersAIEmbeddings({
      binding: env.AI,
      model: '@cf/baai/bge-base-en-v1.5'
    });
    const store = new CloudflareVectorizeStore(embeddings, {
      index: env.VECTORIZE_INDEX
    });
    if (pathname === '/') {
      const results = await store.similaritySearch('Ian Muir', 5);
      return Response.json(results);
    } else if (pathname === '/players') {
      const search = await fetch(
        'https://api.tranmere-web.com/player-search/?season=&sort=&filter=',
        { method: 'GET' }
      );

      const results = (await search.json()) as unknown as {
        players: PlayerSeasonSummary[];
      };

      const documents: Document[] = [];
      const ids: string[] = [];

      results.players.forEach((player) => {
        documents.push({
          pageContent: JSON.stringify(player),
          metadata: { type: 'Player' }
        });
        ids.push(player.Player);
      });

      // Upsertion by id is supported
      await store.addDocuments(documents, ids);
      return Response.json({ success: true });
    } else if (pathname === '/blogs') {
      const blogsRequest = await fetch(
        `https://cdn.contentful.com/spaces/${env.CF_SPACE}/environments/master/entries?access_token=${env.CF_KEY}&content_type=blogPost`
      );

      const blogs = (await blogsRequest.json()) as { items: IBlogPost[] };

      const documents: Document[] = [];
      const ids: string[] = [];

      for (const blog of blogs.items) {
        const fields = blog.fields as IBlogPostFields;

        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200
        });

        const docs = await splitter.splitDocuments([
          new Document({
            pageContent: `
                Title: ${fields.title}
                Date Posted: ${fields.datePosted}
                Author: ${fields.author}
                Link: https://www.tranmere-web.com/page/blog/${blog.sys.id}                
                ${documentToPlainTextString(fields.blog!)}
                `,
            metadata: {
              type: 'Blog',
              blogId: blog.sys.id,
              link: `https://www.tranmere-web.com/page/blog/${blog.sys.id}`
            }
          })
        ]);

        for (let i = 0; i < docs.length; i++) {
          if (docs[i].metadata['loc'])
            docs[i].metadata['loc'] = JSON.stringify(docs[i].metadata['loc']);
          ids.push(blog.sys.id + '-chunk' + i);
        }
        documents.push(...docs);
      }
      // Upsertion by id is supported
      await store.addDocuments(documents, ids);
      return Response.json({ success: true });
    } else if (pathname === '/clear') {
      await store.delete({ ids: ['id1', 'id2', 'id3'] });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Not Found' }, { status: 404 });
  }
};
