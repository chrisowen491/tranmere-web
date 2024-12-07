"use client";

import { Navbar } from "@/components/layout/Navbar";
import Footer from "./Footer";
import DataDog from "./DataDog";

function Header() {
  return <Navbar></Navbar>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col">
      <Header />
      <DataDog />
      {children}
      <Footer></Footer>
    </div>
  );
}
