import { redirect } from "next/navigation";

export default function AuditsDashboardPage() {
  redirect("/dashboard/audits/list");
}
