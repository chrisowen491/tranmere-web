"use client";
import { YouTubeResponse } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function YouTubeGallery(props: { playlist: YouTubeResponse }) {
  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-8">
      <h1 className="text-3xl font-semibold">Latest YouTube</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-full">
        {props.playlist?.items.map((i) => (
          <div
            key={i.id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md flex justify-center max-h-full"
          >
            <Link
              href={
                `https://www.youtube.com/watch?v=` + i.contentDetails.videoId
              }
            >
              <Image
                src={i.snippet.thumbnails.high.url}
                width={i.snippet.thumbnails.high.width}
                height={i.snippet.thumbnails.high.height}
                alt={i.snippet.title}
              />
              <h4 className="mt-3 text-2xl tracking-tight">
                {i.snippet.title}
              </h4>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
