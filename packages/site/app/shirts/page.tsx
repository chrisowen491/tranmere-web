import { Metadata } from "next";
import { ShirtSearchApp } from "@/components/apps/ShirtSearch";
import { getAllShirts } from "@/lib/api";
export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Shirt Search",
  description: "A catalogue of all historic Tranmere Rovers shirts",
};

export default async function ShirtHome() {

    //const shirts = await getShirts();
    const shirts = await getAllShirts();
    shirts.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

  return (
    <ShirtSearchApp shirts={shirts}></ShirtSearchApp>
  );
}
