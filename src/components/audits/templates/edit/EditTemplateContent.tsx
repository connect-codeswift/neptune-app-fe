"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useAuditTemplateDetailQuery } from "@/hooks/use-audit-template-queries";
import { mapDetailToWizardState } from "@/lib/map-audit-template";
import { CreateTemplateContent } from "@/components/audits/templates/create/CreateTemplateContent";
import { EditTemplateSkeleton } from "./EditTemplateSkeleton";
import { loadSelectedTemplate } from "@/store/audit-template-slice";
import { useAppSelector } from "@/store/hooks";

const TEMPLATES_ROUTE = "/dashboard/audits/template";

export function EditTemplateContent(props: Readonly<{ templateId: string }>) {
  const { templateId } = props;

  // False on the server and the first client render, true afterwards.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Basic info was stashed in the store on Edit — no need to refetch the list.
  // The store restores it in a mount effect that runs *after* this render, so
  // read the persisted copy directly; otherwise the wizard seeds itself blank
  // on a reload and never picks the values up again (its state is lazy-init).
  const storedSummary = useAppSelector((state) => state.auditTemplate.selected);
  const summary = storedSummary ?? (hydrated ? loadSelectedTemplate() : null);
  const detailQuery = useAuditTemplateDetailQuery(templateId, summary);
  // Wait for hydration so the wizard mounts once, with the summary resolved.
  if (!hydrated || detailQuery.isPending) {
    return <EditTemplateSkeleton />;
  }

  if (detailQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-2 px-4">
        <Text as="p" className="text4 text-ehs-red">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this template.",
          )}
        </Text>
        <Link
          href={TEMPLATES_ROUTE}
          className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover transition-colors"
        >
          Back to templates
        </Link>
      </div>
    );
  }

  const initialState = mapDetailToWizardState(detailQuery.data, summary);
  return (
    <CreateTemplateContent
      mode="edit"
      initialState={initialState}
      templateId={templateId}
      expectedUpdatedDate={summary?.updatedDate ?? summary?.createdDate}
    />
  );
}
