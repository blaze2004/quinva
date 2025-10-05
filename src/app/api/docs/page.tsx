"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RedocStandalone } from "redoc";

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setTheme("light");
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section>
      <RedocStandalone specUrl="/openapi.json" />
    </section>
  );
}
