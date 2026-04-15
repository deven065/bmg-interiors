import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bmginteriors.com'),
  title: "BMG Interiors | Luxury Interior Design Studio — Mumbai",
  description: "Award-winning luxury interior design studio crafting extraordinary spaces since 1988. Specializing in residential, commercial, and turnkey projects across India.",
  icons: {
    icon: "/M.png",
    apple: "/M.png",
    shortcut: "/M.png",
  },
  keywords: ["interior design Mumbai", "luxury interior design", "residential designers India", "commercial interiors", "turnkey interior solutions", "BMG Interiors"],
  openGraph: {
    title: "BMG Interiors | Luxury Interior Design Studio",
    description: "Crafting extraordinary spaces since 1988. Residential, commercial, and turnkey projects.",
    url: "https://bmginteriors.com",
    siteName: "BMG Interiors",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_CDN_URL ?? ""}/images/og-image.jpg`,
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
    description: "Award-winning luxury interior design studio crafting extraordinary spaces since 1988.",
    images: [`${process.env.NEXT_PUBLIC_CDN_URL ?? ""}/images/og-image.jpg`],
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
        className={`${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
