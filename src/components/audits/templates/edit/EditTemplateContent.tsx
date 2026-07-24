"use client";

import Link from "next/link";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useAuditTemplateDetailQuery } from "@/hooks/use-audit-template-queries";
import { mapDetailToWizardState } from "@/lib/map-audit-template";
import { CreateTemplateContent } from "@/components/audits/templates/create/CreateTemplateContent";
import { useAppSelector } from "@/store/hooks";

const TEMPLATES_ROUTE = "/dashboard/audits/template";

export function EditTemplateContent(props: Readonly<{ templateId: string }>) {
  const { templateId } = props;

  // Basic info was stashed in the store on Edit — no need to refetch the list.
  const summary = useAppSelector((state) => state.auditTemplate.selected);
  const detailQuery = useAuditTemplateDetailQuery(templateId, summary);
  if (detailQuery.isPending) {
    return (
      <p className="text-ehs-muted-text px-4 text-sm">Loading template...</p>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-2 px-4">
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this template.",
          )}
        </Text>
        <Link
          href={TEMPLATES_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to templates
        </Link>
      </div>
    );
  }

  const initialState = mapDetailToWizardState(detailQuery.data);
  console.log("Initial state", initialState);
  return (
    <CreateTemplateContent
      mode="edit"
      initialState={initialState}
      templateId={templateId}
      expectedUpdatedDate={summary?.updatedDate ?? summary?.createdDate}
    />
  );
}
