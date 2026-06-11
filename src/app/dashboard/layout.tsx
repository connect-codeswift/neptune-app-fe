"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getAccessToken } from "@/lib/axios";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="bg-ehs-light-bg ml-68 flex min-h-screen">
      <div className="bg-ehs-light-bg fixed top-0 left-0 w-68">
        <DashboardSidebar />
      </div>
      {children}
    </div>
  );
}
