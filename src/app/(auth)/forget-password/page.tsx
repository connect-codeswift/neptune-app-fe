"use client";

import ForgotPasswordRightPanel from "@/components/auth/ForgotPasswordRightPanel";
import LoginLeftPanel from "@/components/auth/LoginLeftPanel";

export default function ForgetPasswordPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      {/* Left is sticky the other can scroll */}
      <div className="top-0 hidden h-0 lg:sticky lg:block lg:h-screen">
        <LoginLeftPanel />
      </div>
      <ForgotPasswordRightPanel />
    </div>
  );
}
