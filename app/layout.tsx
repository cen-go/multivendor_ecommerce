import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
// Clerk imports
import { ClerkProvider } from "@clerk/nextjs";
// Modal provider
import ModalProvider from "@/lib/modal-provider";
// Fonts
import { Inter, Barlow, Geologica } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

// Fonts
const interFont = Inter({ subsets: ["latin"] });
const barlowFont = Barlow({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-barlow",
});
const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geologica",
});

// Metadata
export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
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
          className={`${interFont.className} ${barlowFont.variable} ${geologica.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider>{children}</ModalProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
