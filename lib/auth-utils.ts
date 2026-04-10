export type AppRole = "admin" | "manager" | "user";

export const ROLE_ROUTES: Record<AppRole, string> = {
  admin: "/admin",
  manager: "/manager",
  user: "/account"
};

export function getDashboardRoute(role?: string | null) {
  if (role === "admin" || role === "manager" || role === "user") {
    return ROLE_ROUTES[role];
  }

  return ROLE_ROUTES.user;
}

export function normalizeAuthError(error: unknown) {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง";

  const code =
    error && typeof error === "object" && "code" in error ? String(error.code).toLowerCase() : "";

  const raw = message.toLowerCase();

  if (code.includes("user_already_exists") || raw.includes("already exists") || raw.includes("already registered")) {
    return "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }

  if (code.includes("invalid_email") || raw.includes("invalid email")) {
    return "กรุณากรอกอีเมลให้ถูกต้อง";
  }

  if (code.includes("invalid_password") || raw.includes("invalid password") || raw.includes("invalid email or password")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (code.includes("email_not_verified") || raw.includes("not verified")) {
    return "Please verify your email before logging in.";
  }

  if (raw.includes("password") && raw.includes("8")) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  if (raw.includes("rate")) {
    return "มีการพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
  }

  if (raw.includes("network")) {
    return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
  }

  return message;
}

export function isEmailNotVerifiedError(error: unknown) {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "";

  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";

  return code.toLowerCase().includes("email_not_verified") || message.toLowerCase().includes("not verified");
}

export function normalizeVerificationError(error: unknown) {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Unable to verify this email.";

  const raw = message.toLowerCase();

  if (raw.includes("expired")) {
    return "Verification link expired. Please request a new email.";
  }

  if (raw.includes("invalid")) {
    return "Verification link is invalid.";
  }

  if (raw.includes("already") || raw.includes("verified")) {
    return "This email is already verified.";
  }

  return message;
}
