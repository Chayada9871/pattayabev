import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export const metadata: Metadata = {
  title: "สำหรับธุรกิจ (B2B) | PattayaBev",
  description:
    "เครื่องดื่มคุณภาพสำหรับร้านอาหาร บาร์ โรงแรม และผู้ประกอบการในพัทยา พร้อมบริการจัดส่งและดูแลลูกค้าธุรกิจ"
};

const whyJoinItems = [
  "คัดสรรสินค้าคุณภาพจากแบรนด์ชั้นนำทั่วโลก",
  "มีสินค้าให้เลือกหลากหลาย ครบทุกประเภท",
  "จัดส่งรวดเร็วในพัทยาและพื้นที่ใกล้เคียง",
  "มีทีมแนะนำสินค้าและดูแลลูกค้าธุรกิจโดยตรง"
];

const audienceItems = ["ร้านอาหาร / บาร์ / คาเฟ่", "โรงแรม / รีสอร์ท", "งานอีเวนต์ / จัดเลี้ยง", "บริษัทและองค์กร"];

const serviceItems = [
  "ชุดของขวัญและสินค้าองค์กร",
  "เครื่องดื่มสำหรับงานอีเวนต์",
  "จัดหาสินค้าพิเศษตามต้องการ",
  "ให้คำแนะนำการจัดเมนูเครื่องดื่ม"
];

const orderConditionItems = [
  "ราคาสินค้ารวมภาษีมูลค่าเพิ่มแล้ว",
  "ไม่มีขั้นต่ำในการสั่งซื้อ",
  "รองรับการชำระเงินหลายช่องทาง",
  "พัทยา 1-2 วัน / ต่างจังหวัด 3-5 วัน"
];

const applySteps = [
  {
    step: "01",
    title: "กรอกแบบฟอร์มสมัคร",
    description: "แจ้งข้อมูลธุรกิจและช่องทางติดต่อให้ครบถ้วน"
  },
  {
    step: "02",
    title: "แนบเอกสารที่เกี่ยวข้อง",
    description: "แนบเอกสารบริษัทหรือเอกสารที่ใช้สำหรับสมัครบัญชีธุรกิจ"
  },
  {
    step: "03",
    title: "รอทีมงานติดต่อกลับ",
    description: "ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ"
  }
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-[20px] border border-[#e8ddd0] bg-[#faf6ef] px-4 py-4 text-[15px] leading-7 text-[#4f4943]"
        >
          <span className="mt-[3px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2437e8] text-[11px] font-extrabold text-white">
            +
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContentCard({
  label,
  title,
  description,
  children,
  accent = "gold",
  className = ""
}: {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  accent?: "gold" | "blue";
  className?: string;
}) {
  const labelClass = accent === "blue" ? "bg-[#2437e8] text-white" : "bg-[#f5efe5] text-[#8b6a2b]";

  return (
    <article
      className={`rounded-[28px] border border-[#e9dfd1] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-7 ${className}`}
    >
      <p className={`inline-flex px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${labelClass}`}>{label}</p>
      <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-[#171212] sm:text-[32px]">{title}</h2>
      <p className="mt-3 max-w-[56ch] text-[15px] leading-7 text-[#5f5852] sm:text-base">{description}</p>
      <div className="mt-6">{children}</div>
    </article>
  );
}

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      <main className="pb-14">
        <section className="px-4 pt-6">
          <div className="mx-auto max-w-[1220px]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
              <Link href="/" className="hover:text-[#2437e8]">
                หน้าแรก
              </Link>{" "}
              / สำหรับธุรกิจ (B2B)
            </p>

            <div className="mt-5 grid gap-[3px] lg:grid-cols-[1fr_1.05fr]">
              <article className="relative min-h-[320px] overflow-hidden rounded-l-[28px] rounded-r-[28px] bg-[#ececec] sm:min-h-[420px] lg:rounded-r-none">
                <Image
                  src="/images/categories/b2b.webp"
                  alt="บริการสำหรับธุรกิจของ PattayaBev"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,15,15,0.08),rgba(15,15,15,0.26))]" />
                <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
                  <div className="max-w-[280px]">
                    <p className="inline-flex bg-white/18 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                      PATTAYA B2B
                    </p>
                  </div>

                  <div className="max-w-[420px] rounded-[22px] border border-white/20 bg-white/12 p-4 text-white backdrop-blur-sm sm:p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f0d6a8]">Based in Pattaya</p>
                    <p className="mt-2 text-[14px] leading-7 text-white/90 sm:text-[15px]">
                      ดูแลร้านอาหาร บาร์ โรงแรม และธุรกิจบริการในพัทยา พร้อมจัดส่งรวดเร็วและบริการต่อเนื่อง
                    </p>
                  </div>
                </div>
              </article>

              <article className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-white sm:min-h-[420px] lg:rounded-l-none">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_58%,#f5f8ff_100%)]" />
                <div className="relative z-10 flex h-full flex-col justify-center px-5 py-7 sm:px-7 md:px-8 lg:px-10">
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8b6a2b]">BUSINESS SUPPLY</p>
                  <h1 className="mt-4 max-w-[600px] text-[34px] font-extrabold leading-[1.04] tracking-tight text-[#171212] sm:text-[44px] lg:text-[52px]">
                    เครื่องดื่มคุณภาพ
                    <br />
                    สำหรับธุรกิจของคุณ
                  </h1>
                  <p className="mt-5 max-w-[540px] text-[15px] leading-7 text-[#5f5852] sm:text-base sm:leading-8">
                    รวมสินค้าพรีเมียมจากทั่วโลก เหมาะสำหรับร้านอาหาร บาร์ โรงแรม และผู้ประกอบการ โดยมีทีมงานที่พร้อมดูแลธุรกิจในพัทยาอย่างใกล้ชิด
                  </p>

                  <div className="mt-7">
                    <Link
                      href="/account/b2b"
                      className="inline-flex items-center rounded-full bg-[#171212] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2b2424] sm:px-7 sm:py-3.5"
                    >
                      สมัครเข้าร่วม
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      { title: "พื้นที่ดูแล", value: "พัทยาและใกล้เคียง" },
                      { title: "หมวดสินค้า", value: "ครบทุกประเภท" },
                      { title: "การจัดส่ง", value: "รวดเร็วและปลอดภัย" }
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[20px] border border-[#e9dfd1] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)]"
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8b6a2b]">{item.title}</p>
                        <p className="mt-2 text-[15px] font-bold leading-6 text-[#171212]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pt-10 sm:pt-12">
          <div className="mx-auto grid max-w-[1220px] gap-4 lg:grid-cols-2 xl:grid-cols-12">
            <ContentCard
              label="WHY JOIN"
              title="ทำไมต้องเลือกเรา"
              description="บริการที่ออกแบบมาเพื่อให้ธุรกิจสั่งซื้อได้ง่ายขึ้น พร้อมทีมงานดูแลต่อเนื่อง"
              className="xl:col-span-6"
            >
              <BulletList items={whyJoinItems} />
            </ContentCard>

            <ContentCard
              label="WHO IS THIS FOR"
              title="เหมาะสำหรับ"
              description="รองรับทั้งธุรกิจอาหาร การบริการ งานอีเวนต์ และองค์กรที่ต้องการสินค้าคุณภาพ"
              accent="blue"
              className="xl:col-span-6"
            >
              <BulletList items={audienceItems} />
            </ContentCard>

            <ContentCard
              label="HOW TO APPLY"
              title="วิธีสมัคร"
              description="ขั้นตอนสั้น กระชับ และมีทีมงานช่วยดูแลต่อเนื่องเมื่อข้อมูลครบ"
              className="xl:col-span-6"
            >
              <div className="grid gap-4">
                {applySteps.map((item) => (
                  <div key={item.step} className="rounded-[22px] border border-[#e8ddd0] bg-[#faf6ef] px-4 py-4 sm:px-5">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2437e8] text-xs font-extrabold tracking-[0.14em] text-white">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="text-[17px] font-extrabold text-[#171212]">{item.title}</h3>
                        <p className="mt-2 text-[15px] leading-7 text-[#5f5852]">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            {false && (
            <ContentCard
              label="SPECIAL SERVICES"
              title="บริการสำหรับธุรกิจ"
              description="บริการเสริมที่ช่วยให้การจัดซื้อและการวางแผนเครื่องดื่มสะดวกขึ้น"
              className="xl:col-span-3"
            >
              <BulletList items={serviceItems} />
            </ContentCard>
            )}

            <ContentCard
              label="ORDER CONDITIONS"
              title="เงื่อนไขการสั่งซื้อ"
              description="ข้อมูลสำคัญเรื่องราคา การชำระเงิน และเวลาจัดส่งที่ควรรู้ก่อนเริ่มสั่งซื้อ"
              accent="blue"
              className="xl:col-span-6"
            >
              <BulletList items={orderConditionItems} />
            </ContentCard>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
