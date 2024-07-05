"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { GalleryImage } from "@/lib/types";

export function Gallery(props: { gallery: GalleryImage[] }) {
  return (
    <Carousel
      showArrows={true}
      showIndicators={false}
      showThumbs={false}
      className={"mySwiper"}
    >
      {props.gallery.map((item, idx) => (
        <div key={idx}>
          <img
            src={item.url}
            alt={item.title}
            width="200px"
          />
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
      ))}
    </Carousel>
  );
}
