import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MindEase AI — Your Personal Mental Health & CBT Therapist",
  description:
    "An empathetic, production-grade AI mental wellness application featuring an AI CBT Therapist, daily mood tracker, sentiment-analyzing journal, and interactive meditation guides.",
  keywords: [
    "mental health AI",
    "AI therapist",
    "CBT chatbot",
    "mood tracker",
    "wellness reports",
    "mindfulness meditations",
  ],
  authors: [{ name: "MindEase AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
