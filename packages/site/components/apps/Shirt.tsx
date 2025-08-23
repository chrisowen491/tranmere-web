"use client";
import { CurrencyDollarIcon, GlobeAmericasIcon } from '@heroicons/react/24/outline'
import { Breadcrumb, BreadcrumbLinks } from '../fragments/BreadcrumbLinks';
import { Shirt } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';

export function ShirtApp(props: {
    shirt: Shirt
}) {

    const product = props.shirt;

  const breadcrumbs : Breadcrumb[] = [
    { id: 1, name: "Home", href: "/" },
    {
        id: 2,
        href: "/shirts/",
        name: 'Shirts'
    },

  ];
 const Text = ({ children }: any) => (
    <p className="align-center">{children}</p>
  );

    const options = {
      renderNode: {
        [BLOCKS.PARAGRAPH]: (node: any, children: any) => <Text>{children}</Text>,
      },
      renderText: (text: string) => text.replace("!", "?"),
    };

const policies = [
  { name: 'Images', icon: GlobeAmericasIcon, description: 'Generated With Chat GPT' },
  { name: 'Prices', icon: CurrencyDollarIcon, description: "Prices Are Listed As Sold On Launch" },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

  return (

      <div className="pb-16 pt-6 sm:pb-24">
        <BreadcrumbLinks
            breadcrumbs={breadcrumbs}
            currentpage={product.name}
            currenthref={`/shirts/${product.slug}`}
         /> 
        <div className="mx-auto mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="flex justify-between">
                <h1 className="text-xl font-medium text-gray-900">{product.name}</h1>
                <p className="text-xl font-medium text-gray-900">{product.price}</p>
              </div>
              {/* Reviews */}
             
            </div>

            {/* Image gallery */}
            <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
              <h2 className="sr-only">Images</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                {product.imagesCollection.items.map((image, idx) => (
                  <Image
                    key={idx}
                    alt={image.description}
                    src={image.url}
                    height={1024}
                    width={1568}
                    className={classNames(
                      idx === 0 ? 'lg:col-span-2 lg:row-span-2' : 'hidden lg:block',
                      'rounded-lg',
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 lg:col-span-5">

                 <div className="grid grid-cols-2 grid-rows-2 gap-4">
                    {product.imagesCollection.items.map((image, idx) => (
                    <Image
                        key={idx}
                        alt={image.description}
                        src={image.url}
                        height={1024}
                        width={1568}
                        className={classNames(
                        idx === 0 ? 'hidden' : 'lg:hidden h-48 w-96 object-contain col-span-1 row-span-1',
                        'rounded-lg',
                        )}
                    />
                    ))}
                </div>
                <div className="mt-10">
                    <h2 className="text-sm font-medium text-gray-900">Description</h2>

                    <div
                    className="mt-4 space-y-4 text-sm/6 text-gray-500"
                    >
                      {product.description ? (
                        documentToReactComponents(product.description.json, options)
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                    <h2 className="text-sm font-medium text-gray-900">Usage</h2>
                    <div className="mt-4">
                        {product.use}
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                    <h2 className="text-sm font-medium text-gray-900">Colour</h2>
                    <div className="mt-4">
                        {product.color}
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                    <h2 className="text-sm font-medium text-gray-900">Seasons In Use</h2>

                    <div className="mt-4">
                        <ul role="list" className="list-disc space-y-1 pl-5 text-sm/6 text-gray-500 marker:text-gray-300">
                            {product.seasons.map((season) => (
                            <li key={season} className="pl-2">
                                 <Link href={`/season/${season}`}>{season}</Link>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>



              {/* Product details */}


              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900">Variants</h2>

                <div className="mt-4">
                  <ul role="list" className="list-disc space-y-1 pl-5 text-sm/6 text-gray-500 marker:text-gray-300">
                    {product.variants ? (
                         product.variants.map((item) => (
                          <li key={item} className="pl-2">
                            {item}
                          </li>
                        ))
                      ) : (
                        <p>None known.</p>
                      )}
                   
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900">Manufacturer</h2>

                <div className="mt-4">
                  {product.manufacturer}
                </div>
              </div>


              {/* Policies */}
              <section aria-labelledby="policies-heading" className="mt-10">
                <h2 id="policies-heading" className="sr-only">
                  Our Policies
                </h2>

                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {policies.map((policy) => (
                    <div key={policy.name} className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                      <dt>
                        <policy.icon aria-hidden="true" className="mx-auto size-6 shrink-0 text-gray-400" />
                        <span className="mt-4 text-sm font-medium text-gray-900">{policy.name}</span>
                      </dt>
                      <dd className="mt-1 text-sm text-gray-500">{policy.description}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      </div>

  );
}
