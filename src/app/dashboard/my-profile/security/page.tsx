import { redirect } from "next/navigation";

/** Moved into the tabbed Settings page — see the sibling settings route for why. */
export default function AccountSecurityPage() {
  redirect("/dashboard/settings/security");
}
