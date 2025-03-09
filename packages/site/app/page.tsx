import { FAQs } from "@/components/fragments/FAQ";
import { Hero } from "@/components/fragments/Hero";
import { Metadata } from "next";
import { PlayerOfTheDay } from "@/components/fragments/PlayerOfTheDay";
import { LastMatch } from "@/components/fragments/LastMatch";
import {
  BanknotesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { OnThisDay } from "@/components/fragments/OnThisDay";
import { TagCloud } from "@/components/blogs/TagCloud";
import Link from "next/link";
import {
  GetAllPlayers,
  GetLastMatch,
  GetOnThisDay,
} from "@tranmere-web/lib/src/apiFunctions";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { PlayerProfile } from "@/lib/types";
import { getAllArticles } from "@/lib/api";
import { GetBaseUrl, getPlaylist } from "@/lib/apiFunctions";
import YouTubeGallery from "@/components/youtube/YouTubeGallery";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Tranmere-Web: A Tranmere Rovers fansite",
  description:
    "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC",
  metadataBase: new URL("https://www.tranmere-web.com/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tranmere-Web: A Tranmere Rovers fansite",
    type: "website",
    images: "/assets/images/square_v1.png",
    url: "/",
  },
};

export default async function Home() {
  const faqs = [
    {
      question: "Can I create my own player avatar?",
      answer: "Yes, checkout the custom tool for customizing you own avatar",
    },
    {
      question: "Do you have every Tranmere Rovers result?",
      answer:
        "We have all first team results since 1921. With appearance and goal data since 1977. Assist data is patchy since it is not definitively recorded.",
    },
    {
      question: "How are match reports written?",
      answer: "All our match reports are written using Generative AI.",
    },
    {
      question: "Where do you get your results information?",
      answer:
        "Results data is primarily sourced from James P. Curley (2016). engsoccerdata: English Soccer Data 1871-2016 on GitHub. Player apperance data is from various books and internet sources.",
    },
    {
      question: "Where do the programme pictures come from?",
      answer:
        "I have scanned these in from my own personal collection. There are over 2000 programme covers, including nearly every home game since 1960 (missing about 20!).",
    },
  ];

  const actions = [
    {
      title: "Transfers",
      href: "/transfer-central",
      icon: BanknotesIcon,
      iconForeground: "text-teal-700",
      iconBackground: "bg-teal-50",
      text: "Transfers in and out of Tranmere Rovers since 1977",
    },
    {
      title: "Manager Records",
      href: "/managers",
      icon: BriefcaseIcon,
      iconForeground: "text-purple-700",
      iconBackground: "bg-purple-50",
      text: "Complete list of Tranmere Rvers managers since 1920",
    },
    {
      title: "Top Attendances",
      href: "/games/top-attendances",
      icon: UserGroupIcon,
      iconForeground: "text-sky-700",
      iconBackground: "bg-sky-50",
      text: "Attendance records at home and way from Prenton Park",
    },
    {
      title: "Top Scorers By Season",
      href: "/top-scorers-by-season",
      icon: ChartBarIcon,
      iconForeground: "text-yellow-700",
      iconBackground: "bg-yellow-50",
      text: "Which Tranmere player scored the most goals in each season",
    },
    {
      title: "Penalty Shootouts",
      href: "/games/penalty-shootouts",
      icon: StarIcon,
      iconForeground: "text-rose-700",
      iconBackground: "bg-rose-50",
      text: "Each penalty shootout Tranmere have been involved in",
    },
    {
      title: "Wembley Games",
      href: "/games/at-wembley",
      icon: TrophyIcon,
      iconForeground: "text-indigo-700",
      iconBackground: "bg-indigo-50",
      text: "Tranmere's record at Wembley Stadium",
    },
  ];

  const stats = [
    { id: 1, name: "Results Data", value: "5000+" },
    { id: 2, name: "Programme Scans", value: "2000+" },
    { id: 3, name: "Player Profiles", value: "500+" },
    { id: 4, name: "Match Reports", value: "20+" },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const players = await GetAllPlayers();
  const randomplayer = players[Math.floor(Math.random() * players.length)];

  const url =
    GetBaseUrl(getRequestContext().env) + `/page/player/${randomplayer.name}`;

  const playlist = await getPlaylist('UUNMoCVGAOprD7EIJlffOUPg', 4);
  const playerRequest = await fetch(url);

  const profile = (await playerRequest.json()) as PlayerProfile;
  const match = await GetLastMatch();
  const onthisday = await GetOnThisDay();
  const articles = await getAllArticles(100);

  return (
    <>
      <Hero />
      <div className="relative mx-auto flex w-full max-w-8xl flex-auto justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="w-full">
          <div className="py-4">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-50">
                What&#39;s New
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6">
                <div className="relative lg:col-span-2">
                  <div className="absolute inset-px rounded-lg max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
                    <PlayerOfTheDay profile={profile} />
                  </div>
                  <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
                </div>
                <div className="relative lg:col-span-2">
                  <div className="absolute inset-px rounded-lg lg:rounded-tr-[2rem]" />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
                    <LastMatch match={match}></LastMatch>
                  </div>
                  <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]" />
                </div>
                <div className="relative lg:col-span-2">
                  <div className="absolute inset-px rounded-lg lg:rounded-tr-[2rem]" />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
                    <OnThisDay match={onthisday!}></OnThisDay>
                  </div>
                  <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]" />
                </div>
              </div>
            </div>
          </div>
          <YouTubeGallery playlist={playlist!}></YouTubeGallery>
          <div className="pt-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:max-w-none">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl  text-blue-600 dark:text-gray-50">
                    The Most Comprehensive Tranmere Rovers Database On The Web
                  </h2>
                  <p className="mt-4 text-lg leading-8 dark:text-gray-50">
                    Full results since 1921, appearance and goals data since
                    1977.
                  </p>
                </div>
                <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex flex-col bg-gray-400/5 p-8"
                    >
                      <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-50">
                        {stat.name}
                      </dt>
                      <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid lg:grid-cols-2 sm:gap-px sm:divide-y-0 mx-8">
            {actions.map((action, actionIdx) => (
              <div
                key={action.title}
                className={classNames(
                  actionIdx === 0
                    ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
                    : "",
                  actionIdx === 1 ? "sm:rounded-tr-lg" : "",
                  actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
                  actionIdx === actions.length - 1
                    ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
                    : "",
                  "group relative bg-white dark:bg-gray-950 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500",
                )}
              >
                <div>
                  <span
                    className={classNames(
                      action.iconBackground,
                      action.iconForeground,
                      "inline-flex rounded-lg p-3 ring-4 ring-white",
                    )}
                  >
                    <action.icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    <Link href={action.href} className="focus:outline-none">
                      {/* Extend touch target to entire panel */}
                      <span aria-hidden="true" className="absolute inset-0" />
                      {action.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-white">
                    {action.text}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                  >
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
          <TagCloud articles={articles} />

          <FAQs text="Frequently Asked Questions" faqs={faqs}></FAQs>
        </div>
      </div>
    </>
  );
}
