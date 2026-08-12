"use client";

import { AddObligationHeaderCard } from "./AddObligationHeaderCard";
import { AddObligationForm } from "./AddObligationForm";

export function AddObligationView() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <AddObligationHeaderCard />

      <div className="flex w-full min-w-0 justify-center">
        <AddObligationForm />
      </div>
    </div>
  );
}
