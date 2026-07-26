"use client";
import { Shirt } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";

export function ShirtSearchApp(props: { shirts: Shirt[] }) {
  const filters = [
    {
      id: "color",
      name: "Color",
      options: [
        { value: "White", label: "White" },
        { value: "Blue", label: "Blue" },
        { value: "Brown", label: "Brown" },
        { value: "Green", label: "Green" },
        { value: "Red", label: "Red" },
        { value: "Claret", label: "Claret" },
        { value: "Yellow", label: "Yellow" },
        { value: "Black", label: "Black" },
        { value: "Purple", label: "Purple" },
      ],
    },
    {
      id: "type",
      name: "Shirt Type",
      options: [
        { value: "Home", label: "Home" },
        { value: "Away", label: "Away" },
        { value: "Third", label: "Third" },
        { value: "Goalkeeper", label: "Goalkeeper" },
        { value: "Goalkeeper Away", label: "Goalkeeper Away" },
        { value: "Training", label: "Training" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      id: "decade",
      name: "Decade",
      options: [
        { value: "1960s", label: "1960s" },
        { value: "1970s", label: "1970s" },
        { value: "1980s", label: "1980s" },
        { value: "1990s", label: "1990s" },
        { value: "2000s", label: "2000s" },
        { value: "2010s", label: "2010s" },
        { value: "2020s", label: "2020s" },
      ],
    },
  ];

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState(props.shirts);
  const onSubmit = async (formData: FormData) => {
    const filteredProducts = props.shirts.filter((shirt) => {
      const submittedColours = formData.getAll("color[]") as string[];
      const submittedTypes = formData.getAll("type[]") as string[];
      const submittedDecades = formData.getAll("decade[]") as string[];
      const matchesColor =
        submittedColours.length === 0 || submittedColours.includes(shirt.color);
      const matchesType =
        submittedTypes.length === 0 || submittedTypes.includes(shirt.use);
      const matchesDecade =
        submittedDecades.length === 0 ||
        submittedDecades.includes(shirt.decade);
      return matchesColor && matchesType && matchesDecade;
    });
    setProducts(filteredProducts);
    setMobileFiltersOpen(false);
  };

  const resetProducts = () => setProducts(props.shirts);

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <div>
        {/* Mobile filter dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-sm transform flex-col overflow-y-auto bg-[#fffdf8] pb-6 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex items-center justify-between bg-[#071a2b] px-5 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    Kit archive
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                    Filter shirts
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="relative flex size-10 items-center justify-center border border-white/20 p-2 text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Filters */}
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit(new FormData(e.currentTarget));
                }}
              >
                <div className="mb-6 mt-6 px-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    Apply filters
                  </button>
                </div>
                {filters.map((section) => (
                  <Disclosure
                    key={section.name}
                    as="div"
                    className="border-t border-[#071a2b]/15 pb-4 pt-4"
                  >
                    <fieldset>
                      <legend className="w-full px-2">
                        <DisclosureButton className="group flex w-full items-center justify-between p-2 text-[#071a2b]/50 hover:text-[#071a2b]">
                          <span className="text-sm font-semibold text-[#071a2b]">
                            {section.name}
                          </span>
                          <span className="ml-6 flex h-7 items-center">
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-5 rotate-0 transform group-data-[open]:-rotate-180"
                            />
                          </span>
                        </DisclosureButton>
                      </legend>
                      <DisclosurePanel className="px-4 pb-2 pt-4">
                        <div className="space-y-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex gap-3">
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    id={`${section.id}-${optionIdx}-mobile`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none border border-[#071a2b]/30 bg-[#f4f0e8] checked:border-blue-700 checked:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-[:checked]:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`${section.id}-${optionIdx}-mobile`}
                                className="text-sm text-[#071a2b]/65"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </DisclosurePanel>
                    </fieldset>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
          <div className="border-b border-[#071a2b]/20 pb-12">
            <p className="section-kicker">Kit archive</p>
            <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.045em] text-[#071a2b] sm:text-6xl">
              Historic Tranmere Shirts
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#071a2b]/60">
              Explore Tranmere Rovers shirts through the decades. These
              AI-generated archive studies are approximations rather than
              photographs, so some badge details may vary.
            </p>
          </div>

          <div className="pt-10 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside className="lg:sticky lg:top-6 lg:self-start lg:pr-8">
              <h2 className="sr-only">Filters</h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex w-full items-center justify-center border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 lg:hidden"
              >
                <span className="text-sm font-bold text-[#071a2b]">
                  Filters
                </span>
                <PlusIcon
                  aria-hidden="true"
                  className="ml-1 size-5 shrink-0 text-blue-700"
                />
              </button>

              <div className="hidden border border-[#071a2b]/15 bg-[#fffdf8] p-5 lg:block">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Refine archive
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  Filter shirts
                </h2>
                <form
                  className="mt-5 divide-y divide-[#071a2b]/15"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(new FormData(e.currentTarget));
                  }}
                >
                  <div className="grid grid-cols-2 gap-2 pb-6">
                    <button
                      type="submit"
                      className="w-full bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      Apply
                    </button>
                    <button
                      type="reset"
                      onClick={resetProducts}
                      className="w-full border border-[#071a2b]/20 px-4 py-3 text-sm font-bold transition hover:bg-[#e8e2d6]"
                    >
                      Reset
                    </button>
                  </div>
                  {filters.map((section) => (
                    <div
                      key={section.name}
                      className="py-7 first:pt-6 last:pb-0"
                    >
                      <fieldset>
                        <legend className="block text-xs font-bold uppercase tracking-[0.16em] text-[#071a2b]">
                          {section.name}
                        </legend>
                        <div className="space-y-3 pt-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex gap-3">
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    id={`${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none border border-[#071a2b]/30 bg-[#f4f0e8] checked:border-blue-700 checked:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-[:checked]:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`${section.id}-${optionIdx}`}
                                className="text-sm text-[#071a2b]/65"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </form>
              </div>
            </aside>

            {/* Product grid */}
            <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
              <div>
                <div className="mb-7 flex items-center justify-between border-b border-[#071a2b]/15 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    The collection
                  </h2>
                  <p className="font-mono text-xs text-[#071a2b]/45">
                    {products.length} shirts
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, idx) => (
                    <Link
                      key={idx}
                      href={`/shirts/${product.slug}`}
                      className="group border border-[#071a2b]/15 bg-[#fffdf8] p-3 transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(7,26,43,0.08)]"
                    >
                      <div className="relative overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]">
                        <Image
                          height={1024}
                          width={1568}
                          loading={idx === 0 ? "eager" : "lazy"}
                          alt={product.imagesCollection.items[0].description}
                          src={product.imagesCollection.items[0].url}
                          className="aspect-[4/5] w-full object-contain p-2 transition duration-300 group-hover:scale-[1.025]"
                        />
                        <span className="absolute left-3 top-3 bg-[#071a2b] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          {product.use}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-[#fffdf8] px-2 py-1 font-mono text-[10px] text-[#071a2b]/60">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="px-1 pb-1 pt-4">
                        <p className="font-mono text-xs text-blue-700">
                          {product.seasons.join(" · ")}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[#071a2b]">
                          {product.name}
                        </h3>
                        <div className="mt-4 flex items-center justify-between border-t border-[#071a2b]/10 pt-3 text-xs text-[#071a2b]/50">
                          <span>{product.decade}</span>
                          <span className="font-semibold text-[#071a2b]/70">
                            {product.color}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="border border-[#071a2b]/15 bg-[#fffdf8] px-6 py-14 text-center">
                    <p className="font-display text-2xl font-semibold">
                      No shirts match those filters
                    </p>
                    <button
                      type="button"
                      onClick={resetProducts}
                      className="mt-5 bg-blue-700 px-5 py-3 text-sm font-bold text-white"
                    >
                      Reset collection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
