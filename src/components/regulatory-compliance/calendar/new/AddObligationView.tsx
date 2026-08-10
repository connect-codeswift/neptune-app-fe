"use client";

import { AddObligationHeaderCard } from "./AddObligationHeaderCard";
import { AddObligationForm } from "./AddObligationForm";

export function AddObligationView() {
  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col px-4 pb-6">
      <AddObligationHeaderCard className="mt-0" />

      <div className="mt-3.5 flex w-full min-w-0 justify-center">
        <AddObligationForm />
      </div>
    </div>
  );
}
