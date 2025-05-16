import type { Metadata } from "next";
import { ThemeProvider } from 'next-themes'
import { Inter, Barlow } from "next/font/google";
import "./globals.css";

// Fonts
const interFont = Inter({subsets: ["latin"]});
const barlowFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-barlow",
})

// Metadata
export const metadata: Metadata = {
  title: "GoShop",
  description: "Welcome to GoShop, ultimate destination for seamless online shopping!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        </ThemeProvider>
      </body>
    </html>
  );
}
