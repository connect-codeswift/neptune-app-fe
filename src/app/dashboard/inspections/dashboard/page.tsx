import { redirect } from "next/navigation";

export default function InspectionsDashboardPage() {
  redirect("/dashboard/inspections/list");
}
