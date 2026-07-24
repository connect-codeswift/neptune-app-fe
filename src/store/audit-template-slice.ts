import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuditTemplateDto } from "@/dtos/res/audit-template-response.dto";

const STORAGE_KEY = "neptune.selectedAuditTemplate";

/** Read the persisted selection; null on the server or when absent/corrupt. */
export function loadSelectedTemplate(): AuditTemplateDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditTemplateDto) : null;
  } catch {
    return null;
  }
}

/** Persist (or clear) the selection in localStorage. */
export function saveSelectedTemplate(value: AuditTemplateDto | null): void {
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

type AuditTemplateState = {
  /** The template chosen for editing, kept for the edit page to read. */
  selected: AuditTemplateDto | null;
};

// Starts null so server and first client render agree; StoreProvider hydrates
// the persisted selection in a mount effect to avoid a hydration mismatch.
const initialState: AuditTemplateState = {
  selected: null,
};

const auditTemplateSlice = createSlice({
  name: "auditTemplate",
  initialState,
  reducers: {
    setSelectedTemplate(state, action: PayloadAction<AuditTemplateDto>) {
      state.selected = action.payload;
      saveSelectedTemplate(action.payload);
    },
    clearSelectedTemplate(state) {
      state.selected = null;
    },
  },
});

export const { setSelectedTemplate, clearSelectedTemplate } =
  auditTemplateSlice.actions;
export const auditTemplateReducer = auditTemplateSlice.reducer;
