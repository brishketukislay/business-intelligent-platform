import type { Metadata } from "next";
import "../../src/app/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "BI Finance Modelling Platform",
  description:
    "Configurable Business Intelligence Modelling Platform",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
      </body>
    </html>
  );
}
