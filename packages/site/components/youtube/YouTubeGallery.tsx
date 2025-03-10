"use client";
import { YouTubeResponse } from "@/lib/types";
import YouTube from "react-youtube";

export default function YouTubeGallery(props: { playlist: YouTubeResponse }) {
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-8">
      <h1 className="text-3xl font-semibold">Latest YouTube</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.playlist?.items.map((i) => (
          <div
            key={i.id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"
          >
            <YouTube videoId={i.contentDetails.videoId} opts={opts} />
          </div>
        ))}
      </div>
    </div>
  );
}
