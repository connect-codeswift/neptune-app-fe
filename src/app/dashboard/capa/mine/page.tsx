import { redirect } from "next/navigation";

/**
 * There is no "mine" view any more. The register already shows a Worker only the
 * CAPAs assigned to them or whose tasks they own - the API narrows it from the token,
 * so a separate route and a Scope parameter would both be describing the same thing.
 */
export default function MyCapasPage() {
  redirect("/dashboard/capa");
}
