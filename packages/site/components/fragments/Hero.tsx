import { Button } from "@/components/fragments/Button";
import Image from "next/image";

export function Hero() {
  return (
    <div className="overflow-hidden bg-blue-600 dark:bg-slate-950">
      <div className="py-4 sm:px-2 relative lg:px-0 lg:py-20">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">
            <div className="relative">
              <p className="mt-3 text-2xl tracking-tight text-blue-50">
                Welcome To Tranmere Web!
              </p>
              <p className="mt-3 text-xl sm:mr-32 tracking-tight text-blue-50">
                The website full of data, statistics and information about
                Tranmere Rovers FC
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <Button href="/page/blog/about">About the Site</Button>
                <Button href="/player-builder" variant="tertiary">
                  Avatar Builder
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Image
          src="https://www.tranmere-web.com/builder/1989/side-parting-left-small/ffd3b3/none/bc9d00/fcb98b/none/bc8a00"
          alt="Ian Muir Avatar"
          unoptimized={true}
          width={"300"}
          height={"300"}
          className="absolute bottom-0 right-0 w-2/6 sm:w-1/4 xl:w-1/6"
        />
      </div>
    </div>
  );
}
