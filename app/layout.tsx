import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Cartel Insider · Sponsor CRM",
  description: "CRM privado para sponsors de The Cartel Insider",
  icons: {
    icon: "/brand/tci-avatar.jpg",
    apple: "/brand/tci-avatar.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
