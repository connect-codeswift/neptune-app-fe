"use client";

import { useParams } from "next/navigation";
import { EditAuditForm } from "@/components/audits/edit/EditAuditForm";
import { EditAuditHeader } from "@/components/audits/edit/EditAuditHeader";

export default function EditAuditPage() {
  const params = useParams();
  const auditId = decodeURIComponent(params.id as string);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-4 px-4 pt-4 pb-8">
      <EditAuditHeader auditId={auditId} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <EditAuditForm auditId={auditId} />
      </div>
    </div>
  );
}
