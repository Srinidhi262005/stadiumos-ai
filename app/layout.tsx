import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StadiumOS AI - The Intelligent Stadium Operating System",
  description: "AI-powered Stadium Operations & Decision Intelligence Platform designed for mega sporting events like the FIFA World Cup 2026.",
  keywords: ["Stadium Operations", "AI Decision Intelligence", "FIFA World Cup 2026", "Crowd Analytics", "Incident Dispatch"],
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="h-full bg-background text-foreground font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
