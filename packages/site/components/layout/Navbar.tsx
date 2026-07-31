"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";

const navigation = [
  { name: "Results", href: "/results" },
  { name: "Seasons", href: "/seasons" },
  { name: "Players", href: "/playersearch" },
  { name: "Fantasy XI", href: "/fantasy-team" },
  { name: "Shirts", href: "/shirts" },
  { name: "Stories", href: "/blog" },
];

export function Navbar() {
  return (
    <Disclosure
      as="nav"
      className="relative z-50 border-b border-white/15 bg-[#071a2b] text-white"
    >
      <div className="mx-auto flex h-[74px] max-w-7xl items-center px-6 sm:px-10 lg:px-12">
        <Link href="/" className="mr-auto flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-white/30 text-xs font-black tracking-tight">
            TW
          </span>
          <span className="font-display text-xl font-semibold tracking-[-0.03em]">
            Tranmere-Web
          </span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          <SearchBar className="ml-3 w-56" />
        </div>
        <DisclosureButton className="group ml-4 grid h-10 w-10 place-items-center border border-white/20 lg:hidden">
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-5 w-5 group-data-[open]:hidden" />
          <XMarkIcon className="hidden h-5 w-5 group-data-[open]:block" />
        </DisclosureButton>
      </div>
      <DisclosurePanel className="border-t border-white/15 px-6 py-5 lg:hidden">
        <div className="grid gap-1">
          {navigation.map((item) => (
            <DisclosureButton
              as={Link}
              key={item.name}
              href={item.href}
              className="border-b border-white/10 py-3 text-base font-semibold text-white/80"
            >
              {item.name}
            </DisclosureButton>
          ))}
          <SearchBar className="mt-4" />
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
