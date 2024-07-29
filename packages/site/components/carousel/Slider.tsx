"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import Description from "./Description";
import { GalleryImage } from "@/lib/types";

const Slider = (props: { images: GalleryImage[]; title: string }) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = props.images;

  const clickNext = () => {
    activeImage === images.length - 1
      ? setActiveImage(0)
      : setActiveImage(activeImage + 1);
  };
  const clickPrev = () => {
    activeImage === 0
      ? setActiveImage(images.length - 1)
      : setActiveImage(activeImage - 1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      clickNext();
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [activeImage]);
  return (
    <div className="grid place-items-center md:grid-cols-2 grid-cols-1 w-full mx-auto max-w-5xl">
      <Description
        activeImage={activeImage}
        clickNext={clickNext}
        clickPrev={clickPrev}
        images={images}
        title={props.title}
      />
      <div
        className={`w-full flex justify-center items-center gap-4 transition-transform ease-in-out duration-500 md:rounded-2xl p-6 md:p-0 mb-20`}
      >
        {images.map((elem, idx) => (
          <div
            key={idx}
            className={`${
              idx === activeImage
                ? "block w-1/2 h-[80vh] object-cover transition-all duration-500 ease-in-out"
                : "hidden"
            }`}
          >
            <Image src={elem.url} alt="" width={400} height={400} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
