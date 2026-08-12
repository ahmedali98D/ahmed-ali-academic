import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ahmed Ali — Philosopher, Author, and Educator",
  description:
    "Academic portfolio of Ahmed Ali: BA Philosophy (Alexandria University), PGDE (Al-Azhar University), Research Assistant at Emory University, author of \"Depth of Knowledge\" (2026), Member of the British Philosophical Association, bilingual Arabic/English philosopher working across Western and Islamic intellectual traditions.",
  keywords: [
    "Ahmed Ali",
    "Ahmed Ali philosopher",
    "Ahmed Ali philosophy",
    "Ahmed Ali academic",
    "Ahmed Ali author",
    "Ahmed Ali educator",
    "Ahmed Ali BA Philosophy",
    "Ahmed Ali Alexandria University",
    "Ahmed Ali Al-Azhar University",
    "Ahmed Ali Emory University",
    "Ahmed Ali Depth of Knowledge",
    "Ahmed Ali Norman Webb DOK",
    "Ahmed Ali Islamic philosophy",
    "Ahmed Ali Ibn Khaldun",
    "Ahmed Ali Al-Hasan al-Basri",
    "Ahmed Ali BPA",
    "Ahmed Ali British Philosophical Association",
    "Ahmed Ali Echoes of Wisdom",
    "Ahmed Ali bilingual philosophy",
    "Ahmed Ali Arabic English philosophy",
    "philosopher",
    "philosophy instructor",
    "philosophy professor",
    "Islamic philosophy",
    "philosophy of education",
    "epistemology",
    "ethics",
    "logic",
    "philosophy of religion",
    "political philosophy",
    "philosophy of mind",
    "metaphysics",
    "philosophy of language",
    "Model United Nations",
    "MUN faculty head",
    "MANORMUN V 2026",
    "UAE educator",
    "ADEK approved teacher",
    "UAE MoE licensed teacher",
    "IELTS Band 7",
    "bilingual scholar",
    "academic portfolio",
    "scholarly portfolio",
  ],
  authors: [{ name: "Ahmed Ali" }],
  creator: "Ahmed Ali",
  publisher: "Ahmed Ali",
  icons: {
    icon: "/phronesis-logo.png",
  },
  openGraph: {
    title: "Ahmed Ali — Philosopher, Author, and Educator",
    description:
      "Academic portfolio: BA Philosophy, PGDE, Emory research, author of \"Depth of Knowledge\" (2026), BPA member, bilingual Arabic/English scholar.",
    url: "https://ahmed-ali-academic.vercel.app",
    siteName: "Ahmed Ali — Academic Portfolio",
    type: "profile",
    locale: "en_US",
    images: [
      {
        url: "/profile.jpg",
        width: 400,
        height: 400,
        alt: "Ahmed Ali — Philosopher and Educator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Ali — Philosopher, Author, and Educator",
    description:
      "Academic portfolio: BA Philosophy, PGDE, Emory research, author of \"Depth of Knowledge\" (2026), BPA member.",
    images: ["/profile.jpg"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
