"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import type { AuditTemplate } from "@/app/dashboard/audits/template/audit-templates-data";

export type AuditTemplateCardProps = Readonly<{
  template: AuditTemplate;
  onUse?: (template: AuditTemplate) => void;
  onEdit?: (template: AuditTemplate) => void;
}>;

export function AuditTemplateCard(props: AuditTemplateCardProps) {
  const { template, onUse, onEdit } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click and on Escape while it's open.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="backdrop-blur-2.5 min-w-0 bg-[rgba(255,255,255,0.62)]"
      incidentGlassCardClassName="gap-3"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <Text as="span" className="text8 text-ehs-muted-text">
          {`${String(template.sectionCount)} sections · ${String(template.itemCount)} items`}
        </Text>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label={`Options for ${template.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="text-ehs-muted-text hover:text-ehs-gray -mt-1 cursor-pointer transition-colors"
          >
            <Icon icon="mdi:dots-horizontal" className="size-5" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="animate-popover-in absolute right-0 z-20 mt-1.5 w-52 origin-top-right overflow-hidden rounded-xl border border-slate-900/10 bg-white py-1 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(template);
                }}
                className="text4 hover:bg-ehs-light-bg/60 text-ehs-dark-bg flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left transition-colors"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="text-ehs-gray size-4 shrink-0"
                  aria-hidden="true"
                />
                Edit template
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Text as="h3" className="text3 text-ehs-darker">
          {template.title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          {`${template.category} · ${template.scope}`}
        </Text>
      </div>

      <Text as="p" className="text8 text-ehs-muted-text">
        {`Last used: ${template.lastUsed}`}
      </Text>

      <Button
        type="button"
        variant="primary"
        onClick={() => onUse?.(template)}
        className="text4 mt-1 w-full justify-center rounded-xl px-4 py-2.5"
      >
        Use Template
      </Button>
    </IncidentGlassCard>
  );
}
