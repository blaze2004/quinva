"use client";

import { useEffect, useState } from "react";
import { RedocStandalone } from "redoc";

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
