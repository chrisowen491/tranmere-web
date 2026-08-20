import {
  deleteComment,
  GetCommentsByUrl,
  getCommentById,
  type Comment,
} from "@/lib/comments";
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth0 } from "@/lib/auth0";
import { getAdminSession } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { resolveAccount } from "@/lib/accounts";

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
  const env = (await getCloudflareContext({ async: true })).env;
  const account = session
    ? await resolveAccount(env.DB, session.user.sub)
    : null;
  const existing = await getCommentById(env.DB, id);
  if (!existing) {
    return NextResponse.json(
      { message: "That comment could not be found." },
      { status: 404 },
    );
  }

  const isAuthor = account?.id === existing.accountId;
  const isAdmin = Boolean(await getAdminSession());
  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { message: "You cannot delete this comment." },
      { status: 403 },
    );
  }

  await deleteComment(env.DB, id);
  revalidatePath(existing.url);

  const comments = await GetCommentsByUrl(env, existing.url, account?.id);
  return NextResponse.json(comments, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 },
      );
    }
    const env = (await getCloudflareContext({ async: true })).env;
    const account = await resolveAccount(env.DB, session.user.sub);
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
          Authorization: `Bearer ${env.OPENAI_API_KEY || process.env.OPENAI_API_KEY}`,
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

    const usernameClaim = session.user["https://www.tranmere-web.com/username"];

    const username = [
      usernameClaim,
      session.user.username,
      session.user.preferred_username,
      session.user.nickname,
      session.user.name,
      session.user.email,
    ].find((value): value is string =>
      Boolean(typeof value === "string" && value.trim()),
    );

    const comment: Comment = {
      created_at: new Date().toISOString(),
      url: body.url,
      text: flagged ? "Flagged By Auto Moderation" : body.text,
      rating: body.rating,
      user: {
        name: username?.trim() || "Supporter",
        picture: session.user.picture!,
        email: session.user.email,
      },
      isAuthor: true,
    };

    await env.DB.prepare(
      "INSERT INTO Ratings (page_url, image_url, created, account_id, user_name, email, rating, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        comment.url,
        comment.user.picture,
        comment.created_at,
        account.id,
        comment.user.name,
        comment.user.email,
        comment.rating,
        comment.text,
      )
      .run();

    const comments = await GetCommentsByUrl(env, body.url, account.id);

    const zone = env.CLOUDFLARE_ZONE || process.env.CLOUDFLARE_ZONE;
    const key = env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_API_KEY;
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
