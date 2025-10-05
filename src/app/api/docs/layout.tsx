import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quinva",
  description: "Smarter expenses, fairer living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
