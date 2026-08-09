import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

/** Brand side of login, forgot/reset password and accept-invitation. */
export default function LoginLeftPanel() {
  return (
    <AuthBrandPanel
      headline={
        <>
          Safety work,
          <br />
          seen clearly.
        </>
      }
      sub="Incidents, hazards, audits and actions — one calm place for all of it."
    />
  );
}
