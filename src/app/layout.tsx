import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { QuestionsWidget } from "@/components/QuestionsWidget";
import { MOTION_INIT_SCRIPT } from "@/lib/motion";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";
import "./globals.css";

// Family names must match MWDS typography/font definitions (asserted in tests/tokens.test.ts).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves every relative canonical / Open Graph URL against the one production origin (src/lib/site.ts).
  // No canonical is set here: a layout canonical would be inherited by pages that forget their own.
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_NAME,
  description:
    "A Chicago running club that finds elevation in a very flat city.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The Science and FAQ set `scroll-behavior: smooth` for their section links; without this, Next
      // would glide from the previous page's scroll position on arrival. Next turns smooth off only
      // for the route change itself, so in-page anchors still glide.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // data-motion is set by the inline script below before first paint.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-background focus:px-(--space-md) focus:py-(--space-xs) focus:text-p-sm focus:font-medium focus:ring-3 focus:ring-ring"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <QuestionsWidget />
      </body>
    </html>
  );
}
