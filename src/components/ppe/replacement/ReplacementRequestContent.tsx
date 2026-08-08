"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormBuilder,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useReplacePpeRequestMutation } from "@/hooks/use-ppe-mutations";
import {
  usePpeIssueProfileQuery,
  usePpeItemsQuery,
} from "@/hooks/use-ppe-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toPpeItemOptions } from "@/lib/map-ppe";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import { PpeFormPageSkeleton } from "../PpeSkeletons";
import { ReplacementRequestHeader } from "./ReplacementRequestHeader";
import {
  buildReplacementRequestSchema,
  createReplacementRequestValues,
  REPLACEMENT_REQUEST_FORM_ID,
  toReplacePpeRequest,
  type ReplacementRequestFormValues,
} from "./replacement-request-schema";

const PPE_ROUTE = "/dashboard/ppe-management";

const fieldLabelClass = [
  "[&_label]:text-base",
  "[&_label]:font-semibold",
  "[&_label]:tracking-[0.24px]",
  "[&_label]:text-[#566072]",
].join(" ");

export function ReplacementRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const issueIdParam = searchParams.get("issueId")?.trim() ?? "";
  const issueProfileQuery = usePpeIssueProfileQuery(
    /^\d+$/.test(issueIdParam) ? issueIdParam : "",
  );
  const userDropdownQuery = useUserDropdownQuery();
  const ppeItemsQuery = usePpeItemsQuery();
  const replaceRequest = useReplacePpeRequestMutation();

  const employeeId = issueProfileQuery.profile?.id?.trim() ?? "";
  const employeeName = issueProfileQuery.profile?.name?.trim() ?? "";

  const employeeOptions = useMemo((): SelectOption[] => {
    const fromUsers = toAssigneeOptions(
      userDropdownQuery.data?.dataModel ?? [],
    );

    // Prefer an exact user-dropdown match; fall back to the issue profile name
    // so the disabled field always shows who the PPE was issued to.
    const matched =
      (employeeId
        ? fromUsers.find((option) => option.value === employeeId)
        : undefined) ??
      (employeeName
        ? fromUsers.find(
            (option) =>
              option.label.trim().toLowerCase() === employeeName.toLowerCase(),
          )
        : undefined);

    if (matched) {
      return [
        matched,
        ...fromUsers.filter((option) => option.value !== matched.value),
      ];
    }

    if (employeeName) {
      return [
        {
          value: employeeId || employeeName,
          label: employeeName,
        },
        ...fromUsers,
      ];
    }

    return fromUsers;
  }, [userDropdownQuery.data?.dataModel, employeeId, employeeName]);

  const selectedEmployeeValue = useMemo(() => {
    if (!employeeOptions.length) return "";
    if (employeeId) {
      const byId = employeeOptions.find((option) => option.value === employeeId);
      if (byId) return byId.value;
    }
    if (employeeName) {
      const byName = employeeOptions.find(
        (option) =>
          option.label.trim().toLowerCase() === employeeName.toLowerCase() ||
          option.value === employeeName,
      );
      if (byName) return byName.value;
    }
    return employeeOptions[0]?.value ?? "";
  }, [employeeOptions, employeeId, employeeName]);

  const itemOptions = useMemo((): SelectOption[] => {
    const catalogue = toPpeItemOptions(ppeItemsQuery.data ?? []);

    // Prefer the current issuance id so submit matches POST issuePpeId.
    // Keep the catalogue list so every PPE item is visible; when the
    // issuance is already in catalogue ids this is a no-op prepend.
    if (
      issueIdParam &&
      /^\d+$/.test(issueIdParam) &&
      !catalogue.some((option) => option.value === issueIdParam)
    ) {
      const issueItem =
        issueProfileQuery.profile?.activeItems.find(
          (item) => item.id === issueIdParam || item.id.endsWith(issueIdParam),
        ) ?? issueProfileQuery.profile?.activeItems[0];

      return [
        {
          value: issueIdParam,
          label: issueItem?.name ?? `Issue #${issueIdParam}`,
        },
        ...catalogue,
      ];
    }

    return catalogue;
  }, [
    ppeItemsQuery.data,
    issueIdParam,
    issueProfileQuery.profile?.activeItems,
  ]);

  const schema = useMemo(
    () => buildReplacementRequestSchema(employeeOptions, itemOptions),
    [employeeOptions, itemOptions],
  );

  const initialValues = useMemo(
    () =>
      createReplacementRequestValues(schema, {
        employeeId: selectedEmployeeValue,
        issuePpeId: issueIdParam,
      }),
    [schema, selectedEmployeeValue, issueIdParam],
  );

  const isLoading =
    (Boolean(issueIdParam) &&
      (issueProfileQuery.isLoading ||
        (!issueProfileQuery.profile &&
          !issueProfileQuery.errorMessage &&
          !issueProfileQuery.isNotFound))) ||
    userDropdownQuery.isPending ||
    ppeItemsQuery.isPending;

  const handleCancel = () => {
    if (issueIdParam) {
      router.push(`${PPE_ROUTE}/profile/${encodeURIComponent(issueIdParam)}`);
      return;
    }
    router.push(PPE_ROUTE);
  };

  const handleSubmit = (values: FormValues) => {
    // Always prefer the deep-linked issuance id for the replace-request API.
    const formValues = values as ReplacementRequestFormValues;
    const payload = toReplacePpeRequest({
      ...formValues,
      issuePpeId: issueIdParam || formValues.issuePpeId,
    });
    if ("error" in payload) {
      toast.error(payload.error);
      return;
    }

    replaceRequest.mutate(payload, {
      onSuccess: () => {
        toast.success("Replacement request submitted");
        if (issueIdParam) {
          router.push(
            `${PPE_ROUTE}/profile/${encodeURIComponent(issueIdParam)}`,
          );
          return;
        }
        router.push(PPE_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Failed to submit replacement request.",
          ),
        );
      },
    });
  };

  if (isLoading) {
    return <PpeFormPageSkeleton fields={5} />;
  }

  const loadError =
    (Boolean(issueIdParam) && issueProfileQuery.errorMessage) ||
    (userDropdownQuery.isError
      ? getMutationErrorMessage(
          userDropdownQuery.error,
          "Could not load employees.",
        )
      : null) ||
    (ppeItemsQuery.isError
      ? getMutationErrorMessage(
          ppeItemsQuery.error,
          "Could not load PPE items.",
        )
      : null);

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <ReplacementRequestHeader />

      <div className="mx-auto flex w-full max-w-145 flex-col gap-3.5">
        {loadError ? (
          <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
            <Text as="p" className="text-ehs-darker text-sm font-semibold">
              Couldn&apos;t load the replacement form
            </Text>
            <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
              {loadError}
            </Text>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => {
                if (issueIdParam) void issueProfileQuery.refetch();
                void userDropdownQuery.refetch();
                void ppeItemsQuery.refetch();
              }}
            >
              Try again
            </Button>
          </IncidentGlassCard>
        ) : (
          <IncidentGlassCard paddingClassName="p-4 md:p-6" className="min-w-0">
            <div className="flex flex-col gap-5">
              <Text
                as="h2"
                className="text-ehs-darker text-base font-bold md:text-xl"
              >
                Request Details
              </Text>

              <FormBuilder
                // Remount only when the values FormBuilder captures on mount
                // change. itemOptions was in this key too, so the form was
                // wiped mid-typing when the items query resolved — unnecessary,
                // since options reach the fields through `schema` on re-render.
                key={`${selectedEmployeeValue}-${issueIdParam}`}
                formId={REPLACEMENT_REQUEST_FORM_ID}
                schema={schema}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                hideActions
                className={fieldLabelClass}
              />

              <div className="flex flex-col-reverse gap-2.5 border-t border-[rgba(11,19,32,0.08)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:border-0 md:pt-0">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={handleCancel}
                  className="w-full rounded-[10px] px-4 py-2.5 text-base font-medium sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form={REPLACEMENT_REQUEST_FORM_ID}
                  variant="primary"
                  disabled={
                    replaceRequest.isPending ||
                    !issueIdParam ||
                    itemOptions.length === 0
                  }
                  className="w-full rounded-[10px] px-5 py-2.5 text-base font-semibold shadow-[0px_6px_18px_-6px_#0891a6] sm:w-auto"
                >
                  {replaceRequest.isPending
                    ? "Submitting..."
                    : "Submit Request"}
                </Button>
              </div>
            </div>
          </IncidentGlassCard>
        )}
      </div>
    </div>
  );
}
