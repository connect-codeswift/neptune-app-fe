import { redirect } from "next/navigation";
import { DEFAULT_SETTINGS_HREF } from "@/components/settings/settings-nav";

export default function SettingsIndexPage() {
  redirect(DEFAULT_SETTINGS_HREF);
}
