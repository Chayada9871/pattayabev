import { PaymentStatusPageClient } from "@/components/cart/payment-status-page-client";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function PaymentSuccessPage({
  searchParams
}: {
  searchParams: { order?: string };
}) {
  const orderNumber = typeof searchParams.order === "string" ? searchParams.order : "";

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1380px] px-4 pb-16 pt-8">
        <PaymentStatusPageClient orderNumber={orderNumber} mode="success" />
      </main>
      <SiteFooter />
    </div>
  );
}

