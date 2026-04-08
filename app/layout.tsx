import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: "Billiards Master Sequencer",
  description: "16-step drum sequencer with a billiards theme. Build beats with pool-ball steps—real billiards samples by Jess Chase.",
  icons: "/Magic_8_Ball_FavIcon.png",
  openGraph: {
    title: "Billiards Master Sequencer",
    description: "16-step drum sequencer with real billiards samples. KICK · SNARE · HI-HAT · CLAP · CRASH.",
    type: "website",
    images: [
      {
        url: "/Billards_Social_Preview.png",
        width: 1200,
        height: 630,
        alt: "Billiards Master Sequencer — 16-step drum sequencer with real billiards samples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billiards Master Sequencer",
    description: "16-step drum sequencer with real billiards samples.",
    images: ["/Billards_Social_Preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#38761d] flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1 w-full flex justify-center overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
