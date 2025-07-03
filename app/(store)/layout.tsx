// React & Naxt.js
import { ReactNode } from "react";
// Components
import StoreHeader from "@/components/store/layout/header/header";

export default function StoreLayout({children}: {children: ReactNode}) {
  return (
    <div>
      <StoreHeader />
      <main>{children}</main>
      <div>Footer</div>
    </div>
  );
}
