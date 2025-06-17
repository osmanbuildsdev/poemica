import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { FetchInterceptor } from "@/components/FetchInterceptor";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poemica - Şiirlerin Buluşma Noktası",
  description: "Şiir severler ve şairler için modern platform. Şiirlerini paylaş, keşfet ve ilham dolu bir topluluğun parçası ol.",
  icons: {
    icon: "/poemica-logo.png",
    shortcut: "/poemica-logo.png",
    apple: "/poemica-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <div className="min-h-screen bg-white">
        <SessionProviderWrapper>
          <FetchInterceptor>
            <Navbar />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
          </FetchInterceptor>
        </SessionProviderWrapper>
      </div>
      </body>
    </html>
  );
}
