import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InspectionTemplateDto } from "@/dtos/res/inspection-template-response.dto";

const STORAGE_KEY = "neptune.selectedInspectionTemplate";

/** Read the persisted selection; null on the server or when absent/corrupt. */
export function loadSelectedInspectionTemplate(): InspectionTemplateDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InspectionTemplateDto) : null;
  } catch {
    return null;
  }
}

/** Persist (or clear) the selection in localStorage. */
export function saveSelectedInspectionTemplate(
  value: InspectionTemplateDto | null,
): void {
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

type InspectionTemplateState = {
  /** The template chosen for editing, kept for the edit page to read. */
  selected: InspectionTemplateDto | null;
};

// Starts null so server and first client render agree; StoreProvider hydrates
// the persisted selection in a mount effect to avoid a hydration mismatch.
const initialState: InspectionTemplateState = {
  selected: null,
};

const inspectionTemplateSlice = createSlice({
  name: "inspectionTemplate",
  initialState,
  reducers: {
    setSelectedInspectionTemplate(
      state,
      action: PayloadAction<InspectionTemplateDto>,
    ) {
      state.selected = action.payload;
      saveSelectedInspectionTemplate(action.payload);
    },
    clearSelectedInspectionTemplate(state) {
      state.selected = null;
    },
  },
});

export const {
  setSelectedInspectionTemplate,
  clearSelectedInspectionTemplate,
} = inspectionTemplateSlice.actions;
export const inspectionTemplateReducer = inspectionTemplateSlice.reducer;
