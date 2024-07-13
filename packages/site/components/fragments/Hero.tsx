
import { Button } from '@/components/fragments/Button'

export function Hero() {
  return (
    <div className="overflow-hidden bg-blue-600 dark:bg-blue-600">
      <div className="py-4 sm:px-2 relative lg:px-0 lg:py-20">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">

            <div className="relative">
              <p className="mt-3 text-2xl tracking-tight text-blue-50">
                Welcome To Tranmere Web!
              </p>
              <p className="mt-3 text-2xl tracking-tight text-blue-50 mr-48 md:mr-2">
                The website full of data, statistics and information about Tranmere Rovers FC
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <Button href="/page/blog/about">About the Site</Button>
                <Button href="/player-builder" variant="tertiary">Avatar Builder</Button>
                <Button href="https://github.com/chrisowen491/tranmere-web/" variant="secondary">
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
          <div className="relative lg:static xl:pl-10">
            <div className="absolute inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
            </div>
          </div>
        </div>
        <img
            src="https://www.tranmere-web.com/builder/1989/side-parting-left-small/ffd3b3/none/bc9d00/fcb98b/none/bc8a00"
            alt="Image"
            width={"300px"}
            className="absolute bottom-0 right-0"
          />
      </div>

    </div>
  )
}
