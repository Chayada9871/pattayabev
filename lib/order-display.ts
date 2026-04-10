export type OrderDisplayTone = "success" | "warning" | "error";

export function getPaymentMethodLabel(method: string) {
  if (method === "promptpay") return "พร้อมเพย์ QR";
  if (method === "card") return "บัตรเครดิต / เดบิต";
  if (method === "cod") return "เก็บเงินปลายทาง";
  return method || "-";
}

export function getPaymentStatusLabel(status: string) {
  if (status === "paid") return "ชำระเงินสำเร็จ";
  if (status === "pending") return "รอยืนยันการชำระเงิน";
  if (status === "failed") return "ชำระเงินไม่สำเร็จ";
  if (status === "expired") return "ลิงก์ชำระเงินหมดอายุ";
  if (status === "refunded") return "คืนเงินแล้ว";
  return "รอชำระเงิน";
}

export function getOrderStatusLabel(orderStatus: string, paymentStatus: string) {
  if (paymentStatus === "paid") return "ชำระเงินแล้ว";
  if (paymentStatus === "pending") return "รอยืนยันการชำระเงิน";
  if (paymentStatus === "failed") return "ชำระเงินไม่สำเร็จ";
  if (paymentStatus === "expired") return "ลิงก์ชำระเงินหมดอายุ";
  if (orderStatus === "processing") return "กำลังเตรียมสินค้า";
  if (orderStatus === "shipped") return "กำลังจัดส่ง";
  if (orderStatus === "completed") return "จัดส่งสำเร็จ";
  if (orderStatus === "cancelled") return "ยกเลิกแล้ว";
  return "รอชำระเงิน";
}

export function canRetryPayment(paymentMethod: string, paymentStatus: string) {
  return paymentMethod !== "cod" && ["unpaid", "failed", "expired"].includes(paymentStatus);
}

export function formatOrderDate(date: string) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function getOrderStatusHeadline({
  orderStatus,
  paymentStatus,
  paymentMethod
}: {
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
}): {
  title: string;
  description: string;
  tone: OrderDisplayTone;
} {
  if (paymentStatus === "paid") {
    return {
      title: "ชำระเงินสำเร็จ",
      description: "ระบบยืนยันการชำระเงินแล้ว ทีมงานจะเริ่มเตรียมสินค้าและจัดส่งตามรอบที่เลือกไว้",
      tone: "success"
    };
  }

  if (paymentStatus === "pending") {
    return {
      title: "รอยืนยันการชำระเงิน",
      description: "ระบบได้รับข้อมูลการชำระแล้ว และกำลังรอผลยืนยันจากผู้ให้บริการชำระเงิน",
      tone: "warning"
    };
  }

  if (paymentMethod === "cod" && orderStatus === "processing") {
    return {
      title: "ยืนยันคำสั่งซื้อแล้ว",
      description: "คำสั่งซื้อนี้จะชำระเงินกับพนักงานเมื่อรับสินค้า กรุณาเตรียมยอดชำระให้พร้อม",
      tone: "success"
    };
  }

  if (paymentStatus === "failed") {
    return {
      title: "ชำระเงินไม่สำเร็จ",
      description: "ยังไม่สามารถยืนยันการชำระเงินได้ คุณสามารถกลับไปเริ่มชำระเงินใหม่อีกครั้ง",
      tone: "error"
    };
  }

  if (paymentStatus === "expired") {
    return {
      title: "ลิงก์ชำระเงินหมดอายุ",
      description: "รายการชำระเงินเดิมหมดอายุแล้ว กรุณาสร้างลิงก์ชำระเงินใหม่เพื่อดำเนินการต่อ",
      tone: "warning"
    };
  }

  return {
    title: "รอชำระเงิน",
    description: "คำสั่งซื้อถูกสร้างเรียบร้อยแล้ว กรุณาชำระเงินเพื่อให้ระบบเริ่มดำเนินการจัดเตรียมสินค้า",
    tone: "warning"
  };
}
