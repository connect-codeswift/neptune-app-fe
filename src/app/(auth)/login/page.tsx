"use client";

import LoginLeftPanel from "@/components/auth/LoginLeftPanel";
import LoginRightPanel from "@/components/auth/LoginRightPanel";

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      {/* Left is sticky the other can scroll */}
      <div className="hidden lg:block lg:sticky top-0 h-0 lg:h-screen">
        <LoginLeftPanel />
      </div>
      <LoginRightPanel />
    </div>
  );
}
