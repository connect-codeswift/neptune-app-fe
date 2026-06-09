"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState, type CSSProperties } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const CONFETTI_COLORS = [
  "#0891a6",
  "#078395",
  "#067485",
  "#066d7d",
  "#b2dde3",
  "#e6f4f6",
] as const;

type ConfettiPiece = Readonly<{
  id: number;
  color: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  wide: boolean;
}>;

function createConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: 20 }, (_, index) => {
    const spread = index - 10;
    let direction: number;
    if (spread === 0) {
      direction = index % 2 === 0 ? -1 : 1;
    } else if (spread > 0) {
      direction = 1;
    } else {
      direction = -1;
    }

    return {
      id: index,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      x: spread * 5 + direction * (index % 4) * 3,
      y: -28 - (index % 5) * 10 - Math.abs(spread) * 2,
      rotate: (index * 41) % 360,
      delay: (index % 6) * 0.03,
      wide: index % 3 === 0,
    };
  });
}

function SuccessConfetti() {
  const pieces = useMemo(() => createConfettiPieces(), []);
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-[34%] z-20 size-0">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          aria-hidden="true"
          className={[
            "animate-confetti-burst absolute left-0 top-0 rounded-sm",
            piece.wide ? "h-1 w-2.5" : "h-2.5 w-1",
          ].join(" ")}
          style={
            {
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              "--confetti-x": `${piece.x}px`,
              "--confetti-y": `${piece.y}px`,
              "--confetti-rotate": `${piece.rotate}deg`,
            } as CSSProperties
          }
          onAnimationEnd={
            piece.id === pieces.length - 1 ? () => setVisible(false) : undefined
          }
        />
      ))}
    </div>
  );
}

type SetupStatProps = Readonly<{
  value: number;
  label: string;
}>;

function SetupStat(props: Readonly<SetupStatProps>) {
  const { value, label } = props;

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <Text as="span" className="text-ehs-normal-blue text-4xl font-bold">
        {value.toLocaleString()}
      </Text>
      <Text as="span" className="text-ehs-muted-text text-sm">
        {label}
      </Text>
    </div>
  );
}

function SuccessCheckIcon() {
  const [showRipples, setShowRipples] = useState(true);

  return (
    <div
      className="relative size-40 overflow-visible"
      aria-hidden="true"
    >
      {showRipples ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="border-ehs-normal-blue/45 pointer-events-none size-14 animate-check-ripple rounded-full border-2" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="border-ehs-normal-blue/35 pointer-events-none size-14 animate-check-ripple rounded-full border-2 [animation-delay:0.1s]"
              onAnimationEnd={() => setShowRipples(false)}
            />
          </div>
        </>
      ) : null}
      <SuccessConfetti />
      <div className="relative z-10 flex size-full items-center justify-center">
        <span className="bg-ehs-normal-blue shadow-ehs-normal-blue/30 flex size-24 items-center justify-center rounded-full shadow-md">
          <Icon icon="mdi:check" strokeWidth={3} className="text-ehs-light-text text-5xl" />
        </span>
      </div>
    </div>
  );
}

export type SetupCompleteModalProps = Readonly<{
  organizationName: string;
  siteCount: number;
  moduleCount: number;
  invitedCount: number;
  onEnterWorkspace: () => void;
}>;

export function SetupCompleteModal(props: Readonly<SetupCompleteModalProps>) {
  const {
    organizationName,
    siteCount,
    moduleCount,
    invitedCount,
    onEnterWorkspace,
  } = props;

  const workspaceName = organizationName.trim() || "your workspace";
  const titleId = "setup-complete-title";
  const descriptionId = "setup-complete-description";

  return (
    <div className="bg-ehs-darker/20 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex w-full max-w-md flex-col items-center overflow-visible rounded-3xl bg-white px-6 py-8 text-center shadow-xl"
      >
        <SuccessCheckIcon />

        <div id={titleId} className="text-ehs-darker mt-5 text-2xl font-bold">
          You&apos;re all set, {workspaceName}.
        </div>

        <Text
          as="p"
          id={descriptionId}
          className="text-ehs-muted-text mt-2 max-w-sm text-sm leading-relaxed"
        >
          Your workspace is configured. We&apos;ve pre-loaded compliance
          templates for your sites and emailed your team their invites.
        </Text>

        <div className="mt-6 flex w-full items-center justify-between gap-4 px-2">
          <SetupStat value={siteCount} label="Sites" />
          <SetupStat value={moduleCount} label="Modules" />
          <SetupStat value={invitedCount} label="Invited" />
        </div>

        <Button
          type="button"
          variant="primary"
          className="mt-8 w-full"
          onClick={onEnterWorkspace}
        >
          Enter workspace
          <Icon icon="mdi:arrow-right" className="text-lg" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
