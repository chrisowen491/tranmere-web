import { Metadata } from "next";
import { ShirtSearchApp } from "@/components/apps/ShirtSearch";
import { getShirts } from "@/lib/api";
export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Shirt Search",
  description: "A catalogue of all historic Tranmere Rovers shirts",
};

export default async function ShirtHome() {

    const shirts = await getShirts();

  return (
    <ShirtSearchApp shirts={shirts}></ShirtSearchApp>
  );
}
