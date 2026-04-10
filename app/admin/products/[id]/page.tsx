import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProductAction } from "@/app/admin/actions";
import {
  AdminShell,
  adminPrimaryActionClass,
  adminSecondaryActionClass
} from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireRole } from "@/lib/auth";
import { getEditableProductById, getProductFormOptions } from "@/lib/products";

export default async function AdminProductEditPage({
  params
}: {
  params: { id: string };
}) {
  await requireRole("admin");

  const [options, product] = await Promise.all([
    getProductFormOptions(),
    getEditableProductById(params.id)
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      currentPath="/admin"
      eyebrow="PattayaBev Admin"
      title={product.name}
      description="แก้ไขข้อมูลสินค้า อัปโหลดรูปเพิ่ม และอัปเดตรายละเอียดหน้าสินค้าได้จากหน้านี้"
      actions={
        <>
          <Link className={adminSecondaryActionClass} href="/admin">
            กลับหน้าจัดการสินค้า
          </Link>
          <Link className={adminPrimaryActionClass} href={`/products/${product.slug}`}>
            ดูหน้าสินค้าจริง
          </Link>
        </>
      }
    >
      <ProductForm options={options} mode="edit" product={product} action={updateProductAction} />
    </AdminShell>
  );
}
