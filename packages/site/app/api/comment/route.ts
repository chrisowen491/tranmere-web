export const runtime = "edge";

import { GetCommentsByUrl, type Comment } from "@/lib/comments";
import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth0 } from "@/lib/auth0";

export interface ModerationResult {
  id: string;
  model: string;
  results: Result[];
}

export interface Result {
  flagged: boolean;
  categories: Categories;
  category_scores: CategoryScores;
}

export interface Categories {
  sexual: boolean;
  hate: boolean;
  harassment: boolean;
  "self-harm": boolean;
  "sexual/minors": boolean;
  "hate/threatening": boolean;
  "violence/graphic": boolean;
  "self-harm/intent": boolean;
  "self-harm/instructions": boolean;
  "harassment/threatening": boolean;
  violence: boolean;
}

export interface CategoryScores {
  sexual: number;
  hate: number;
  harassment: number;
  "self-harm": number;
  "sexual/minors": number;
  "hate/threatening": number;
  "violence/graphic": number;
  "self-harm/intent": number;
  "self-harm/instructions": number;
  "harassment/threatening": number;
  violence: number;
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { comment: Comment };

  await getRequestContext()
    .env.DB.prepare("DELETE FROM Ratings WHERE id = ?")
    .bind(body.comment.id)
    .run();

  const comments = await GetCommentsByUrl(
    getRequestContext().env,
    body.comment.url,
  );
  return NextResponse.json(comments, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth0.getSession();
    const body = (await req.json()) as Comment;

    // Check Comment Moderation

    const moderationRequest = await fetch(
      "https://api.openai.com/v1/moderations",
      {
        method: "POST",
        body: JSON.stringify({
          input: body.text,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getRequestContext().env.OPENAI_API_KEY ? getRequestContext().env.OPENAI_API_KEY : process.env.OPENAI_API_KEY}`,
        },
      },
    );

    const result = (await moderationRequest.json()) as ModerationResult;
    let flagged = false;
    result.results.forEach((m) => {
      if (m.flagged) {
        flagged = m.flagged;
      }
    });

    const comment: Comment = {
      created_at: new Date().toISOString(),
      url: body.url,
      text: flagged ? "Flagged By Auto Moderation" : body.text,
      rating: body.rating,
      user: {
        name: session!.user.name!,
        picture: session!.user.picture!,
        sub: session!.user.sub,
        email: session!.user.email,
      },
    };

    await getRequestContext()
      .env.DB.prepare(
        "INSERT INTO Ratings (page_url, image_url, created, sub, user_name, email, rating, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        comment.url,
        comment.user.picture,
        comment.created_at,
        comment.user.sub,
        comment.user.name,
        comment.user.email,
        comment.rating,
        comment.text,
      )
      .run();

    const comments = await GetCommentsByUrl(getRequestContext().env, body.url);

    const zone = getRequestContext().env.CLOUDFLARE_ZONE
      ? getRequestContext().env.CLOUDFLARE_ZONE
      : process.env.CLOUDFLARE_ZONE;
    const key = getRequestContext().env.CLOUDFLARE_API_KEY
      ? getRequestContext().env.CLOUDFLARE_API_KEY
      : process.env.CLOUDFLARE_API_KEY;
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
      {
        method: "POST",
        body: JSON.stringify({
          files: [`https://www.tranmere-web.com${comment.url}`],
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
      },
    );

    return NextResponse.json(comments, { status: 200 });
  } catch (ex) {
    console.log(ex);
    return NextResponse.json({ message: "ex" }, { status: 500 });
  }
}
