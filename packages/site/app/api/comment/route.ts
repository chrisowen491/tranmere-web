import {
  deleteComment,
  GetCommentsByUrl,
  getCommentById,
  type Comment,
} from "@/lib/comments";
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache";

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
  const id = Number(body.comment.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "Invalid comment ID." },
      { status: 400 },
    );
  }

  const session = await auth0.getSession();
  const env = getCloudflareContext().env;
  const existing = await getCommentById(env.DB, id);
  if (!existing) {
    return NextResponse.json(
      { message: "That comment could not be found." },
      { status: 404 },
    );
  }

  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  const isAuthor = session?.user.sub === existing.user.sub;
  const isAdmin = Boolean(
    session && adminEmail && session.user.email === adminEmail,
  );
  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { message: "You cannot delete this comment." },
      { status: 403 },
    );
  }

  await deleteComment(env.DB, id);
  revalidatePath(existing.url);

  const comments = await GetCommentsByUrl(env, existing.url);
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
          Authorization: `Bearer ${getCloudflareContext().env.OPENAI_API_KEY ? getCloudflareContext().env.OPENAI_API_KEY : process.env.OPENAI_API_KEY}`,
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

    await getCloudflareContext()
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

    const comments = await GetCommentsByUrl(
      getCloudflareContext().env,
      body.url,
    );

    const zone = getCloudflareContext().env.CLOUDFLARE_ZONE
      ? getCloudflareContext().env.CLOUDFLARE_ZONE
      : process.env.CLOUDFLARE_ZONE;
    const key = getCloudflareContext().env.CLOUDFLARE_API_KEY
      ? getCloudflareContext().env.CLOUDFLARE_API_KEY
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
