"use client";

export function Video(props: { youtube: string }) {
  const { youtube = props.youtube } = props;

  return (
    <video
      id="vid1"
      className="video-js vjs-default-skin"
      controls
      autoPlay
      width="640"
      height="264"
      data-setup={`'{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "${youtube}"}] }'`}
    ></video>
  );
}
