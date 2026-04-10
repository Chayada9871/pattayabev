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
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    setPassword("");
    setConfirmPassword("");
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;

    setResending(true);

    const callbackURL = nextPath
      ? `/login?verified=1&next=${encodeURIComponent(nextPath)}`
      : "/login?verified=1";

    const { error } = await authClient.sendVerificationEmail({
      email: pendingVerificationEmail,
      callbackURL
    });

    setResending(false);

    if (error) {
      setMessage({
        type: "error",
        text: normalizeAuthError(error)
      });
      return;
    }

    setMessage({
      type: "success",
      text: "ส่งอีเมลยืนยันให้อีกครั้งแล้ว"
    });
  };

  return (
    <AuthShell
      title="สมัครสมาชิก"
      subtitle={
        <>
          มีบัญชีอยู่แล้วใช่ไหม{" "}
          <Link
            className="font-extrabold underline underline-offset-4"
            href={loginHref}
          >
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <div className="my-6 h-px bg-[#dcdcdc]" />

      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-left text-sm font-bold uppercase tracking-[0.08em]">
          ชื่อ <span className="text-wine">*</span>
          <input
            className="min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="กรอกชื่อ"
            value={firstName}
          />
        </label>

        <label className="grid gap-2 text-left text-sm font-bold uppercase tracking-[0.08em]">
          นามสกุล <span className="text-wine">*</span>
          <input
            className="min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
            onChange={(event) => setLastName(event.target.value)}
            placeholder="กรอกนามสกุล"
            value={lastName}
          />
        </label>

        <label className="grid gap-2 text-left text-sm font-bold uppercase tracking-[0.08em] sm:col-span-2">
          อีเมล <span className="text-wine">*</span>
          <input
            className="min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2 text-left text-sm font-bold uppercase tracking-[0.08em]">
          รหัสผ่าน <span className="text-wine">*</span>
          <input
            className="min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="ตั้งรหัสผ่าน"
            type="password"
            value={password}
          />
          <span className="text-xs font-medium normal-case tracking-normal text-[#6b645d]">
            ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษรเพื่อความปลอดภัย
          </span>
        </label>

        <label className="grid gap-2 text-left text-sm font-bold uppercase tracking-[0.08em]">
          ยืนยันรหัสผ่าน <span className="text-wine">*</span>
          <input
            className="min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            type="password"
            value={confirmPassword}
          />
        </label>

        <button
          className="min-h-[58px] rounded-2xl bg-[linear-gradient(135deg,#171212_0%,#302520_100%)] text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_16px_28px_rgba(23,18,18,0.18)] disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
          disabled={loading}
          type="submit"
        >
          {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
        </button>
      </form>

      <p
        className={`mt-4 min-h-6 text-left text-sm font-semibold ${
          message?.type === "error" ? "text-[#ef473a]" : "text-[#1a7f37]"
        }`}
      >
        {message?.text}
      </p>

      {pendingVerificationEmail ? (
        <button
          className="mt-4 rounded-full border border-[#d8cec0] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink disabled:cursor-wait disabled:opacity-60"
          disabled={resending}
          onClick={handleResendVerification}
          type="button"
        >
          {resending ? "กำลังส่ง..." : "ส่งอีเมลยืนยันอีกครั้ง"}
        </button>
      ) : null}
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}