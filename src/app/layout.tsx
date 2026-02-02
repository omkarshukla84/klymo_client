import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnonChat | Private 1-to-1 Chat",
  description: "Anonymous, ephemeral, and safe chat platform.",
};

import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen selection:bg-blue-500/30`}>
        <UserProvider>
          <main>
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
