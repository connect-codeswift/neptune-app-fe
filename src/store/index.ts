import { configureStore } from "@reduxjs/toolkit";
import {
  auditTemplateReducer,
  saveSelectedTemplate,
} from "./audit-template-slice";

export const store = configureStore({
  reducer: {
    auditTemplate: auditTemplateReducer,
  },
});

// Mirror the selected template to localStorage so edits survive a refresh.
if (typeof window !== "undefined") {
  let previous = store.getState().auditTemplate.selected;
  store.subscribe(() => {
    const current = store.getState().auditTemplate.selected;
    if (current !== previous) {
      previous = current;
      saveSelectedTemplate(current);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
