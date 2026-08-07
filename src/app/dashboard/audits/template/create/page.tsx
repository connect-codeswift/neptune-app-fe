import { DashboardHeader } from "@/components/DashboardHeader";
import { CreateTemplateContent } from "@/components/audits/templates/create/CreateTemplateContent";

export default function CreateAuditTemplatePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <CreateTemplateContent />
    </div>
  );
}
