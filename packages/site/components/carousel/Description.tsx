import React from "react";
import left from "../../public/left.svg";
import right from "../../public/right.svg";
import Image from "next/image";
import { GalleryImage } from "@/lib/types";

type Props = {
  activeImage: any;
  clickNext: any;
  clickPrev: any;
  images: GalleryImage[];
  title: string;
};

const Description = ({ activeImage, clickNext, clickPrev, images, title }: Props) => {
  return (
    <div className="grid place-items-start w-full relative md:rounded-tr-3xl md:rounded-br-3xl">
      {images.map((elem, idx) => (
        <div
          key={idx}
          className={`${
            idx === activeImage
              ? "block w-full h-full md:h-[80vh] md:px-20 px-10 text-left"
              : "hidden"
          }`}
        >
        <div className="">
            <div
              className="absolute top-2 right-10 cursor-pointer"
              onClick={clickPrev}
            >
              <Image src={left} alt="" className=" bg-blue-600" />
            </div>

            <div
              className="absolute top-2 right-2 cursor-pointer"
              onClick={clickNext}
            >
              <Image src={right} alt="" className=" bg-blue-600" />
            </div>
          </div>
          <div
            className="w-full"
          >
            <div className="py-8 text-2xl font-extrabold">{elem.title}</div>
            <div className="leading-relaxed font-medium text-base tracking-wide italic">
              {" "}
              {elem.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Description;