import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuditDto } from "@/dtos/res/audit-response.dto";

const STORAGE_KEY = "neptune.selectedAudit";

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

type AuditState = {
  /** The audit just created (or opened), kept for the checklist to read. */
  selected: AuditDto | null;
};

// Starts null so server and first client render agree; StoreProvider hydrates
// the persisted audit in a mount effect to avoid a hydration mismatch.
const initialState: AuditState = {
  selected: null,
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
  },
});

export const { setSelectedAudit, clearSelectedAudit } = auditSlice.actions;
export const auditReducer = auditSlice.reducer;
