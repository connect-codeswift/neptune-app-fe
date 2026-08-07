"use client";

import { useState } from "react";
import { TextInput } from "@/components/inputs/TextInput";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import {
  AccountSettingsShell,
  settingsLabelClass,
} from "@/components/profile/AccountSettingsShell";
import { ToggleSwitch } from "@/components/profile/ToggleSwitch";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { toast } from "@/lib/toast";

export function AccountSettingsSecurityClient() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please complete all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    toast.success("Password updated");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AccountSettingsShell activeTab="security" showActions={false}>
      <GlassCard className="gap-5">
        <div>
          <Text
            as="h2"
            className="text-ehs-darker text-lg font-bold tracking-tight"
          >
            Security & Authentication
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
            Manage your password and two-factor authentication settings.
          </Text>
        </div>

        <div className="border-ehs-border/70 rounded-2xl border bg-white/70 p-5">
          <Text
            as="h3"
            className="text-ehs-darker text-base font-semibold"
          >
            Change Password
          </Text>

          <div className="mt-4 grid max-w-xl gap-4">
            <TextInput
              label="Current Password"
              labelClassName={settingsLabelClass}
              placeholder="Enter current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <TextInput
              label="New Password"
              labelClassName={settingsLabelClass}
              placeholder="Enter new password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <TextInput
              label="Confirm Password"
              labelClassName={settingsLabelClass}
              placeholder="Re-enter new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="primary"
            className="mt-5 rounded-lg px-4 py-2 text-sm"
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>
        </div>

        <div className="border-ehs-border/60 flex flex-wrap items-start justify-between gap-4 border-t pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text
                as="h3"
                className="text-ehs-darker text-base font-semibold"
              >
                Two-Factor Authentication (2FA)
              </Text>
              <IncidentBadge
                label={twoFactorEnabled ? "ENABLED" : "DISABLED"}
                tone={twoFactorEnabled ? "success" : "muted"}
                className="text-[10px] font-bold tracking-wide uppercase"
              />
            </div>
            <Text as="p" className="text-ehs-muted-text mt-1 max-w-xl text-sm">
              Requires a verification code during login to secure account access.
            </Text>
          </div>

          <ToggleSwitch
            label="Two-factor authentication"
            checked={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
          />
        </div>
      </GlassCard>
    </AccountSettingsShell>
  );
}
