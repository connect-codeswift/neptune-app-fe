"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { loadSelectedAudit, setSelectedAudit } from "@/store/audit-slice";
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
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
}
