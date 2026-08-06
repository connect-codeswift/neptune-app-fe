"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useIssuePpeMutation } from "@/hooks/use-ppe-mutations";
import { usePpeItemsQuery } from "@/hooks/use-ppe-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { getCurrentUser } from "@/lib/current-user";
import {
  toPpeItemOptions,
  toIssueIdFromResponse,
  toPpeSizeOptionsForItem,
} from "@/lib/map-ppe";
import { toAssigneeOptions } from "@/lib/map-user";
import { acknowledgePpe } from "@/services/ppe.service";
import { toast } from "@/lib/toast";
import { IssuePpeHeader } from "./IssuePpeHeader";
import { PpeFormPageSkeleton } from "../PpeSkeletons";
import {
  buildIssuePpeSchema,
  createIssuePpeValues,
  ISSUE_PPE_FORM_ID,
  isEmployeeAcknowledged,
  toIssuePpeRequest,
  type IssuePpeFormValues,
} from "./issue-ppe-form-schema";

const PPE_ROUTE = "/dashboard/ppe-management";
const ISSUANCE_LOG_ROUTE = "/dashboard/ppe-management/issuance-log";

const fieldLabelClass = [
  "[&_label]:text-base",
  "[&_label]:font-semibold",
  "[&_label]:tracking-[0.24px]",
  "[&_label]:text-[#566072]",
].join(" ");

export function IssuePpeContent() {
  const router = useRouter();
  const issuePpe = useIssuePpeMutation();
  const userDropdownQuery = useUserDropdownQuery();
  const ppeItemsQuery = usePpeItemsQuery();
  const [selectedPpeItemId, setSelectedPpeItemId] = useState("");
  const [formSeed, setFormSeed] = useState<FormValues | null>(null);

  const users = userDropdownQuery.data?.dataModel;
  const ppeItems = ppeItemsQuery.data;
  const ppeItemOptions = useMemo(
    () => toPpeItemOptions(ppeItems ?? []),
    [ppeItems],
  );
  const sizeOptions = useMemo(
    () => toPpeSizeOptionsForItem(ppeItems, selectedPpeItemId),
    [ppeItems, selectedPpeItemId],
  );

  const schema = useMemo(
    () =>
      buildIssuePpeSchema(
        toAssigneeOptions(users ?? []),
        ppeItemOptions,
        sizeOptions,
        selectedPpeItemId !== "",
      ),
    [users, ppeItemOptions, sizeOptions, selectedPpeItemId],
  );
  const defaultInitialValues = useMemo(
    () => createIssuePpeValues(schema),
    [schema],
  );
  const initialValues = formSeed ?? defaultInitialValues;

  const handleFormChange = (values: FormValues) => {
    const nextPpeItemId = String(values.ppeItem);

    if (nextPpeItemId !== selectedPpeItemId) {
      setSelectedPpeItemId(nextPpeItemId);
      setFormSeed({ ...values, size: "" });
      return;
    }

    setFormSeed(values);
  };

  const handleCancel = () => {
    router.push(PPE_ROUTE);
  };

  const handleSubmit = (values: FormValues) => {
    const formValues = values as IssuePpeFormValues;
    const payload = toIssuePpeRequest(formValues, ppeItemOptions, sizeOptions);
    const shouldAcknowledge = isEmployeeAcknowledged(
      formValues.employeeAcknowledgement,
    );

    issuePpe.mutate(payload, {
      onSuccess: (response) => {
        const finish = () => {
          toast.success("PPE issuance confirmed");
          router.push(ISSUANCE_LOG_ROUTE);
        };

        if (!shouldAcknowledge) {
          finish();
          return;
        }

        const issueId = toIssueIdFromResponse(response);

        if (issueId === null) {
          toast.error(
            "Issuance saved but could not acknowledge — missing issue id.",
          );
          router.push(ISSUANCE_LOG_ROUTE);
          return;
        }

        const { organizationName, subCompanyId } = getCurrentUser();
        const siteId = subCompanyId;

        if (!organizationName) {
          toast.error(
            "Issuance saved but could not acknowledge — missing organization.",
          );
          router.push(ISSUANCE_LOG_ROUTE);
          return;
        }

        if (siteId <= 0) {
          toast.error(
            "Issuance saved but could not acknowledge — missing site id.",
          );
          router.push(ISSUANCE_LOG_ROUTE);
          return;
        }

        void acknowledgePpe({
          issueId,
          org: organizationName,
          siteId,
        })
          .then(() => {
            toast.success("PPE acknowledgement confirmed");
            setTimeout(() => {
              finish();
            }, 1000);
          })
          .catch((error) => {
            toast.error(
              getMutationErrorMessage(
                error,
                "Issuance saved but could not acknowledge PPE.",
              ),
            );
            router.push(ISSUANCE_LOG_ROUTE);
          });
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not confirm the PPE issuance. Please try again.",
          ),
        );
      },
    });
  };

  const isLoading = userDropdownQuery.isPending || ppeItemsQuery.isPending;

  if (isLoading && !userDropdownQuery.data && !ppeItemsQuery.data) {
    return <PpeFormPageSkeleton fields={6} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <IssuePpeHeader />

      <div className="mx-auto flex w-full max-w-182.75 flex-col gap-3.5">
        <IncidentGlassCard paddingClassName="p-4 md:p-6" className="min-w-0">
          <div className="flex flex-col gap-4">
            <Text
              as="h2"
              className="text-ehs-darker text-[15px] font-bold md:text-xl"
            >
              Issuance Details
            </Text>

            {userDropdownQuery.isError ? (
              <Text as="p" className="text-ehs-red text-sm">
                {getMutationErrorMessage(
                  userDropdownQuery.error,
                  "Could not load employees.",
                )}
              </Text>
            ) : null}

            {ppeItemsQuery.isError ? (
              <Text as="p" className="text-ehs-red text-sm">
                {getMutationErrorMessage(
                  ppeItemsQuery.error,
                  "Could not load PPE items.",
                )}
              </Text>
            ) : null}

            <FormBuilder
              key={selectedPpeItemId}
              formId={ISSUE_PPE_FORM_ID}
              schema={schema}
              initialValues={initialValues}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              hideActions
              className={fieldLabelClass}
            />
          </div>
        </IncidentGlassCard>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleCancel}
            className="w-full rounded-[10px] px-4 py-2.5 text-base! font-medium sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={ISSUE_PPE_FORM_ID}
            variant="primary"
            disabled={isLoading || issuePpe.isPending}
            className="w-full rounded-[10px] px-5 py-2.5 text-base! font-semibold shadow-[0px_6px_18px_-6px_#0891a6] sm:w-auto"
          >
            {issuePpe.isPending ? "Confirming..." : "Confirm Issuance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
