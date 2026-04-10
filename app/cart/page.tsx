import { CartPageClient } from "@/components/cart/cart-page-client";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-8">
        <CartPageClient />
      </main>

      <SiteFooter />
    </div>
  );
}
