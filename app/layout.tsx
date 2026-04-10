import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/components/cart/cart-provider";

export const metadata: Metadata = {
  title: "PattayaBev",
  description: "PattayaBev ร้านไวน์และสุราออนไลน์ พร้อมโซลูชันเครื่องดื่มสำหรับลูกค้าทั่วไปและธุรกิจในพัทยา"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
