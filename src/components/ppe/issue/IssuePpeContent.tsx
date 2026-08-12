"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useIssuePpeMutation } from "@/hooks/use-ppe-mutations";
import { usePpeItemsQuery } from "@/hooks/use-ppe-queries";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { canManagePpeInventory, getCurrentUser } from "@/lib/current-user";
import {
  toPpeItemOptions,
  toIssueIdFromResponse,
  toPpeSizeOptionsForItem,
} from "@/lib/map-ppe";
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
  const ppeItemsQuery = usePpeItemsQuery();
  const [selectedPpeItemId, setSelectedPpeItemId] = useState("");
  const [formSeed, setFormSeed] = useState<FormValues | null>(null);
  // Resolve role / identity after mount — JWT lives in localStorage.
  const [roleReady, setRoleReady] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const [employeeUserId, setEmployeeUserId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [siteId, setSiteId] = useState(0);
  const [siteName, setSiteName] = useState<string | null>(null);

  useEffect(() => {
    const elevated = canManagePpeInventory();
    const current = getCurrentUser();
    const auth = getAuthContext();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time identity read from localStorage token
    setIsElevated(elevated);
    setSiteId(current.siteId || auth?.siteId || 0);
    setSiteName(auth?.siteName ?? null);

    if (!elevated && current.userId > 0) {
      setEmployeeUserId(String(current.userId));
      setEmployeeName(getAuthDisplayName());
    }

    setRoleReady(true);
  }, []);

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
        ppeItemOptions,
        sizeOptions,
        selectedPpeItemId !== "",
        {
          siteId,
          siteName,
          disabled: !isElevated,
          helperText: !isElevated
            ? "Issuances are assigned to your account."
            : undefined,
        },
        isElevated,
      ),
    [
      ppeItemOptions,
      sizeOptions,
      selectedPpeItemId,
      siteId,
      siteName,
      isElevated,
    ],
  );
  const defaultInitialValues = useMemo(
    () =>
      createIssuePpeValues(schema, {
        showEmployeeAcknowledgement: isElevated,
        employeeUserId,
        employeeName,
      }),
    [schema, isElevated, employeeUserId, employeeName],
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

    if (!String(formValues.employee ?? "").trim()) {
      toast.error("Select an employee.");
      return;
    }

    const payload = toIssuePpeRequest(formValues, ppeItemOptions, sizeOptions);
    const shouldAcknowledge =
      isElevated && isEmployeeAcknowledged(formValues.employeeAcknowledgement);

    issuePpe.mutate(payload, {
      onSuccess: (response) => {
        const afterIssueRoute = isElevated ? ISSUANCE_LOG_ROUTE : PPE_ROUTE;

        const finish = () => {
          toast.success("PPE issuance confirmed");
          router.push(afterIssueRoute);
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
          router.push(afterIssueRoute);
          return;
        }

        const { organizationName, siteId: ackSiteId } = getCurrentUser();

        if (!organizationName) {
          toast.error(
            "Issuance saved but could not acknowledge — missing organization.",
          );
          router.push(afterIssueRoute);
          return;
        }

        if (ackSiteId <= 0) {
          toast.error(
            "Issuance saved but could not acknowledge — missing site id.",
          );
          router.push(afterIssueRoute);
          return;
        }

        void acknowledgePpe({
          issueId,
          org: organizationName,
          siteId: ackSiteId,
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
            router.push(afterIssueRoute);
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

  const isLoading = ppeItemsQuery.isPending;

  if ((isLoading && !ppeItemsQuery.data) || !roleReady) {
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
              className="text-ehs-darker text-3.75 font-bold md:text-xl"
            >
              Issuance Details
            </Text>

            {ppeItemsQuery.isError ? (
              <Text as="p" className="text-ehs-red text-sm">
                {getMutationErrorMessage(
                  ppeItemsQuery.error,
                  "Could not load PPE items.",
                )}
              </Text>
            ) : null}

            <FormBuilder
              key={`${selectedPpeItemId}-${String(isElevated)}-${employeeUserId}`}
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
            className="w-full rounded-2.5 px-4 py-2.5 text-base! font-medium sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={ISSUE_PPE_FORM_ID}
            variant="primary"
            isLoading={issuePpe.isPending}
            disabled={isLoading}
            className="w-full rounded-2.5 px-5 py-2.5 text-base! font-semibold shadow-[0px_6px_18px_-6px_#0891a6] sm:w-auto"
          >
            {issuePpe.isPending ? "Confirming..." : "Confirm Issuance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
