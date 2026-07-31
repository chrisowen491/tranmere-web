"use client";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState } from "react";
import { SubmitButton } from "../forms/SubmitButton";

const inputClass =
  "mt-2 block w-full border border-[#071a2b]/15 bg-white px-4 py-3 text-sm text-[#071a2b] shadow-sm outline-none transition placeholder:text-[#071a2b]/35 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setStatus("idle");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          desc: formData.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });
      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="overflow-hidden bg-[#f4f7f8] pb-24 text-[#071a2b]">
      <section className="border-b border-[#071a2b]/10 bg-[#071a2b] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8ff2d4]">
              Tranmere-Web archive
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Get in touch
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Have a question about the archive, spotted a piece of Rovers
              history that needs correcting, or want to share something worth
              preserving? Send us a note.
            </p>
          </div>

          <div className="grid gap-px self-end overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Archive queries", "Ask about players, matches or seasons."],
              ["Corrections", "Help us make the history more accurate."],
              ["Site support", "Report an issue or suggest an improvement."],
            ].map(([title, copy], index) => (
              <div key={title} className="bg-[#071a2b] px-5 py-5">
                <span className="font-mono text-[10px] font-bold text-[#8ff2d4]">
                  0{index + 1}
                </span>
                <h2 className="mt-2 text-sm font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-5 text-white/55">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-12 sm:px-10 lg:px-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(420px,1fr)] lg:items-start">
          <aside className="lg:pt-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
              A supporter-built record
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
              Every useful detail makes the archive stronger.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#071a2b]/65">
              We read every message. Please include as much context as you can
              for historical corrections, such as a source, programme, match
              date or newspaper reference.
            </p>
            <div className="mt-8 border-l-2 border-emerald-500 pl-4 text-sm leading-6 text-[#071a2b]/65">
              For personal-information queries, please see our{" "}
              <Link
                href="/page/blog/privacy-policy"
                className="font-bold text-blue-700 underline underline-offset-4"
              >
                Privacy policy
              </Link>
              .
            </div>
          </aside>

          <section className="border border-[#071a2b]/12 bg-white p-6 shadow-[0_20px_50px_rgba(7,26,43,0.08)] sm:p-9">
            <div className="border-b border-[#071a2b]/10 pb-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                Send a message
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">
                Tell us what you&apos;ve found
              </h2>
            </div>

            {status === "success" && (
              <div
                role="status"
                className="mt-6 flex gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
              >
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
                <p>
                  <strong>Message received.</strong> Thank you for helping us
                  improve the archive.
                </p>
              </div>
            )}

            {status === "error" && (
              <div
                role="alert"
                className="mt-6 flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              >
                <XCircleIcon className="mt-0.5 h-5 w-5 flex-none text-red-600" />
                <p>
                  We could not send your message. Please try again in a moment.
                </p>
              </div>
            )}

            {status !== "success" && (
              <form
                className="mt-7"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onSubmit(new FormData(event.currentTarget));
                }}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/60">
                    Your name
                    <input
                      required
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/60">
                    Email address
                    <input
                      required
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </label>
                  <label className="block sm:col-span-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/60">
                    Your message
                    <textarea
                      required
                      id="message"
                      name="message"
                      rows={7}
                      placeholder="Include any helpful detail, source or link…"
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </label>
                </div>
                <div className="mt-7 flex flex-col gap-4 border-t border-[#071a2b]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-xs leading-5 text-[#071a2b]/50">
                    By sending a message, you agree to our use of your details
                    to respond to your enquiry.
                  </p>
                  <SubmitButton disabled={isSubmitting}>
                    {isSubmitting ? "Sending…" : "Send message"}
                  </SubmitButton>
                </div>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
