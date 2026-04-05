"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster
          closeButton
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "surface-panel border border-border text-foreground",
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
