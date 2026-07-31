"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import {
  loadAuditAnswers,
  loadAuditResult,
  loadSelectedAudit,
  setAuditAnswers,
  setAuditResult,
  setSelectedAudit,
} from "@/store/audit-slice";
import {
  loadSelectedTemplate,
  setSelectedTemplate,
} from "@/store/audit-template-slice";

export function StoreProvider(props: Readonly<{ children: ReactNode }>) {
  // Hydrate the persisted selections after mount to avoid an SSR mismatch.
  useEffect(() => {
    const savedTemplate = loadSelectedTemplate();
    if (savedTemplate) store.dispatch(setSelectedTemplate(savedTemplate));

    const savedAudit = loadSelectedAudit();
    if (savedAudit) store.dispatch(setSelectedAudit(savedAudit));

    const savedResult = loadAuditResult();
    if (savedResult) store.dispatch(setAuditResult(savedResult));

    const savedAnswers = loadAuditAnswers();
    if (savedAnswers) store.dispatch(setAuditAnswers(savedAnswers));
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
}
