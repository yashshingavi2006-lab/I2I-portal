import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/page-transition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "I2I — Ignited Innovators of India | Bhau Institute, COEP",
  description:
    "Registration and project portal for I2I, the social entrepreneurship movement of the Bhau Institute of Innovation, Entrepreneurship & Leadership, COEP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <div className="grain-overlay" />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
