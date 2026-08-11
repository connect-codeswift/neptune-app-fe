"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ChemicalRequestDto,
  ChemicalRiskAssessmentRequestDto,
  SafetyDataSheetRequestDto,
  TrainingLogRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import { hazcomQueryKeys } from "@/hooks/use-hazcom-queries";
import {
  createChemical,
  createChemicalRiskAssessment,
  createSafetyDataSheet,
  createTrainingLog,
} from "@/services/hazcom.service";

/**
 * Every HazCom list is cached under the `["hazcom"]` prefix, and the modules
 * cross-reference each other (a chemical shows its SDS link, an assessment
 * names a chemical), so writes invalidate the whole prefix rather than
 * tracking which lists a given record appears in.
 */
function useHazcomInvalidator() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: hazcomQueryKeys.all });
  };
}

/**
 * POST /api/hazcom/chemical
 *
 * The endpoint doubles as the update route: omit `id` to create, send it to
 * overwrite the existing record (see `ChemicalRequestDto`).
 */
export function useCreateChemicalMutation() {
  const invalidate = useHazcomInvalidator();

  return useMutation({
    mutationFn: (payload: ChemicalRequestDto) => createChemical(payload),
    onSuccess: invalidate,
  });
}

/** POST /api/hazcom/sds */
export function useCreateSdsMutation() {
  const invalidate = useHazcomInvalidator();

  return useMutation({
    mutationFn: (payload: SafetyDataSheetRequestDto) =>
      createSafetyDataSheet(payload),
    onSuccess: invalidate,
  });
}

/** POST /api/hazcom/training */
export function useCreateTrainingLogMutation() {
  const invalidate = useHazcomInvalidator();

  return useMutation({
    mutationFn: (payload: TrainingLogRequestDto) => createTrainingLog(payload),
    onSuccess: invalidate,
  });
}

/** POST /api/hazcom/risk-assessment */
export function useCreateRiskAssessmentMutation() {
  const invalidate = useHazcomInvalidator();

  return useMutation({
    mutationFn: (payload: ChemicalRiskAssessmentRequestDto) =>
      createChemicalRiskAssessment(payload),
    onSuccess: invalidate,
  });
}
