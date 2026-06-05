import { Icon } from "@iconify/react";
import { LogoIcon } from "@/components/LogoIcon";

const panelCardClass =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm";

const incidents = [
  {
    title: "Chemical spill — Storage B",
    location: "Birmingham Plant",
    time: "12 min ago",
  },
  {
    title: "Machine stoppage — Line 4",
    location: "Leeds Plant",
    time: "1 hr ago",
  },
  {
    title: "Near miss — Loading bay",
    location: "Manchester Depot",
    time: "3 hrs ago",
  },
] as const;

const capas = [
  {
    title: "Install secondary containment",
    assignee: "J. Harris",
    due: "Jun 4",
  },
  {
    title: "Retrain Line 4 operators",
    assignee: "M. Price",
    due: "Jun 3",
  },
] as const;

export function LoginLeftPanel() {
  return (
    <div className="bg-ehs-dark-bg relative hidden h-full flex-col overflow-hidden px-12 py-6 lg:flex">
      <div className="bg-ehs-normal-blue pointer-events-none absolute -top-32 -left-32 h-125 w-125 rounded-full opacity-15 blur-3xl" />
      <div className="from-ehs-normal-blue/10 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent to-black/20" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
        <LogoIcon variant="light" />

        <div className="space-y-3">
          <p className="text-ehs-muted-text text-xs font-semibold tracking-widest uppercase">
            Your workspace is waiting
          </p>
          <h1 className="text-ehs-light-text max-w-md text-4xl leading-tight font-bold">
            Items requiring
            <br />
            your attention.
          </h1>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          <section className={panelCardClass}>
            <h2 className="text-ehs-light-text mb-3 text-sm font-semibold">
              Open Incidents
            </h2>
            <ul className="divide-y divide-white/10">
              {incidents.map((incident) => (
                <li key={incident.title} className="py-2 first:pt-0 last:pb-0">
                  <p className="text-ehs-light-text text-sm font-medium">
                    {incident.title}
                  </p>
                  <p className="text-ehs-muted-text mt-1 text-xs">
                    {incident.location} · {incident.time}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={panelCardClass}>
            <h2 className="text-ehs-light-text mb-3 text-sm font-semibold">
              Pending CAPAs
            </h2>
            <ul className="divide-y divide-white/10">
              {capas.map((capa) => (
                <li
                  key={capa.title}
                  className="flex items-start gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <Icon
                    icon="mdi:bullhorn-outline"
                    className="text-ehs-muted-text shrink-0 text-base"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ehs-light-text text-sm font-medium">
                      {capa.title}
                    </p>
                    <p className="text-ehs-muted-text text-xs">
                      {capa.assignee}
                    </p>
                  </div>
                  <span className="text-ehs-muted-text shrink-0 text-xs">
                    {capa.due}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${panelCardClass} flex items-start gap-3`}>
            <div className="bg-ehs-normal-blue/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Icon
                icon="mdi:clipboard-text-outline"
                className="text-ehs-normal-blue text-lg"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-ehs-light-text text-sm font-semibold">
                OSHA inspection — Leeds Plant
              </p>
              <p className="text-ehs-muted-text text-xs leading-relaxed">
                Scheduled for Thu 5 Jun · Preparation 78% complete
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
