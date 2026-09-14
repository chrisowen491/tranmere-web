import type { GalleryImage } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

const Slider = (props: { images: GalleryImage[]; title: string }) => {
  const images = props.images;

  return (
    <>
      <div>
        <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-2 lg:max-w-7xl lg:px-8">
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {images.map((elem, idx) => (
              <div key={idx} className="group relative">
                <div className="relative aspect-square w-full overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6] group-hover:opacity-75 lg:h-80">
                  <Image
                    alt={elem.description ? elem.description : "Image"}
                    src={elem.url}
                    fill
                    sizes="(min-width: 1280px) 280px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700 dark:text-indigo-50">
                      <Link href={elem.url}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {elem.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-indigo-50">
                      {elem.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Slider;
