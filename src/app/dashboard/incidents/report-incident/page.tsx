import { redirect } from "next/navigation";

export default function ReportIncidentRedirectPage() {
  redirect("/dashboard/incidents/report");
}
