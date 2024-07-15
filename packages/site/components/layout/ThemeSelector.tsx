import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";

const themes = [
  { name: "Home", value: "light", icon: LightIcon },
  { name: "Away", value: "dark", icon: DarkIcon },
];

function LightIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 -7.72 127.24603 127.24603" {...props}>
      <path
        fill="#ffffff"
        d="m32 109c-1.4 0-2.5-1.1-2.5-2.5v-62.6l-7 5.9c-.1.1-.2.1-.2.2-1 .6-2.1 1-3.2 1-2 0-3.8-1-4.9-2.6l-10.7-16.1c-1.8-2.7-1-6.3 1.7-8.1l29.7-20.7c.2-.1.4-.3.7-.3.1 0 2.8-.9 6.6-1h3.1c.7 0 1.4.3 1.8.8.5.5.7 1.2.6 1.9 0 .1 0 .3-.1.4.2 7.5 8.1 14.5 16.5 14.5s16.3-7 16.5-14.5c0-.1 0-.3-.1-.4-.1-.7.2-1.4.6-1.9s1.1-.8 1.8-.8h6.1c2.4 0 4.3 1.1 4.5 1.2.1 0 .1.1.2.1l28.7 20.7c2.6 1.7 3.4 5.4 1.6 8.1l-10.7 15.2c-1 1.6-2.9 2.6-4.9 2.6-1.2 0-2.3-.3-3.2-1-.1 0-.1-.1-0.2-.2l-6.4-5.3-.2 62.9c0 1.4-1.1 2.5-2.5 2.5h-63.9z"
      />
      <path d="m89.1 5c1.8 0 3.1.9 3.1.9l28.7 20.6c1.6 1 2 3.1.9 4.7l-10.7 15.1c-0.6 1-1.7 1.5-2.8 1.5-.6 0-1.3-.2-1.9-.6l-10.5-8.6-.2 68.2h-63.7v-68l-11.2 9.4c-.6.4-1.2.6-1.9.6-1.1 0-2.2-.5-2.8-1.5l-10.6-16.1c-1-1.6-.6-3.6.9-4.7l29.7-20.7s2.4-.8 5.8-.9h3.1v.2.2c0 9 9.1 17.3 19 17.3s19-8.3 19-17.3v-.2-.2h5.9.2c-.1.1 0 .1 0 .1m0-5s-.1 0 0 0h-.2-5.9c-1.4 0-2.7.6-3.7 1.6-.9 1-1.4 2.4-1.3 3.8v.4c-.3 6.1-7.1 11.9-14 11.9s-13.7-5.8-14-11.9v-.4c.1-1.4-.3-2.8-1.3-3.8-.9-1-2.3-1.6-3.7-1.6h-3.1-.1c-4 .1-6.9 1-7.3 1.1-.5.2-.9.4-1.3.7l-29.5 20.6c-3.8 2.6-4.8 7.7-2.3 11.6l10.7 16.1c1.6 2.3 4.2 3.7 7 3.7 1.6 0 3.2-.5 4.6-1.4.2-.1.3-.2.5-.3l2.9-2.5v57.2c0 2.8 2.2 5 5 5h63.8c2.8 0 5-2.2 5-5l.1-57.7 2.3 1.9c.1.1.3.2.4.3 1.4.9 3 1.4 4.6 1.4 2.8 0 5.4-1.4 6.9-3.7l10.6-15 .1-.1c2.5-3.8 1.5-9-2.3-11.5l-28-20.9c-.1-.1-.2-.1-.3-.2-.3-.2-2.6-1.5-5.6-1.5z" />
    </svg>
  );
}

function DarkIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 -7.72 127.24603 127.24603" {...props}>
      <path
        fill="#800020	"
        d="m32 109c-1.4 0-2.5-1.1-2.5-2.5v-62.6l-7 5.9c-.1.1-.2.1-.2.2-1 .6-2.1 1-3.2 1-2 0-3.8-1-4.9-2.6l-10.7-16.1c-1.8-2.7-1-6.3 1.7-8.1l29.7-20.7c.2-.1.4-.3.7-.3.1 0 2.8-.9 6.6-1h3.1c.7 0 1.4.3 1.8.8.5.5.7 1.2.6 1.9 0 .1 0 .3-.1.4.2 7.5 8.1 14.5 16.5 14.5s16.3-7 16.5-14.5c0-.1 0-.3-.1-.4-.1-.7.2-1.4.6-1.9s1.1-.8 1.8-.8h6.1c2.4 0 4.3 1.1 4.5 1.2.1 0 .1.1.2.1l28.7 20.7c2.6 1.7 3.4 5.4 1.6 8.1l-10.7 15.2c-1 1.6-2.9 2.6-4.9 2.6-1.2 0-2.3-.3-3.2-1-.1 0-.1-.1-0.2-.2l-6.4-5.3-.2 62.9c0 1.4-1.1 2.5-2.5 2.5h-63.9z"
      />
      <path d="m89.1 5c1.8 0 3.1.9 3.1.9l28.7 20.6c1.6 1 2 3.1.9 4.7l-10.7 15.1c-0.6 1-1.7 1.5-2.8 1.5-.6 0-1.3-.2-1.9-.6l-10.5-8.6-.2 68.2h-63.7v-68l-11.2 9.4c-.6.4-1.2.6-1.9.6-1.1 0-2.2-.5-2.8-1.5l-10.6-16.1c-1-1.6-.6-3.6.9-4.7l29.7-20.7s2.4-.8 5.8-.9h3.1v.2.2c0 9 9.1 17.3 19 17.3s19-8.3 19-17.3v-.2-.2h5.9.2c-.1.1 0 .1 0 .1m0-5s-.1 0 0 0h-.2-5.9c-1.4 0-2.7.6-3.7 1.6-.9 1-1.4 2.4-1.3 3.8v.4c-.3 6.1-7.1 11.9-14 11.9s-13.7-5.8-14-11.9v-.4c.1-1.4-.3-2.8-1.3-3.8-.9-1-2.3-1.6-3.7-1.6h-3.1-.1c-4 .1-6.9 1-7.3 1.1-.5.2-.9.4-1.3.7l-29.5 20.6c-3.8 2.6-4.8 7.7-2.3 11.6l10.7 16.1c1.6 2.3 4.2 3.7 7 3.7 1.6 0 3.2-.5 4.6-1.4.2-.1.3-.2.5-.3l2.9-2.5v57.2c0 2.8 2.2 5 5 5h63.8c2.8 0 5-2.2 5-5l.1-57.7 2.3 1.9c.1.1.3.2.4.3 1.4.9 3 1.4 4.6 1.4 2.8 0 5.4-1.4 6.9-3.7l10.6-15 .1-.1c2.5-3.8 1.5-9-2.3-11.5l-28-20.9c-.1-.1-.2-.1-.3-.2-.3-.2-2.6-1.5-5.6-1.5z" />
    </svg>
  );
}

export function ThemeSelector(
  props: React.ComponentPropsWithoutRef<typeof Listbox<"div">>,
) {
  let { theme, setTheme } = useTheme();
  let [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-6 w-6" />;
  }

  return (
    <Listbox as="div" value={theme} onChange={setTheme} {...props}>
      <Label className="sr-only">Theme</Label>
      <ListboxButton
        className="flex h-6 w-6 items-center justify-center rounded-lg shadow-md shadow-black/5 ring-1 ring-black/5 dark:ring-inset dark:ring-white/5"
        aria-label="Theme"
      >
        <LightIcon
          className={clsx(
            "h-6 w-6 dark:hidden",
            theme === "system" ? "fill-slate-400" : "fill-blue-400",
          )}
        />
        <DarkIcon
          className={clsx(
            "hidden h-6 w-6 dark:block",
            theme === "system" ? "fill-slate-400" : "fill-sky-400",
          )}
        />
      </ListboxButton>
      <ListboxOptions className="absolute left-1/2 top-full mt-3 w-36 -translate-x-1/2 space-y-1 rounded-xl bg-white p-3 text-sm font-medium shadow-md shadow-black/5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/5">
        {themes.map((theme) => (
          <ListboxOption
            key={theme.value}
            value={theme.value}
            className={({ focus, selected }) =>
              clsx(
                "flex cursor-pointer select-none items-center rounded-[0.625rem] p-1",
                {
                  "text-sky-500": selected,
                  "text-slate-900 dark:text-white": focus && !selected,
                  "text-slate-700 dark:text-slate-400": !focus && !selected,
                  "bg-slate-100 dark:bg-slate-900/40": focus,
                },
              )
            }
          >
            {({ selected }) => (
              <>
                <div className="rounded-md bg-white p-1 shadow ring-1 ring-slate-900/5 dark:bg-slate-700 dark:ring-inset dark:ring-white/5">
                  <theme.icon
                    className={clsx(
                      "h-4 w-4",
                      selected
                        ? "fill-sky-400 dark:fill-sky-400"
                        : "fill-slate-400",
                    )}
                  />
                </div>
                <div className="ml-3">{theme.name}</div>
              </>
            )}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
