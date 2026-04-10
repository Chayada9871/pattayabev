"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { authClient } from "@/lib/auth-client";
import { type AppRole } from "@/lib/auth-utils";
import {
  brandLinks,
  liqueurOtherLinks,
  liqueurTypeLinks,
  otherProductLinks,
  productLinks,
  recommendedLinks,
  whiskyRegionLinks,
  whiskyTypeLinks
} from "@/lib/catalog-menu";

type SessionUserWithRole = {
  role?: AppRole | null;
};

export function SiteHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { itemCount, isReady } = useCart();
  const user = session?.user as (typeof session extends null ? never : NonNullable<typeof session>["user"] & SessionUserWithRole) | undefined;

  const handleLogout = async () => {
    const { error } = await authClient.signOut();

    if (!error) {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-white">
      <div className="border-t-2 border-[#4c3537] bg-black text-[11px] uppercase tracking-[0.06em] text-white">
        <div className="mx-auto flex min-h-[34px] max-w-[1220px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:py-0">
          <div className="flex flex-wrap items-center gap-3 font-semibold sm:gap-4">
            <span className="inline-grid h-5 w-5 place-items-center rounded-full border border-white text-[10px]">f</span>
            <span className="inline-grid h-5 w-5 place-items-center rounded-full border border-white text-[10px]">ig</span>
            <span className="inline-grid h-5 w-5 place-items-center rounded-full border border-white text-[8px]">LINE</span>
            <span className="text-[10px]">02-096-6496</span>
            <span className="break-all text-[10px] underline underline-offset-2 sm:break-normal">contact@pattayabev.com</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold sm:gap-6">
            <span>PattayaBev</span>
            <span>About</span>
            <span>Help</span>
            <span className="inline-grid h-4 w-4 place-items-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#d81e34_0%,#d81e34_45%,#ffffff_45%,#ffffff_55%,#1b4ab5_55%,#1b4ab5_100%)]" />
          </div>
        </div>
      </div>

      <div className="border-b border-[#e8e8e8]">
        <div className="mx-auto flex max-w-[1220px] flex-col items-stretch gap-5 px-4 py-4 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center justify-center gap-3 self-center lg:self-auto">
            <span className="relative h-[58px] w-[76px] shrink-0 overflow-hidden sm:h-[72px] sm:w-[94px]">
              <Image src="/images/branding/logo-white.png" alt="PattayaBev logo" fill className="object-contain" sizes="94px" />
            </span>
            <div className="grid gap-1 text-center lg:text-left">
              <span className="text-[16px] font-extrabold uppercase tracking-[0.08em] text-[#202020] sm:text-[19px]">PATTAYABEV</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e8e8e] sm:text-[11px] sm:tracking-[0.22em]">Wine, Spirits & Business Supply</span>
            </div>
          </Link>

          <form className="flex w-full items-center overflow-hidden rounded-full border border-[#d4d4d4] bg-[#fcfcfc] shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:max-w-[470px] sm:self-center">
            <input
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[10px] uppercase tracking-[0.08em] text-[#2d2d2d] placeholder:text-[#b1b1b1] sm:px-6 sm:text-[11px]"
              placeholder="Search entire store here..."
            />
            <button type="submit" className="mr-2 inline-grid h-9 w-9 place-items-center rounded-full border border-black text-sm text-black transition hover:bg-black hover:text-white">
              ⌕
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 text-sm text-[#111] sm:gap-8 lg:justify-end">
            {user ? (
              <>
                <Link href="/account" className="font-medium">
                  Account
                </Link>
                <button onClick={handleLogout} className="font-medium" type="button">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login?next=%2Faccount" className="font-medium">
                Account
              </Link>
            )}
            <Link href="/login" aria-label="Wishlist" className="text-2xl leading-none">
              ♡
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative text-2xl leading-none">
              🛒
              {isReady && itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-grid min-h-5 min-w-5 place-items-center rounded-full bg-[#2437e8] px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      <nav className="border-b border-[#e8e8e8]">
        <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-[13px] font-medium text-black sm:justify-start sm:gap-7 sm:text-[14px]">
          <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/">
            หน้าแรก
          </Link>

          <div className="group relative">
            <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/products">
              สินค้า
            </Link>
            <div className="invisible absolute left-0 top-full z-20 mt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="flex min-w-[180px] rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                <div className="grid min-w-[160px] gap-2">
                  <div className="group/whisky relative">
                    <Link className="block rounded-xl bg-[#f3f6ff] px-3 py-2 text-[13px] font-medium text-[#2437e8]" href="/whisky">
                      วิสกี้
                    </Link>
                    <div className="invisible absolute left-full top-0 z-30 ml-3 opacity-0 transition-all duration-200 group-hover/whisky:visible group-hover/whisky:opacity-100">
                      <div className="grid w-[370px] grid-cols-2 gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                        <div className="grid gap-1 border-r border-[#ececec] pr-4">
                          {whiskyTypeLinks.map((link) => (
                            <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                        <div className="grid gap-1 pl-1">
                          {whiskyRegionLinks.map((link) => (
                            <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group/liqueur relative">
                    <Link className="block rounded-xl px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href="/liqueur">
                      ลิเคียวร์
                    </Link>
                    <div className="invisible absolute left-full top-0 z-30 ml-3 opacity-0 transition-all duration-200 group-hover/liqueur:visible group-hover/liqueur:opacity-100">
                      <div className="grid w-[240px] gap-1 rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                        {[...liqueurTypeLinks, ...liqueurOtherLinks].map((link) => (
                          <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="group/other-products relative">
                    <Link className="block rounded-xl px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href="/other-products">
                      สินค้าอื่นๆ
                    </Link>
                    <div className="invisible absolute left-full top-0 z-30 ml-3 opacity-0 transition-all duration-200 group-hover/other-products:visible group-hover/other-products:opacity-100">
                      <div className="grid w-[220px] gap-1 rounded-2xl border border-[#e5e5e5] bg-white p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                        {otherProductLinks.map((link) => (
                          <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {productLinks
                    .filter((link) => link.label !== "สินค้าอื่นๆ")
                    .map((link) => (
                      <Link key={link.label} className="rounded-xl px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                        {link.label}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/promotions">
            โปรโมชั่น
          </Link>
          <div className="group relative">
            <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/recommended">
              สินค้าแนะนำ
            </Link>
            <div className="invisible absolute left-0 top-full z-20 mt-3 w-60 rounded-xl border border-[#e5e5e5] bg-white p-3 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid gap-2">
                {recommendedLinks.map((link) => (
                  <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="group relative">
            <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/brands">
              แบรนด์
            </Link>
            <div className="invisible absolute left-0 top-full z-20 mt-3 w-52 rounded-xl border border-[#e5e5e5] bg-white p-3 opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid gap-2">
                {brandLinks.map((link) => (
                  <Link key={link.label} className="rounded-lg px-3 py-2 text-[13px] text-[#333] transition hover:bg-[#f6f8ff] hover:text-[#2437e8]" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link className="whitespace-nowrap rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/b2b">
            สำหรับธุรกิจ (B2B)
          </Link>
          <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/articles">
            บทความ
          </Link>
          <Link
            className="rounded-full px-1 py-1 transition hover:text-[#2437e8]"
            href={user ? "/account/orders" : "/login?next=%2Faccount%2Forders"}
          >
            คำสั่งซื้อ
          </Link>
          <Link className="rounded-full px-1 py-1 transition hover:text-[#2437e8]" href="/cart">
            ตะกร้า{isReady && itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </div>
      </nav>
    </header>
  );
}

