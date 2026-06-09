"use client";

import SignupLeftPanel from "@/components/auth/SignupLeftPanel";
import SignupRightPanel from "@/components/auth/SignupRightPanel";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen w-full overflow-clip relative lg:grid-cols-2">
      {/* Left is sticky the other can scroll */}
      <div className="sticky top-0 lg:h-screen h-0">
        <SignupLeftPanel />\
      </div>
      <SignupRightPanel />
    </div>
  );
}
