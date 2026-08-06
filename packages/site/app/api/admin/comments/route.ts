import { getAdminSession } from "@/lib/adminAuth";
import { deleteComment, getCommentById, updateComment } from "@/lib/comments";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface CommentRequest {
  id?: number;
  rating?: number;
  text?: string;
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function validId(value?: number) {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminSession())) {
    return error("You do not have permission to manage comments.", 403);
  }

  const body = (await request.json()) as CommentRequest;
  const rating = Number(body.rating);
  const text = body.text?.trim().slice(0, 5000) || "";
  if (
    !validId(body.id) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return error("Enter a valid comment and a rating from 1 to 5.", 400);
  }

  const db = getCloudflareContext().env.DB;
  const existing = await getCommentById(db, body.id!);
  if (!existing) return error("That comment could not be found.", 404);

  const comment = await updateComment(db, body.id!, rating, text);
  revalidatePath(existing.url);
  return NextResponse.json({ comment });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAdminSession())) {
    return error("You do not have permission to manage comments.", 403);
  }

  const body = (await request.json()) as CommentRequest;
  if (!validId(body.id)) return error("Enter a valid comment ID.", 400);

  const comment = await deleteComment(getCloudflareContext().env.DB, body.id!);
  if (!comment) return error("That comment could not be found.", 404);

  revalidatePath(comment.url);
  return NextResponse.json({ deleted: comment.id });
}
