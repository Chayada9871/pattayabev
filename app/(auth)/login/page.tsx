"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import {
  getDashboardRoute,
  isEmailNotVerifiedError,
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as
    | (typeof session extends null
        ? never
        : NonNullable<typeof session>["user"] & SessionUserWithRole)
    | undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const nextPath = searchParams.get("next");
  const registerHref = nextPath
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : "/register";

  useEffect(() => {
    if (!isPending && user) {
      router.replace(getSafeNextPath(nextPath, getDashboardRoute(user.role)));
    }
  }, [isPending, nextPath, router, user]);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setMessage({
        type: "success",
        text: "ยืนยันอีเมลเรียบร้อยแล้ว สามารถเข้าสู่ระบบได้เลย"
      });
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage({
        type: "error",
        text: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน"
      });
      return;
    }

    const destination = getSafeNextPath(
      nextPath,
      getDashboardRoute(user?.role)
    );

    setLoading(true);
    setMessage({ type: "success", text: "กำลังเข้าสู่ระบบ..." });

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
      callbackURL: destination
    });

    if (error) {
      setLoading(false);

      if (isEmailNotVerifiedError(error)) {
        setPendingVerificationEmail(email.trim());
      }

      setMessage({ type: "error", text: normalizeAuthError(error) });
      return;
    }

    const currentSession = await authClient.getSession();
    const role = (currentSession.data?.user as SessionUserWithRole | undefined)
      ?.role;

    router.replace(getSafeNextPath(nextPath, getDashboardRoute(role)));
    router.refresh();
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) {
      setMessage({ type: "error", text: "กรุณากรอกอีเมลก่อน" });
      return;
    }

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
      setMessage({ type: "error", text: normalizeAuthError(error) });
      return;
    }

    setMessage({ type: "success", text: "ส่งอีเมลยืนยันให้อีกครั้งแล้ว" });
  };

  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      subtitle={
        <>
          ยังไม่มีบัญชีใช่ไหม{" "}
          <Link
            className="font-extrabold underline underline-offset-4"
            href={registerHref}
          >
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <div className="mx-auto mt-8 w-full max-w-2xl">
        <form className="grid w-full gap-5" onSubmit={handleSubmit}>
          <label className="block text-left text-sm font-bold uppercase tracking-[0.08em] text-ink">
            <span className="mb-2 block">
              อีเมล <span className="text-wine">*</span>
            </span>
            <input
              className="block w-full min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink outline-none placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              type="email"
              value={email}
            />
          </label>

          <label className="block text-left text-sm font-bold uppercase tracking-[0.08em] text-ink">
            <span className="mb-2 block">
              รหัสผ่าน <span className="text-wine">*</span>
            </span>
            <input
              className="block w-full min-h-14 rounded-2xl border border-[#d7cec1] bg-[#fffdf9] px-4 text-base text-ink outline-none placeholder:text-[#8d8d8d] focus:border-gold focus:ring-4 focus:ring-[#b8924724]"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              type="password"
              value={password}
            />
          </label>

          <button
            className="block w-full min-h-[58px] rounded-2xl bg-[linear-gradient(135deg,#171212_0%,#302520_100%)] px-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_16px_28px_rgba(23,18,18,0.18)] disabled:cursor-wait disabled:opacity-70"
            disabled={loading}
            type="submit"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
            className="mt-4 inline-flex rounded-full border border-[#d8cec0] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink disabled:cursor-wait disabled:opacity-60"
            disabled={resending}
            onClick={handleResendVerification}
            type="button"
          >
            {resending ? "กำลังส่ง..." : "ส่งอีเมลยืนยันอีกครั้ง"}
          </button>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}