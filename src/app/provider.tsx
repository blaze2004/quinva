"use client";
import { Next13ProgressBar } from "next13-progressbar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function RootProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors closeButton position="top-right" />
      <Next13ProgressBar color="var(--primary)" />
    </>
  );
}
