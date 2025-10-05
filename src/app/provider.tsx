"use client";
import { Next13ProgressBar } from "next13-progressbar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

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
