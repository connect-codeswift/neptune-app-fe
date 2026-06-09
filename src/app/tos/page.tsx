import type { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSection,
} from "@/components/legal/LegalPageLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Neptune EHSS",
  description:
    "Terms of Service for Neptune, the environment, health, safety, and sustainability management platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="June 4, 2026">
      <LegalSection title="1. Agreement to these terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of Neptune, a cloud-based environment, health, safety, and
          sustainability (EHSS) software platform operated by Neptune
          (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an
          account or using the service, you agree to these Terms on behalf of
          yourself and the organization you represent.
        </p>
      </LegalSection>

      <LegalSection title="2. The Neptune service">
        <p>
          Neptune provides organizations with tools to manage EHSS programs,
          including but not limited to incident reporting and investigation,
          corrective and preventive action (CAPA) tracking, compliance audits,
          permit-to-work management, sustainability and ESG reporting, and
          training and competency records. Features available to you depend on
          your subscription plan and the modules enabled for your workspace.
        </p>
        <p>
          We may update, improve, or discontinue features from time to time. We
          will make reasonable efforts to notify workspace administrators of
          material changes that affect how you use the platform.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and workspaces">
        <p>
          You must provide accurate registration information and keep your
          account credentials secure. You are responsible for all activity that
          occurs under your account. Workspace administrators may invite team
          members, assign roles, and configure sites, regions, and modules on
          behalf of your organization.
        </p>
        <p>
          You represent that you have authority to bind your organization to
          these Terms when you create or administer a Neptune workspace.
        </p>
      </LegalSection>

      <LegalSection title="4. Customer data and responsibilities">
        <p>
          Your organization retains ownership of the data you submit to Neptune,
          including incident records, audit evidence, permits, training records,
          and related EHSS documentation (&quot;Customer Data&quot;). You grant
          us a limited license to host, process, and display Customer Data
          solely to provide and improve the service.
        </p>
        <p>
          You are responsible for ensuring that Customer Data is collected and
          uploaded in compliance with applicable laws, internal policies, and
          any required employee or third-party notices. You must not upload
          content that infringes third-party rights or violates applicable
          regulations.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use Neptune for unlawful purposes or to store malicious code.</li>
          <li>
            Attempt to access another customer&apos;s workspace or data without
            authorization.
          </li>
          <li>
            Reverse engineer, scrape, or interfere with the platform&apos;s
            security or performance.
          </li>
          <li>
            Misrepresent incidents, audits, permits, or compliance records in
            ways that could mislead regulators, auditors, or stakeholders.
          </li>
        </ul>
        <p>
          We may suspend or terminate access if we reasonably believe these
          rules have been violated or if continued use poses a security or legal
          risk.
        </p>
      </LegalSection>

      <LegalSection title="6. Subscriptions and fees">
        <p>
          Paid plans, billing cycles, and usage limits are described at the time
          of purchase or in your order form. Fees are non-refundable except
          where required by law or expressly stated in your agreement. Failure
          to pay may result in suspension of access after reasonable notice.
        </p>
      </LegalSection>

      <LegalSection title="7. Confidentiality and security">
        <p>
          We implement administrative, technical, and organizational measures
          designed to protect Customer Data. Details about how we collect and
          process personal information are described in our{" "}
          <Link
            href="/privacy"
            className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and limitation of liability">
        <p>
          Neptune is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. While the platform supports EHSS workflows, it
          does not replace professional judgment, regulatory advice, or your
          organization&apos;s legal obligations. You remain solely responsible
          for workplace safety, environmental compliance, and regulatory
          reporting decisions.
        </p>
        <p>
          To the fullest extent permitted by law, Neptune and its suppliers will
          not be liable for indirect, incidental, special, or consequential
          damages, or for loss of profits, data, or business opportunities
          arising from your use of the service. Our total liability for any
          claim relating to the service is limited to the fees you paid to us in
          the twelve months before the event giving rise to the claim.
        </p>
      </LegalSection>

      <LegalSection title="9. Term and termination">
        <p>
          You may stop using Neptune at any time. We may terminate or suspend
          access for breach of these Terms or upon reasonable notice if we
          discontinue the service. Upon termination, you may export Customer
          Data within the period described in your plan or agreement, after
          which we may delete data in accordance with our retention practices.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If changes are material,
          we will provide notice through the application or by email to
          workspace administrators. Continued use after the effective date
          constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these Terms can be sent to{" "}
          <Link
            href="mailto:legal@neptune-ehss.com"
            className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover"
          >
            legal@neptune-ehss.com
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
