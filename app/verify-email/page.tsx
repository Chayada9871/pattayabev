"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { authClient } from "@/lib/auth-client";
import { normalizeAuthError, normalizeVerificationError } from "@/lib/auth-utils";

type VerificationState = "verifying" | "success" | "error" | "already-verified";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [state, setState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState("Checking your verification link...");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Verification link is invalid.");
      return;
    }

    let active = true;

    const verify = async () => {
      const { error } = await authClient.verifyEmail({
        query: {
          token
        }
      });

      if (!active) return;

      if (error) {
        const normalized = normalizeVerificationError(error);
        setState(normalized === "This email is already verified." ? "already-verified" : "error");
        setMessage(normalized);
        return;
      }

      setState("success");
      setMessage("Email verified successfully");
    };

    void verify();

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      setState("error");
      setMessage("Please go back to login and request a new verification email.");
      return;
    }

    setResending(true);

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/login?verified=1"
    });

    setResending(false);

    if (error) {
      setMessage(normalizeAuthError(error));
      return;
    }

    setMessage("Verification email sent again");
  };

  return (
    <AuthShell title="Verify Email" subtitle="Confirm your email address to activate your account">
      <div className="grid gap-6 text-left">
        <p
          className={`text-base font-semibold ${
            state === "success" || state === "already-verified"
              ? "text-[#1a7f37]"
              : state === "verifying"
                ? "text-[#8b6a2b]"
                : "text-[#ef473a]"
          }`}
        >
          {message}
        </p>

        {state === "success" || state === "already-verified" ? (
          <Link
            className="inline-flex w-fit rounded-full bg-[#171212] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
            href="/login?verified=1"
          >
            Go to login
          </Link>
        ) : null}

        {state === "error" && email ? (
          <button
            className="inline-flex w-fit rounded-full border border-[#d8cec0] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink disabled:cursor-wait disabled:opacity-60"
            disabled={resending}
            onClick={handleResend}
            type="button"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}