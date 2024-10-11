import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import { ThemeSelector } from "@/components/layout/ThemeSelector";
import SearchBar from "@/components/search/SearchBar";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useUser } from "@auth0/nextjs-auth0/client";

const navigation = [
  { name: "Results", href: "/results", current: false },
  { name: "Seasons", href: "/season/2024", current: false },
  { name: "Players", href: "/playersearch", current: false },
  { name: "Gallery", href: "/page/tag/Gallery", current: false },
  { name: "Blogs & Articles", href: "/blog", current: false },
];

const mobilenavigation = [
  { name: "Home", href: "/", current: false },
  { name: "Results", href: "/results", current: false },
  { name: "Seasons", href: "/season/2024", current: false },
  { name: "Players", href: "/playersearch", current: false },
  { name: "Transfers", href: "/transfer-central", current: false },
  { name: "AI Chat Bot", href: "/chat", current: false },
  { name: "Blogs & Articles", href: "/blog", current: false },
  { name: "Avatar Builder", href: "/player-builder", current: false },
  { name: "Contact Us", href: "/contact", current: false },
  { name: "About the Site", href: "/page/blog/about", current: false },
];

export function Navbar() {
  const { user } = useUser();

  return (
    <>
      <Disclosure as="nav" className="bg-blue-900 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center px-2 lg:px-0">
              <div className="flex-shrink-0">
                <a href="/">
                  <img
                    src="/assets/images/logo_white_transparent.png"
                    alt="Tranmere-Web Logo"
                    className="hidden h-12 w-auto fill-slate-700 lg:block dark:fill-sky-100"
                  />
                </a>
              </div>
              <div className="hidden lg:ml-6 lg:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-white  hover:bg-rose-950 hover:text-white"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-1 justify-center lg:ml-6 lg:justify-end">
              <SearchBar></SearchBar>
            </div>
            <div className="flex lg:hidden">
              {/* Mobile menu button */}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-50 hover:bg-rose-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block h-6 w-6 group-data-[open]:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden h-6 w-6 group-data-[open]:block"
                />
              </DisclosureButton>
            </div>
            <div className="hidden lg:ml-4 lg:block">
              <div className="flex items-center">
                <ThemeSelector className="relative z-10 px-2" />

                {user ? (
                  <Menu as="div" className="relative ml-4 flex-shrink-0">
                    <div>
                      <MenuButton className="relative flex rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          src={user.picture!}
                          alt={user.name!}
                          className=" rounded-full h-6 w-6 mx-1 fill-slate-50 group-hover:fill-slate-500 dark:group-hover:fill-slate-300"
                        />
                      </MenuButton>
                    </div>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                      <MenuItem>
                        <a
                          href="/api/auth/logout"
                          aria-label="logout"
                          className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                        >
                          Sign out
                        </a>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                ) : (
                  <a href="/api/auth/login" aria-label="login">
                    <ChatBubbleBottomCenterIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <DisclosurePanel className="lg:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {mobilenavigation.map((item, idx) => (
              <DisclosureButton
                as="a"
                key={idx}
                href={item.href}
                className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
          {user ? (
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    src={user.picture!}
                    alt={user.name!}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <DisclosureButton
                    as="a"
                    aria-label="logout"
                    href="/api/auth/logout"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-50 hover:bg-gray-700 hover:text-white"
                  >
                    Sign out
                  </DisclosureButton>
                </div>
                <div className="ml-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0 text-gray-50">
                      Change Theme:
                    </div>
                    <div className="flex-shrink-0">
                      <ThemeSelector className="relative z-10 px-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <DisclosureButton
                    as="a"
                    href="/api/auth/login"
                    aria-label="login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-50 hover:bg-gray-700 hover:text-white"
                  >
                    Sign In
                  </DisclosureButton>
                </div>
                <div className="ml-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0 text-gray-50">
                      Change Theme:
                    </div>
                    <div className="flex-shrink-0">
                      <ThemeSelector className="relative z-10 px-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
