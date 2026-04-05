"use client";

import { MonitorCog, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  if (!resolvedTheme) {
    return (
      <Button
        aria-label="Theme laden"
        size="icon-sm"
        variant="outline"
        type="button"
      >
        <MonitorCog className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label="Theme wechseln"
      className="border-border/70 bg-background/70 backdrop-blur"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon-sm"
      type="button"
      variant="outline"
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </Button>
  );
}
