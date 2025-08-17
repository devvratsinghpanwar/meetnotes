// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/theme-provider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner"; // Import the Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetNotes AI",
  description: "AI-powered meeting notes summarizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
            <Toaster /> {/* Add the Toaster component here */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}