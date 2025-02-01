import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";
import type { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat Dashboard",
  description: "A dashboard for viewing chat history and improving the chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-base-100 text-base-content`}>
        <RootLayoutWrapper>
          {children}
        </RootLayoutWrapper>
      </body>
    </html>
  );
}
