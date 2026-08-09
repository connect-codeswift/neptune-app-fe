"use client";

import { Icon } from "@iconify/react";
import { useState, type SubmitEvent } from "react";
import { Text } from "@/components/Text";
import { EmailInput } from "@/components/inputs/EmailInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

const INVITE_ROLES = [
  { value: "ehs-manager", label: "EHS Manager" },
  { value: "site-supervisor", label: "Site Supervisor" },
  { value: "safety-officer", label: "Safety Officer" },
  { value: "auditor", label: "Auditor" },
  { value: "viewer", label: "Viewer" },
] as const;

const DEFAULT_ROLE = INVITE_ROLES[0].value;

type InviteRole = (typeof INVITE_ROLES)[number]["value"];

export type Invite = Readonly<{
  id: string;
  email: string;
  role: InviteRole;
}>;

function getRoleLabel(role: InviteRole) {
  return INVITE_ROLES.find((option) => option.value === role)?.label ?? role;
}

function getInitials(email: string) {
  const localPart = email.split("@")[0] ?? "";
  return localPart.slice(0, 2).toUpperCase() || "?";
}

function getEmailPlaceholder(organizationName: string) {
  const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return slug ? `name@${slug}.org` : "name@company.com";
}

export type InviteTeamStepProps = Readonly<{
  organizationName: string;
  invites: Invite[];
  onInvitesChange: (invites: Invite[]) => void;
  onBack: () => void;
  onLeaveSetup: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitError?: string;
}>;

export function InviteTeamStep(props: Readonly<InviteTeamStepProps>) {
  const {
    organizationName,
    invites,
    onInvitesChange,
    onBack,
    onLeaveSetup,
    isSubmitting = false,
    submitError,
  } = props;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>(DEFAULT_ROLE);

  const workspaceName = organizationName.trim() || "your workspace";

  const handleAddInvite = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const alreadyInvited = invites.some(
      (invite) => invite.email.toLowerCase() === normalizedEmail,
    );

    if (!alreadyInvited) {
      onInvitesChange([
        ...invites,
        { id: globalThis.crypto.randomUUID(), email: email.trim(), role },
      ]);
    }

    setEmail("");
    setRole(DEFAULT_ROLE);
  };

  const handleRemoveInvite = (id: string) => {
    onInvitesChange(invites.filter((invite) => invite.id !== id));
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Text as="h1" className="text-ehs-darker text-2xl font-bold">
          Invite your team.
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text max-w-xl text-sm leading-snug"
        >
          {`Bring in the people who'll report, review and close out work. We'll email them an invite to join ${workspaceName}.`}
        </Text>
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={handleAddInvite}
      >
        <EmailInput
          id="invite-email"
          name="inviteEmail"
          placeholder={getEmailPlaceholder(organizationName)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address to invite"
          className="min-w-0 flex-1"
          wrapperClassName="min-w-0 flex-1"
          required
        />
        <SelectInput
          id="invite-role"
          name="inviteRole"
          placeholder="Select role"
          options={INVITE_ROLES}
          value={role}
          onChange={(e) => setRole(e.target.value as InviteRole)}
          aria-label="Role for the invited person"
          className="sm:w-44"
          required
        />
        <Button type="submit" variant="tertiary" className="shrink-0">
          <Icon icon="mdi:plus" className="text-sm" aria-hidden="true" />
          Add
        </Button>
      </form>

      {invites.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="bg-ehs-normal-blue text-ehs-light-text flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              >
                {getInitials(invite.email)}
              </span>

              <Text
                as="p"
                className="text-ehs-darker min-w-0 flex-1 truncate text-sm font-medium"
              >
                {invite.email}
              </Text>

              <Text
                as="span"
                className="bg-ehs-light-blue text-ehs-dark-blue shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {getRoleLabel(invite.role)}
              </Text>

              <IconButton
                type="button"
                variant="ghost"
                aria-label={`Remove invite for ${invite.email}`}
                onClick={() => handleRemoveInvite(invite.id)}
                className="size-7 shrink-0 text-base"
              >
                <Icon icon="mdi:close" aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center">
          <Text as="p" className="text-ehs-muted-text mt-3 text-center text-sm">
            No invites yet!
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-1 text-center text-sm">
            Add colleagues above or finish setup and invite them later.
          </Text>
        </div>
      )}

      {submitError ? (
        <Text as="p" className="text-ehs-red mt-2 text-sm" role="alert">
          {submitError}
        </Text>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="tertiary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <Icon
            icon="mdi:chevron-left"
            className="text-lg"
            aria-hidden="true"
          />
          Back
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-ehs-muted-text hidden items-center gap-2 text-sm lg:flex">
            <span
              aria-hidden="true"
              className="bg-ehs-green size-2 rounded-full"
            />
            <span>Progress saved automatically</span>
          </span>
          <Button
            type="button"
            variant="primary"
            onClick={() => void onLeaveSetup()}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Finishing setup..." : "Finish setup"}
          </Button>
        </div>
      </div>
    </>
  );
}
