export type HrcaCellModalKind =
  "contributingFactor" | "why" | "correctiveAction";

export type HrcaCellModalState = Readonly<{
  kind: HrcaCellModalKind;
  mode: "add" | "edit";
  rowId: string;
  category: string;
  initialText: string;
  /** Why step number (1–5) */
  stepNum?: number;
  whyIndex?: number;
  /** Show root-cause hint in the modal footer */
  isRootCause?: boolean;
  /** Persisted corrective action id when editing */
  actionId?: number;
}>;

export type HrcaConfirmModalState = Readonly<{
  kind: "why" | "correctiveAction";
  rowId: string;
  category: string;
  whyIndex?: number;
  actionIndex?: number;
  title: string;
  message: string;
}>;
