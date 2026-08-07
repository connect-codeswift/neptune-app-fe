"use client";

import { Suspense } from "react";
import AcceptInvitationRightPanel from "@/components/auth/AcceptInvitationRightPanel";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";

export default function AcceptInvitationPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      <div className="top-0 hidden h-0 lg:sticky lg:block lg:h-screen">
        <LoginLeftPanel />
      </div>
      <Suspense fallback={null}>
        <AcceptInvitationRightPanel />
      </Suspense>
    </div>
  );
}
