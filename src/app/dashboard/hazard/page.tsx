import { redirect } from "next/navigation";

export default function HazardPage() {
  redirect("/dashboard/hazard/list");
}
