import type { ReactNode } from "react";

/** Pass-through layout so nested CAPA routes keep their own `loading.tsx`. */
export default function CapaIdLayout(
  props: Readonly<{ children: ReactNode }>,
) {
  return props.children;
}
