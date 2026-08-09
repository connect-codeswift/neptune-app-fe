import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

/**
 * Brand side of signup — same composition as the login panel, with copy for
 * someone arriving rather than returning. The trial terms stay: they answer
 * the question that actually blocks a signup.
 */
export default function SignupLeftPanel() {
  return (
    <AuthBrandPanel
      headline={
        <>
          Safety management,
          <br />
          finally unified.
        </>
      }
      sub="Incidents, audits, CAPAs and sustainability — one workspace for every site you run."
      note="30-day free trial · Full access · No credit card required"
    />
  );
}
