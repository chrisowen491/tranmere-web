"use client";
import { Shirt } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import { SubmitButton } from '../forms/SubmitButton';


export function ShirtSearchApp(props: {
    shirts: Shirt[]
}) {

    const filters = [
  {
    id: 'color',
    name: 'Color',
    options: [
      { value: 'White', label: 'White' },
      { value: 'Blue', label: 'Blue' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Green', label: 'Green' },
      { value: 'Red', label: 'Red' },
      { value: 'Claret', label: 'Claret' },
      { value: 'Yellow', label: 'Yellow' },
    ],
  },
  {
    id: 'type',
    name: 'Shirt Type',
    options: [
      { value: 'Home', label: 'Home' },
      { value: 'Away', label: 'Away' },
      { value: 'Third', label: 'Third' },
      { value: 'Goalkeeper', label: 'Goalkeeper' },
      { value: 'GoalkeeperAway', label: 'Goalkeeper Away' },
      { value: 'Training', label: 'Training' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    id: 'decade',
    name: 'Decade',
    options: [
      { value: '1980s', label: "1980s" },
      { value: '1990s', label: "1990s" },
      { value: '2000s', label: "2000s" },
      { value: '2010s', label: "2010s" },
      { value: '2020s', label: "2020s" },
    ],
  },
]

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [products, setProducts] = useState(props.shirts);
    //const [colours, setColours] = useState<string[]>(filters[0].options.map(option => option.value));
    //const [types, setTypes] = useState<string[]>(filters[1].options.map(option => option.value));
    //const [decades, setDecades] = useState<string[]>(filters[2].options.map(option => option.value));

  const onSubmit = async (formData: FormData) => {
    console.log('Submitting form data:');
    //setColours(formData.getAll('color[]') as string[]);
    //setTypes(formData.getAll('type[]') as string[]);
    //setDecades(formData.getAll('decade[]') as string[]);

    const filteredProducts = props.shirts.filter(shirt => {
      const submittedColours = (formData.getAll('color[]') as string[]);
      const submittedTypes = (formData.getAll('type[]') as string[]);
      const submittedDecades = (formData.getAll('decade[]') as string[]);
      const matchesColor = submittedColours.length === 0 || submittedColours.includes(shirt.color);
      const matchesType =  submittedTypes.length === 0 || submittedTypes.includes(shirt.use);
      const matchesDecade =  submittedDecades.length === 0 || submittedDecades.includes(shirt.decade);
      return matchesColor && matchesType && matchesDecade;
    });
    setProducts(filteredProducts);
  };

  return (
<div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pb-6 pt-4 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4"  onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(new FormData(e.currentTarget));
                      }}>
                     <div className="mt-6 mb-6 pl-4">
                        <SubmitButton text={"Filter"}></SubmitButton>
                    </div>
                {filters.map((section) => (
                  <Disclosure key={section.name} as="div" className="border-t border-gray-200 pb-4 pt-4">
                    <fieldset>
                      <legend className="w-full px-2">
                        <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                          <span className="text-sm font-medium text-gray-900">{section.name}</span>
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
                                    className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
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
                              <label htmlFor={`${section.id}-${optionIdx}-mobile`} className="text-sm text-gray-500">
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

        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="border-b border-gray-200 pb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Historic Tranmere Shirts</h1>
            <p className="mt-4 text-base text-gray-500">
              Checkout out a collection of historic Tranmere Rovers shirts.
            </p>
          </div>

          <div className="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside>
              <h2 className="sr-only">Filters</h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center lg:hidden"
              >
                <span className="text-sm font-medium text-gray-700">Filters</span>
                <PlusIcon aria-hidden="true" className="ml-1 size-5 shrink-0 text-gray-400" />
              </button>

              <div className="hidden lg:block">
                <form className="divide-y divide-gray-200" onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(new FormData(e.currentTarget));
                      }}>
                    <div className="mt-6 mb-6">
                        <SubmitButton text={"Filter"}></SubmitButton>
                    </div>
                  {filters.map((section) => (
                    <div key={section.name} className="py-10 first:pt-0 last:pb-0">
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-900">{section.name}</legend>
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
                                    className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
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
                              <label htmlFor={`${section.id}-${optionIdx}`} className="text-sm text-gray-600">
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
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                    <h2 className="sr-only">Products</h2>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {products.map((product, idx) => (
                        <Link key={idx} href={`/shirts/${product.slug}`} className="group">
                            <Image
                                height={1024}
                                width={1568}   
                                loading="lazy"
                                alt={product.imagesCollection.items[0].description}
                                src={product.imagesCollection.items[0].url}
                                className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-[7/8]"
                            />
                            <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                            <p className="mt-1 text-lg font-medium text-gray-900">{product.seasons[0]}</p>
                        </Link>
                    ))}
                    </div>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
  );
}
