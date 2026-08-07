import { redirect } from "next/navigation";
import { DEFAULT_SETTINGS_HREF } from "@/components/settings/settings-nav";

/** Legacy route — incident settings moved under global Settings. */
export default function LegacyIncidentsSettingsPage() {
  redirect(DEFAULT_SETTINGS_HREF);
}
