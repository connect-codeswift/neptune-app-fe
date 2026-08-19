"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  TEMPLATE_ITEM_META,
  TEMPLATE_ITEM_TYPES,
  type TemplateItemType,
} from "./template-builder-data";

export type ChooseItemTypeDialogProps = Readonly<{
  open: boolean;
  onSelect: (type: TemplateItemType) => void;
  onClose: () => void;
}>;

/** Modal grid of item types, opened by "Add Item" in the section builder. */
export function ChooseItemTypeDialog(props: ChooseItemTypeDialogProps) {
  const { open, onSelect, onClose } = props;

  // Close on Escape while the dialog is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose item type"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-ehs-border-ink/50 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="border-ehs-hairline/90 bg-ehs-surface relative z-1 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-(--ehs-shadow-dialog)">
        <header className="border-ehs-border-ink/10 flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="text-ehs-dark-bg text-lg font-bold">
            Choose item type
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ehs-muted-text hover:text-ehs-dark-bg -mr-1 shrink-0 cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" className="size-5" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto p-5 sm:grid-cols-3">
          {TEMPLATE_ITEM_TYPES.map((type) => {
            const meta = TEMPLATE_ITEM_META[type];

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className="hover:border-ehs-normal-blue/60 hover:bg-ehs-normal-blue/5 border-ehs-border-ink/10 bg-ehs-form-classes-bg/50 flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-left transition-colors"
              >
                <span className="text-ehs-dark-bg flex items-center gap-1.5 font-semibold">
                  <Icon
                    icon={meta.icon}
                    className="text-ehs-gray size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {type}
                </span>
                <span className="text-ehs-muted-text text-xs leading-4">
                  {meta.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
