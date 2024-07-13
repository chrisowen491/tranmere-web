export const runtime = "edge";

import { getSession } from '@auth0/nextjs-auth0/edge';
import { GetCommentsByUrl, type Comment } from "@/lib/comments";
import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function DELETE(req: NextRequest) {

  const data = await getSession();
  const body = (await req.json()) as {comment: Comment};

  await getRequestContext().env.DB.prepare('DELETE FROM Ratings WHERE id = ?')
  .bind(body.comment.id).run();
  
  const comments = await GetCommentsByUrl(getRequestContext().env, body.comment.url)
  return NextResponse.json(comments, { status: 200 });
}

export async function POST(req: NextRequest) {
  
  try {
    const data = await getSession();
    const body = (await req.json()) as Comment;
    
    const comment : Comment = {
      created_at: (new Date()).toISOString(),
      url: body.url,
      text: body.text,
      rating: body.rating,
      user: {
        name: data!.user.name,
        picture: data!.user.picture,
        sub: data!.user.sub,
        email: data!.user.email
      }
    }

    await getRequestContext().env.DB.prepare('INSERT INTO Ratings (page_url, image_url, created, sub, user_name, email, rating, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(comment.url, comment.user.picture, comment.created_at,comment.user.sub, comment.user.name, comment.user.email, comment.rating, comment.text ).run();

    
    const comments = await GetCommentsByUrl(getRequestContext().env, body.url)
    return NextResponse.json(comments, { status: 200 });
  } catch (ex) {
    console.log(ex)
    return NextResponse.json({message: "ex"}, { status: 500 });
  }
};