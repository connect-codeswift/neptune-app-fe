"use client";

import { Suspense } from "react";
import ResetPasswordRightPanel from "@/components/auth/ResetPasswordRightPanel";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";

export default function ResetPasswordPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      <div className="top-0 hidden h-0 lg:sticky lg:block lg:h-screen">
        <LoginLeftPanel />
      </div>
      <Suspense fallback={null}>
        <ResetPasswordRightPanel />
      </Suspense>
    </div>
  );
}
