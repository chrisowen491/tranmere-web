import {ShirtApp} from "@/components/apps/Shirt";
import { SlugParams } from "@/lib/types";
import { getShirts } from "@/lib/api";
export const revalidate = 7200;


export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const shirts = await getShirts();

  const shirt = shirts.find(s => s.id === params.slug);
  return {
    title: shirt?.name,
    description:  `A catalogue of the ${shirt?.name} shirt`,
  };
}
export default async function ShirtHome(props: { params: SlugParams }) {

  const shirts = await getShirts();
  const params = await props.params;
  const shirt = shirts.find(s => s.id === params.slug);

  return (
    <ShirtApp shirt={shirt!}></ShirtApp>
  );
}
