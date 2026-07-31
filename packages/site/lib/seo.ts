import type { Metadata } from "next";

const defaultImage = { url: "/og.png", width: 1200, height: 630 };

export function pageMetadata({
  title,
  description,
  pathname,
  image,
  article = false,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string | null;
  article?: boolean;
}): Metadata {
  const images = image ? [{ url: image }] : [defaultImage];

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title,
      description,
      url: pathname,
      type: article ? "article" : "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((item) => item.url),
    },
  };
}
