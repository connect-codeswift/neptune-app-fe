import { redirect } from "next/navigation";

/**
 * Account settings moved into the tabbed Settings page, so personal and company configuration
 * live in one place. Kept as a redirect rather than deleted: this path is in browser histories,
 * bookmarks and at least one emailed link.
 */
export default function AccountSettingsPage() {
  redirect("/dashboard/settings/profile");
}
