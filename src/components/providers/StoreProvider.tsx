"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import {
  loadSelectedTemplate,
  setSelectedTemplate,
} from "@/store/audit-template-slice";

export function StoreProvider(props: Readonly<{ children: ReactNode }>) {
  // Hydrate the persisted selection after mount to avoid an SSR mismatch.
  useEffect(() => {
    const saved = loadSelectedTemplate();
    if (saved) store.dispatch(setSelectedTemplate(saved));
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
}
