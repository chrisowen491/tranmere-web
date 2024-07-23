import { useState } from "react";
import Button from "@/components/carousel/Button";
import Icons from "@/components/carousel/Icons";

const Carousel = ({ slides }: { slides: string[] }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="group relative w-6/12 flex flex-col items-center justify-center">
        <div className="w-full h-full inline-flex overflow-hidden rounded-lg">
          {slides.map((item, index) => (
            <img
              key={"image" + index}
              src={item}
              className={`w-full h-full min-w-full object-cover object-center transition-transform ease-out duration-500`}
              style={{ transform: `translateX(${-currentSlideIndex * 100}%)` }}
            />
          ))}
        </div>
        <Button className="left-5" onClick={prevSlide}>
          <Icons.ChevronLeft width={20} height={20} />
        </Button>

        <Button className="right-5" onClick={nextSlide}>
          <Icons.ChevronRight width={20} height={20} />
        </Button>
      </div>
      <div className="mt-6 flex items-center gap-4 w-full hidden md:display">
        {slides.map((_, index) => (
          <div
            key={"dot-" + index}
            onClick={() => setCurrentSlideIndex(index)}
            className={`h-4 w-4 rounded-full transition-colors duration-200 cursor-pointer ${
              currentSlideIndex === index ? "bg-white" : "bg-black/60"
            }`}
          />
        ))}
      </div>
    </>
  );
};

export default Carousel;
