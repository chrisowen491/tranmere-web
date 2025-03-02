"use client";

import { ThemeProvider } from "next-themes";
import { Auth0Provider } from "@auth0/nextjs-auth0";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </Auth0Provider>
  );
}
