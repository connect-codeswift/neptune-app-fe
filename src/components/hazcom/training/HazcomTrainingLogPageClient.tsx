"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  HAZCOM_TRAINING_SESSIONS,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { HazcomTrainingLogTable } from "@/components/hazcom/training/HazcomTrainingLogTable";

export function HazcomTrainingLogPageClient() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Training Log"]}
        title="HazCom Training Log"
        subtitle="Record training sessions, attendees, chemicals covered, and digital sign-offs"
        actions={
          <Link href="/dashboard/hazcom/training/new">
            <Button type="button" variant="primary">
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              Log Training Session
            </Button>
          </Link>
        }
      />

      <HazcomTrainingLogTable sessions={HAZCOM_TRAINING_SESSIONS} />
    </div>
  );
}
