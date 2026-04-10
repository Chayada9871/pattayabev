import { CheckoutPageClient } from "@/components/cart/checkout-page-client";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getAccountAddressData } from "@/lib/addresses";
import { getServerSession } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await getServerSession();
  const addressData = session ? await getAccountAddressData(String(session.user.id)) : null;

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1380px] px-4 pb-16 pt-8">
        <CheckoutPageClient
          savedAddresses={addressData?.savedAddresses ?? []}
          defaultShippingAddress={addressData?.defaultShippingAddress ?? null}
          billingDetails={addressData?.billingDetails ?? null}
          customerEmail={session?.user.email ?? ""}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
