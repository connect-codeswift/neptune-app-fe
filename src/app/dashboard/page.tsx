"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/axios";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="bg-ehs-light-bg flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-ehs-darker text-2xl font-bold">Neptune workspace</h1>
        <p className="text-ehs-muted-text mt-2 text-sm">
          You are signed in. Dashboard modules coming soon.
        </p>
      </div>
    </main>
  );
}
