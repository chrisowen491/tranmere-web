import { FAQs } from "@/components/fragments/FAQ";
import { Hero } from "@/components/fragments/Hero";
import { Navigation } from "@/components/layout/Navigation";
import { Metadata } from "next";
import {
  UserCircleIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/20/solid";

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

const features = [
  {
    name: "Comments & Reviews",
    description:
      "Leave a star rating for players, matches and articles - plus leave comments",
    icon: ChatBubbleBottomCenterIcon,
  },
  {
    name: "Player Avatars",
    description: "Create your own Tranmere Rovers avatar",
    href: "/player-builder",
    icon: UserCircleIcon,
  },
];

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

  const stats = [
    { id: 1, name: "Results Data", value: "5000+" },
    { id: 2, name: "Programme Scans", value: "2000+" },
    { id: 3, name: "Player Profiles", value: "500+" },
    { id: 4, name: "Match Reports", value: "20+" },
  ];

  return (
    <>
      <Hero />
      <div className="relative mx-auto flex w-full max-w-8xl flex-auto justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="hidden lg:relative lg:block lg:flex-none">
          <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
          <div className="absolute bottom-0 right-0 top-16 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
          <div className="absolute bottom-0 right-0 top-28 hidden w-px bg-slate-800 dark:block" />
          <div className="sticky top-[4.75rem] -ml-0.5 h-[calc(100vh-4.75rem)] w-64 overflow-y-auto overflow-x-hidden py-16 pl-0.5 pr-8 xl:w-72 xl:pr-16">
            <Navigation />
          </div>
        </div>

        <div className="w-full">
          <div className="pt-24">
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

          <FAQs text="Frequently Asked Questions" faqs={faqs}></FAQs>
        </div>
      </div>
    </>
  );
}
