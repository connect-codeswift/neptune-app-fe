"use client";

import SignupLeftPanel from "@/components/auth/SignupLeftPanel";
import SignupRightPanel from "@/components/auth/SignupRightPanel";

export default function SignupPage() {
  return (
    <div className="relative grid min-h-screen w-full overflow-clip lg:grid-cols-2">
      {/* Left is sticky the other can scroll */}
      <div className="top-0 hidden h-0 lg:sticky lg:block lg:h-screen">
        <SignupLeftPanel />
      </div>
      <SignupRightPanel />
    </div>
  );
}
