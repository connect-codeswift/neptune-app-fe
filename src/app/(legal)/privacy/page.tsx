import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Neptune EHSS",
  description:
    "Privacy Policy for Neptune, the environment, health, safety, and sustainability management platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div>
        <h1>Privacy Policy</h1>
        <p>Last updated: June 4, 2026</p>
      </div>

      <div>
        <h2>1. Overview</h2>
        <p>
          Neptune (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides
          EHSS management software that helps organizations report incidents,
          manage corrective actions, run compliance audits, and track safety and
          sustainability performance. This Privacy Policy explains how we
          collect, use, and protect personal information when you use our
          website and cloud platform.
        </p>
      </div>

      <div>
        <h2>2. Information we collect</h2>
        <p>We collect information in the following categories:</p>
        <ul>
          <li>
            <strong>Account information</strong> — name, email address, password
            (stored in hashed form), job title, and workspace role.
          </li>
          <li>
            <strong>Organization and site data</strong> — company name,
            industry, regions, site details, and module configuration you
            provide during onboarding or administration.
          </li>
          <li>
            <strong>EHSS operational data</strong> — incident reports,
            investigation notes, CAPA assignments, audit responses, permit
            records, training completions, attachments, and other content your
            organization submits to the platform.
          </li>
          <li>
            <strong>Usage and technical data</strong> — log data, device and
            browser type, IP address, pages viewed, feature usage, and
            diagnostic information used to secure and improve the service.
          </li>
          <li>
            <strong>Communications</strong> — support requests, product
            feedback, and messages you send to us.
          </li>
        </ul>
      </div>

      <div>
        <h2>3. How we use information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>Provide, maintain, and secure the Neptune platform.</li>
          <li>
            Authenticate users, manage workspaces, and enforce role-based
            access.
          </li>
          <li>
            Process EHSS workflows on behalf of your organization, such as
            incident notifications and audit trails.
          </li>
          <li>
            Send service-related messages, including security alerts and account
            notices.
          </li>
          <li>
            Analyze aggregated usage to improve reliability, performance, and
            product design.
          </li>
          <li>Comply with legal obligations and respond to lawful requests.</li>
        </ul>
        <p>
          We do not sell personal information. We do not use Customer Data to
          train public AI models without your organization&apos;s explicit
          consent.
        </p>
      </div>

      <div>
        <h2>4. How we share information</h2>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> — cloud hosting, email delivery,
            analytics, and customer support vendors that process data under
            contract and only as instructed by us.
          </li>
          <li>
            <strong>Your organization</strong> — workspace administrators and
            authorized users within your company, according to permissions you
            configure.
          </li>
          <li>
            <strong>Legal and safety reasons</strong> — when required by law, to
            protect rights and safety, or to respond to valid legal process.
          </li>
          <li>
            <strong>Business transfers</strong> — in connection with a merger,
            acquisition, or sale of assets, subject to continued protection of
            personal information.
          </li>
        </ul>
      </div>

      <div>
        <h2>5. Data retention</h2>
        <p>
          We retain personal information for as long as your organization
          maintains an active workspace or as needed to provide the service.
          EHSS records may be retained according to your organization&apos;s
          settings and applicable regulatory requirements. When data is deleted,
          we follow secure deletion practices within a reasonable period,
          subject to backup and legal retention obligations.
        </p>
      </div>

      <div>
        <h2>6. Security</h2>
        <p>
          We use industry-standard safeguards, including encryption in transit,
          access controls, audit logging, and regular monitoring. No method of
          transmission or storage is completely secure; you are responsible for
          safeguarding your login credentials and notifying us promptly of
          suspected unauthorized access.
        </p>
      </div>

      <div>
        <h2>7. International transfers</h2>
        <p>
          Neptune may process and store information in countries other than
          where your organization is located. Where required, we use appropriate
          safeguards such as standard contractual clauses to protect personal
          information transferred across borders.
        </p>
      </div>

      <div>
        <h2>8. Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, or restrict processing of your personal information, or to
          object to certain processing and request data portability. Workspace
          users should contact their organization&apos;s administrator first;
          administrators may contact us to fulfill requests related to Customer
          Data.
        </p>
        <p>
          You may opt out of non-essential marketing emails using the
          unsubscribe link in those messages. Service-related communications may
          still be sent when necessary to operate your account.
        </p>
      </div>

      <div>
        <h2>9. Children</h2>
        <p>
          Neptune is a business service intended for use by organizations and
          their personnel. It is not directed to children under 16, and we do
          not knowingly collect personal information from children.
        </p>
      </div>

      <div>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated through the application or by email to workspace
          administrators. The &quot;Last updated&quot; date at the top of this
          page indicates when the policy was last revised.
        </p>
      </div>

      <div>
        <h2>11. Contact us</h2>
        <p>
          For privacy questions or requests, contact{" "}
          <a href="mailto:privacy@neptune-ehss.com">privacy@neptune-ehss.com</a>
          . Our use of the service is also governed by our{" "}
          <Link href="/tos">Terms of Service</Link>.
        </p>
      </div>
    </>
  );
}
