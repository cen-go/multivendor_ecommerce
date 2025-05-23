import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
// Clerk imports
import { ClerkProvider } from "@clerk/nextjs";
// Fonts
import { Inter, Barlow } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

// Fonts
const interFont = Inter({ subsets: ["latin"] });
const barlowFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-barlow",
});

// Metadata
export const metadata: Metadata = {
  title: "GoShop",
  description:
    "Welcome to GoShop, ultimate destination for seamless online shopping!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${interFont.className} ${barlowFont.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
