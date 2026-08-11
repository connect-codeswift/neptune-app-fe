import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuditItemResponseRequestDto } from "@/dtos/req/audit-request.dto";
import type {
  AuditDto,
  AuditResponsesResultDto,
} from "@/dtos/res/audit-response.dto";

const STORAGE_KEY = "neptune.selectedAudit";
const RESULT_STORAGE_KEY = "neptune.auditResult";
const ANSWERS_STORAGE_KEY = "neptune.auditAnswers";

/** Read the persisted audit; null on the server or when absent/corrupt. */
export function loadSelectedAudit(): AuditDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditDto) : null;
  } catch {
    return null;
  }
}

/** Persist (or clear) the audit in localStorage. */
export function saveSelectedAudit(value: AuditDto | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

/** Read the persisted submission result; null when absent/corrupt. */
export function loadAuditResult(): AuditResponsesResultDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditResponsesResultDto) : null;
  } catch {
    return null;
  }
}

/** Persist (or clear) the submission result in localStorage. */
function saveAuditResult(value: AuditResponsesResultDto | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(RESULT_STORAGE_KEY);
    }
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

/** Read the persisted answers; null when absent/corrupt. */
export function loadAuditAnswers(): AuditItemResponseRequestDto[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ANSWERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditItemResponseRequestDto[]) : null;
  } catch {
    return null;
  }
}

/** Persist (or clear) the submitted answers in localStorage. */
function saveAuditAnswers(
  value: AuditItemResponseRequestDto[] | null,
): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(ANSWERS_STORAGE_KEY);
    }
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

type AuditState = {
  /** The audit just created (or opened), kept for the checklist to read. */
  selected: AuditDto | null;
  /** What the backend returned when the audit's answers were recorded. */
  result: AuditResponsesResultDto | null;
  /** The answers that were submitted, for the report's per-section scores. */
  answers: AuditItemResponseRequestDto[] | null;
};

// Starts null so server and first client render agree; StoreProvider hydrates
// the persisted audit in a mount effect to avoid a hydration mismatch.
const initialState: AuditState = {
  selected: null,
  result: null,
  answers: null,
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    setSelectedAudit(state, action: PayloadAction<AuditDto>) {
      state.selected = action.payload;
      saveSelectedAudit(action.payload);
    },
    clearSelectedAudit(state) {
      state.selected = null;
    },
    setAuditResult(state, action: PayloadAction<AuditResponsesResultDto>) {
      state.result = action.payload;
      saveAuditResult(action.payload);
    },
    setAuditAnswers(
      state,
      action: PayloadAction<AuditItemResponseRequestDto[]>,
    ) {
      state.answers = action.payload;
      saveAuditAnswers(action.payload);
    },
  },
});

export const {
  setSelectedAudit,
  clearSelectedAudit,
  setAuditResult,
  setAuditAnswers,
} = auditSlice.actions;
export const auditReducer = auditSlice.reducer;
