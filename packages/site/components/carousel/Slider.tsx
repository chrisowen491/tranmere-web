import { GalleryImage } from "@/lib/types";

const Slider = (props: { images: GalleryImage[]; title: string }) => {
  const images = props.images;

  return (
    <>
      <div>
        <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-2 lg:max-w-7xl lg:px-8">
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {images.map((elem, idx) => (
              <div key={idx} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-indigo-200 dark:bg-black lg:aspect-none group-hover:opacity-75 lg:h-80">
                  <img
                    alt={elem.description}
                    src={elem.url}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700 dark:text-indigo-50">
                      <a href={elem.url}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {elem.title}
                      </a>
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
