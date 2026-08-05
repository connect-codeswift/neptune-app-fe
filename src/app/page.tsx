"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/axios";
import { safeAppNavigate } from "@/lib/safe-app-navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    safeAppNavigate(router, getAccessToken() ? "/dashboard" : "/login", {
      replace: true,
    });
  }, [router]);

  return null;
}
