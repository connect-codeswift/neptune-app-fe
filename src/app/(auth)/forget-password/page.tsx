"use client";

import ForgotPasswordLeftPanel from "@/components/auth/ForgotPasswordLeftPanel";
import ForgotPasswordRightPanel from "@/components/auth/ForgotPasswordRightPanel";

export default function ForgetPasswordPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      {/* Left is sticky the other can scroll */}
      <div className="sticky top-0 h-0 lg:h-screen">
        <ForgotPasswordLeftPanel />
      </div>
      <ForgotPasswordRightPanel />
    </div>
  );
}
