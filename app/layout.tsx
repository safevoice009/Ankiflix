import type { Metadata } from "next";
import { Inter, Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ankiflix — Discover Premium Anki Decks",
  description: "A premium, Netflix-inspired discovery platform for educational Anki decks. Search, rank, and discuss the best decks for your exam preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebas.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground font-sans selection:bg-primary selection:text-white flex flex-col overflow-x-hidden">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
