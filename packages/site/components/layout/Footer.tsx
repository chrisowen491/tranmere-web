import Image from "next/image";
import Link from "next/link";

function GitHubIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="bg-blue-900 dark:bg-gray-950 text-gray-50 font-bold mt-4"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 pb-4 lg:px-4 py-12">
        <div className="xl:grid xl:grid-cols-4 xl:gap-2">
          <Link href="/">
            <Image
              src="/assets/images/logo_white_transparent.png"
              alt="TranmereWeb.com Logo"
              width={160}
              height={93}
            />
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 md:flex md:items-center md:justify-between lg:px-8 pb-6">
        <div className="flex justify-center space-x-6 md:order-2 text-xs ">
          <Link
            href="https://github.com/chrisowen491/tranmere-web/"
            className=""
            aria-label="GitHub"
          >
            <GitHubIcon className="h-6 w-6 fill-slate-50 dark:fill-blue-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
          </Link>
          <Link
            href={"/page/blog/about"}
            className="text-gray-50 dark:text-blue-400 hover:bg-rose-950 rounded-md px-3 py-2 "
          >
            About the Site
          </Link>
          <Link
            href={"/contact"}
            className="text-gray-50 dark:text-blue-400 hover:bg-rose-950 rounded-md px-3 py-2 "
          >
            Contact Us
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-50 py-2 dark:text-blue-400">
            &copy; 2024 Tranmere-Web.com
          </p>
        </div>
      </div>
    </footer>
  );
}
