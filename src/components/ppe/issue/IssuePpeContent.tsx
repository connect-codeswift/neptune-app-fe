"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
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

/** Match Near Miss / Hazard report form typography (text1–text9 scale). */
const issuePpeFormFieldClass = [
  "[&_label]:text8",
  "[&_label]:font-semibold",
  "[&_label]:text-ehs-gray",
  "[&_input]:text4",
  "[&_select]:text4",
  "[&_textarea]:text4",
  "[&_button]:text4",
  "[&_p]:text8",
].join(" ");

export function IssuePpeContent() {
  const router = useRouter();
  const issuePpe = useIssuePpeMutation();
  // Held past the response: `isPending` drops when the record is created,
  // while the push to the next page is still in flight. A click in that gap
  // saved a duplicate.
  const submitLock = useSubmitLock();
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

    if (!submitLock.acquire()) {
      return;
    }

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
        submitLock.release();
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
    return <PpeFormPageSkeleton fields={6} includeHeader={false} />;
  }

  return (
    <IncidentGlassCard paddingClassName="p-6 sm:p-8" className="w-full">
      {ppeItemsQuery.isError ? (
        <Text as="p" className="text8 text-ehs-red mb-4">
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
        onCancel={handleCancel}
        submitLabel={submitLock.isLocked ? "Confirming..." : "Confirm Issuance"}
        cancelLabel="Cancel"
        isSubmitting={submitLock.isLocked}
        className={issuePpeFormFieldClass}
      />
    </IncidentGlassCard>
  );
}
