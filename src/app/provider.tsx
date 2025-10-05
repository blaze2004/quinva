"use client";
import { ThemeProvider } from "next-themes";
import { Next13ProgressBar } from "next13-progressbar";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      attribute={"class"}
    >
      {children}
      <Toaster richColors closeButton position="top-right" />
      <Next13ProgressBar color="var(--primary)" />
    </ThemeProvider>
  );
}
