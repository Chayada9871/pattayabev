export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#ececec] bg-[#fbfbfb] py-10">
      <div className="mx-auto grid max-w-[1220px] gap-8 px-4 md:grid-cols-4">
        <div className="grid gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#171717]">PATTAYABEV</h3>
          <p className="mb-2 text-sm leading-6 text-[#666]">
            PattayaBev นำเสนอไวน์ สุรา และโซลูชันด้านเครื่องดื่มที่คัดสรรมาอย่างดี พร้อมบริการที่เชื่อถือได้และการสั่งซื้อที่สะดวก
          </p>
          <a className="text-xs uppercase text-[#5f5f5f]" href="/catalog">
            ดูแบรนด์ทั้งหมด
          </a>
          <a className="text-xs uppercase text-[#5f5f5f]" href="/register">
            ติดต่อเรา
          </a>
        </div>
        <div className="grid gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em]">บริการลูกค้า</h3>
          <a className="text-xs uppercase text-[#5f5f5f]" href="/login">
            บัญชีของฉัน
          </a>
          <a className="text-xs uppercase text-[#5f5f5f]" href="/login">
            ศูนย์ช่วยเหลือ
          </a>
          <a className="text-xs uppercase text-[#5f5f5f]" href="/catalog">
            นโยบายการคืนสินค้า
          </a>
        </div>
        <div className="grid gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em]">ติดต่อ</h3>
          <p className="text-xs uppercase text-[#5f5f5f]">โทร: 081-123-456</p>
          <p className="text-xs uppercase text-[#5f5f5f]">วันจันทร์ - วันศุกร์</p>
          <p className="text-xs uppercase text-[#5f5f5f]">โซเชียล: FB / IG / LINE</p>
          <p className="text-xs uppercase text-[#5f5f5f]">อีเมล: contact@wine-now.com</p>
        </div>
        <div className="grid gap-3">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em]">รับข่าวสาร</h3>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input className="min-h-[38px] flex-1 border border-[#dbdbdb] bg-white px-3 text-xs uppercase tracking-[0.08em]" placeholder="กรอกอีเมลของคุณ" />
            <button className="min-w-[104px] bg-[#a61b1f] px-4 text-xs font-bold uppercase text-white">สมัครรับ</button>
          </form>
          <p className="text-xs leading-6 text-[#7a7a7a]">
            รับข่าวสารโปรโมชัน ไฮไลต์สินค้า และอัปเดตราคาส่งสำหรับธุรกิจของคุณ
          </p>
        </div>
      </div>
    </footer>
  );
}
