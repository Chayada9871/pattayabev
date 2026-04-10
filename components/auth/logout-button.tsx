"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function LogoutButton({
  className,
  redirectTo = "/login",
  children = "ออกจากระบบ"
}: {
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    const { error } = await authClient.signOut();

    setLoading(false);

    if (!error) {
      router.replace(redirectTo);
      router.refresh();
    }
  };

  return (
    <button className={className} disabled={loading} onClick={handleLogout} type="button">
      {loading ? "กำลังออกจากระบบ..." : children}
    </button>
  );
}
