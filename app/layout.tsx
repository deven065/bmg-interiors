import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BMG Interiors | Luxury Interior Design Studio — Mumbai",
  description: "Award-winning luxury interior design studio crafting extraordinary spaces since 2014. Specializing in residential, commercial, and turnkey projects across India.",
  keywords: ["interior design Mumbai", "luxury interior design", "residential designers India", "commercial interiors", "turnkey interior solutions", "BMG Interiors"],
  openGraph: {
    title: "BMG Interiors | Luxury Interior Design Studio",
    description: "Crafting extraordinary spaces since 2014. Residential, commercial, and turnkey projects.",
    url: "https://bmginteriors.com",
    siteName: "BMG Interiors",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BMG Interiors Portfolio",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BMG Interiors | Luxury Interior Design Studio",
    description: "Award-winning luxury interior design studio crafting extraordinary spaces since 2014.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
