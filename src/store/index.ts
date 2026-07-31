import { configureStore } from "@reduxjs/toolkit";
import { auditReducer, saveSelectedAudit } from "./audit-slice";
import {
  auditTemplateReducer,
  saveSelectedTemplate,
} from "./audit-template-slice";
import {
  inspectionTemplateReducer,
  saveSelectedInspectionTemplate,
} from "./inspection-template-slice";

export const store = configureStore({
  reducer: {
    audit: auditReducer,
    auditTemplate: auditTemplateReducer,
    inspectionTemplate: inspectionTemplateReducer,
  },
});

// Mirror the selections to localStorage so they survive a refresh.
if (typeof window !== "undefined") {
  let previousTemplate = store.getState().auditTemplate.selected;
  let previousAudit = store.getState().audit.selected;
  let previousInspectionTemplate = store.getState().inspectionTemplate.selected;

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

    const inspectionTemplate = store.getState().inspectionTemplate.selected;
    if (inspectionTemplate !== previousInspectionTemplate) {
      previousInspectionTemplate = inspectionTemplate;
      saveSelectedInspectionTemplate(inspectionTemplate);
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
