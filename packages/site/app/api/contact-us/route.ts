import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactRequest = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  desc: z.string().trim().min(1).max(5000),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function messageText({ name, email, desc }: z.infer<typeof contactRequest>) {
  return `Name: ${name}\nEmail: ${email}\n\nMessage:\n${desc}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please provide a valid message." },
      { status: 400 },
    );
  }

  const parsed = contactRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please complete your name, email address and message." },
      { status: 400 },
    );
  }

  const { name, email, desc } = parsed.data;
  const text = messageText(parsed.data);
  const env = getCloudflareContext().env;

  try {
    await env.CONTACT_EMAIL.send({
      to: env.AUTH0_ADMIN_EMAIL,
      from: {
        email: "admin@tranmere-web.com",
        name: "Tranmere-Web contact form",
      },
      replyTo: { email, name },
      subject: `Website contact: ${name}`,
      text,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(desc).replace(/\n/g, "<br>")}</p>`,
    });
  } catch (error) {
    console.error("Unable to send contact form email", error);
    return NextResponse.json(
      { message: "We could not send your message. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Message sent." }, { status: 201 });
}
