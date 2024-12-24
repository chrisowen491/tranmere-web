
import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
/*
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings
} from '@langchain/cloudflare';
import { IBlogPost, IBlogPostFields } from '@tranmere-web/lib/src/contentful';
*/

export interface Env {
  VECTORIZE: Vectorize;
  AI: Ai;
  CF_SPACE: string;
  CF_KEY: string;
}

interface EmbeddingResponse {
  shape: number[];
  data: number[][];
}


export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    
    if (pathname === '/') {

      const url = new URL(request.url);
      // Your query: expect this to match vector ID. 1 in this example
      let userQuery = "who is Ian Muir";
      const queryVector: EmbeddingResponse = await env.AI.run(
        "@cf/baai/bge-base-en-v1.5",
        {
          text: [url.searchParams.get('query') || userQuery],
        },
      );

      let matches = await env.VECTORIZE.query(queryVector.data[0], {
        topK: 1,
      });

      return Response.json({
        matches: matches,
      });

    } else if (pathname === '/players') {
      const search = await fetch(
        'https://api.tranmere-web.com/player-search/?season=&sort=&filter=',
        { method: 'GET' }
      );

      const errors : string[] = [];

      const results = (await search.json()) as unknown as {
        players: PlayerSeasonSummary[];
      };

      let vectors: VectorizeVector[] = [];

      let biographies : string[] = [];
      let playerNames : string[] = [];

      results.players.forEach(async (player) => {
        if(player.bio?.biography) {
          const bio = documentToPlainTextString(player.bio?.biography) 
          biographies.push(`A biography of ${player.Player}. ${bio}`);
          playerNames.push(player.Player);
        }
      });

      const modelResp: EmbeddingResponse = await env.AI.run(
        "@cf/baai/bge-base-en-v1.5",
        {
          text: biographies,
        },
      );

      modelResp.data.forEach((vector, idx) => {
        vectors.push({ id: playerNames[idx], values: vector, metadata: { type: 'Player' } });
      });

      let inserted = await env.VECTORIZE.upsert(vectors);
      return Response.json(inserted);
    } else if (pathname === '/blogs') {
      /*
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
      */
    } else if (pathname === '/clear') {
      const search = await fetch(
        'https://api.tranmere-web.com/player-search/?season=&sort=&filter=',
        { method: 'GET' }
      );

      const errors : string[] = [];

      const results = (await search.json()) as unknown as {
        players: PlayerSeasonSummary[];
      };
      await env.VECTORIZE.deleteByIds(results.players.map((player) => player.Player));
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Not Found' }, { status: 404 });
  }
};
