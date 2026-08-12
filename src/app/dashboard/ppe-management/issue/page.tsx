import { IssuePpeContent } from "@/components/ppe/issue/IssuePpeContent";
import { IssuePpeHeader } from "@/components/ppe/issue/IssuePpeHeader";

export default function IssuePpePage() {
  return (
    <div className="mt-2 flex flex-1 flex-col">
      <div className="flex w-full flex-col gap-4 px-4 pb-8">
        <IssuePpeHeader />
        <div className="mx-auto w-full max-w-4xl">
          <IssuePpeContent />
        </div>
      </div>
    </div>
  );
}
