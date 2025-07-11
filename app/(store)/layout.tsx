// React & Naxt.js
import { ReactNode } from "react";
// Components
import StoreHeader from "@/components/store/layout/header/header";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Footer from "@/components/store/layout/footer/footer";

export default function StoreLayout({children}: {children: ReactNode}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <StoreHeader />
        <CategoriesHeader />
      </header>
      <main className="flex-1">{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
