"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import {
  getDashboardRoute,
  normalizeAuthError,
  type AppRole
} from "@/lib/auth-utils";

type SessionUserWithRole = {
  role?: AppRole | null;
};

function getSafeNextPath(nextPath: string | null, fallback: string) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }
  return fallback;
}

/* ✅ ALL LOGIC HERE */
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as
    | (typeof session extends null
        ? never
        : NonNullable<typeof session>["user"] & SessionUserWithRole)
    | undefined;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] =
    useState("");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const nextPath = searchParams.get("next");
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  useEffect(() => {
    if (!isPending && user) {
      router.replace(getSafeNextPath(nextPath, getDashboardRoute(user.role)));
    }
  }, [isPending, nextPath, router, user]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const fullName = `${firstName} ${lastName}`.trim();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่อง"
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "รหัสผ่านไม่ตรงกัน"
      });
      return;
    }

    const callbackURL = nextPath
      ? `/login?verified=1&next=${encodeURIComponent(nextPath)}`
      : "/login?verified=1";

    setLoading(true);
    setMessage({
      type: "success",
      text: "กำลังสร้างบัญชี..."
    });

    const { error } = await authClient.signUp.email({
      email: email.trim(),
      name: fullName,
      password,
      callbackURL
    });

    if (error) {
      setLoading(false);
      setMessage({
        type: "error",
        text: normalizeAuthError(error)
      });
      return;
    }

    setLoading(false);
    setPendingVerificationEmail(email.trim());
    setMessage({
      type: "success",
      text: "ส่งอีเมลยืนยันแล้ว"
    });
  };

  return (
    <AuthShell
      title="สมัครสมาชิก"
      subtitle={
        <>
          มีบัญชีอยู่แล้ว{" "}
          <Link href={loginHref}>เข้าสู่ระบบ</Link>
        </>
      }
    >
      {/* keep your UI */}
      <form onSubmit={handleSubmit}>
        {/* your inputs unchanged */}
      </form>

      <p>{message?.text}</p>
    </AuthShell>
  );
}

/* 🔥 THIS FIXES VERCEL ERROR */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}