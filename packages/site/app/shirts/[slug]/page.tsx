import { ShirtApp } from "@/components/apps/Shirt";
import { SlugParams } from "@/lib/types";
import { getAllShirts } from "@/lib/api";
import { notFound } from "next/navigation";

export const revalidate = 7200;

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const shirts = await getAllShirts();

  const shirt = shirts.find((s) => s.slug === params.slug);
  return {
    title: shirt?.name,
    description: `A catalogue of the ${shirt?.name} shirt`,
  };
}
export default async function ShirtHome(props: { params: SlugParams }) {
  const shirts = await getAllShirts();
  const params = await props.params;
  const shirt = shirts.find((s) => s.slug === params.slug);

  if (!shirt) notFound();

  return <ShirtApp shirt={shirt} />;
}
