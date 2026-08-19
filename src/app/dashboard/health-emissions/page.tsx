import { redirect } from "next/navigation";

/** Legacy route — Industrial Hygiene now lives at `/dashboard/industrial-hygiene`. */
export default function HealthEmissionsPage() {
  redirect("/dashboard/industrial-hygiene");
}
