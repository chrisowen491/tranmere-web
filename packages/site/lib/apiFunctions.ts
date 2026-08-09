import { YouTubeResponse } from "./types";

const YOUTUBE_HOST = "https://youtube.googleapis.com";

export async function getPlaylist(channelId: string, count: number) {
  try {
    const response = await fetch(
      `${YOUTUBE_HOST}/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${count}&playlistId=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
    );

    const data = (await response.json()) as YouTubeResponse;

    return data;
  } catch (err) {
    console.log(err);
  }

  return null;
}
