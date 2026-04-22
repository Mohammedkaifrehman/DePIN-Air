import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DePIN-Air | Decentralized Air Quality Network",
  description:
    "Real-time air quality data from 100 sensors, permanently recorded on Polygon blockchain. No government. No trust required.",
  keywords: ["DePIN", "air quality", "blockchain", "Polygon", "ESG", "IoT", "sensors"],
};

import { WalletProvider } from "@/context/WalletContext";
import { WebSocketProvider } from "@/context/WebSocketContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary overflow-x-hidden rounded-md" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
        <WalletProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
