import { redirect } from "next/navigation";

/** Scope=AssignedToMe now lives on the CAPA register filters. */
export default function MyCapasPage() {
  redirect("/dashboard/capa");
}
