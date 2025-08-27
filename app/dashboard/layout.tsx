import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export default function DashboardLayout({children}: {children: ReactNode}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div>{children}</div>
    </ThemeProvider>
  );
}