import { Suspense } from "react";
import { ReplacementRequestContent } from "@/components/ppe/replacement/ReplacementRequestContent";

export default function ReplacementRequestPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <Suspense fallback={null}>
        <ReplacementRequestContent />
      </Suspense>
    </div>
  );
}
