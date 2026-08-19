import { redirect } from "next/navigation";

/** Legacy placeholder route — Medical Surveillance is the designed fifth tab. */
export default function IhReportsRedirectPage() {
  redirect("/dashboard/industrial-hygiene/medical-surveillance");
}
