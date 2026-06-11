"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Text } from "@/components/Text";
import { getAccessToken } from "@/lib/axios";

export default function DashboardAllPagesPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="bg-ehs-light-bg flex min-h-screen">
      <Sidebar />

      <main className="flex min-h-screen flex-1 flex-col p-8">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          <div>
            <Text as="h1" className="text-ehs-darker text-2xl font-bold tracking-tight">
              Dashboard
            </Text>
            <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
              Welcome back, Sarah. Select a module from the sidebar to get started.
            </Text>
          </div>

          <div className="border-ehs-border bg-ehs-light-text grid gap-4 rounded-2xl border p-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Open incidents", value: "12" },
              { label: "Near misses", value: "19" },
              { label: "Active hazards", value: "44" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-ehs-border rounded-xl border bg-ehs-light-bg px-4 py-5"
              >
                <Text as="p" className="text-ehs-muted-text text-sm">
                  {stat.label}
                </Text>
                <Text as="p" className="text-ehs-darker mt-2 text-3xl font-bold tabular-nums">
                  {stat.value}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
