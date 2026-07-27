import { configureStore } from "@reduxjs/toolkit";
import { auditReducer, saveSelectedAudit } from "./audit-slice";
import {
  auditTemplateReducer,
  saveSelectedTemplate,
} from "./audit-template-slice";

export const store = configureStore({
  reducer: {
    audit: auditReducer,
    auditTemplate: auditTemplateReducer,
  },
});

// Mirror the selections to localStorage so they survive a refresh.
if (typeof window !== "undefined") {
  let previousTemplate = store.getState().auditTemplate.selected;
  let previousAudit = store.getState().audit.selected;

  store.subscribe(() => {
    const template = store.getState().auditTemplate.selected;
    if (template !== previousTemplate) {
      previousTemplate = template;
      saveSelectedTemplate(template);
    }

    const audit = store.getState().audit.selected;
    if (audit !== previousAudit) {
      previousAudit = audit;
      saveSelectedAudit(audit);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
