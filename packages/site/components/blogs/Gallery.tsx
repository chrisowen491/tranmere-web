"use client";

import { GalleryImage } from "@/lib/types";
import Carousel from "@/components/carousel/Carousel";

export function Gallery(props: { gallery: GalleryImage[] }) {
  const items = props.gallery.map((g, idx) => {
    return g.url + "?h=400";
  });

  return <Carousel slides={items}></Carousel>;
}
