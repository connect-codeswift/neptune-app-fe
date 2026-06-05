import { Icon } from "@iconify/react";
import { Logo } from "@/components/Logo";
import { ShadeBall } from "@/components/ShadeBall";

const panelCardClass =
  "rounded-2xl border border-white/10 bg-white/5 px-[1.064cqw] py-[0.8cqw] backdrop-blur-sm";

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
    <div className="bg-ehs-dark-bg relative hidden h-full flex-col justify-center overflow-hidden px-[3.2cqw] py-[0.8cqw] lg:flex">
      <ShadeBall positionAsClassName="top-[-150px] left-[-150px]" blur={40} />
      <ShadeBall positionAsClassName="bottom-[-150px] right-[-150px]" blur={40} />

      <div className="from-ehs-normal-blue/10 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent to-black/20" />

      <div className="relative z-10 flex min-h-0 flex-col gap-[1.064cqw]">
        <Logo variant="light" fluid />

        <div className="flex flex-col gap-[0.8cqw]">
          <p className="text-ehs-muted-text text-[0.8cqw] font-semibold tracking-widest uppercase">
            Your workspace is waiting
          </p>
          <h1 className="text-ehs-light-text text-[1.6cqw] leading-tight font-bold">
            Items requiring
            <br />
            your attention.
          </h1>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[0.8cqw] overflow-y-auto">
          <section className={panelCardClass}>
            <h2 className="text-ehs-light-text mb-[0.8cqw] text-[0.8cqw] font-semibold">
              Open Incidents
            </h2>
            <ul className="divide-y divide-white/10">
              {incidents.map((incident) => (
                <li
                  key={incident.title}
                  className="py-[0.536cqw] first:pt-0 last:pb-0"
                >
                  <p className="text-ehs-light-text text-[0.8cqw] font-medium">
                    {incident.title}
                  </p>
                  <p className="text-ehs-muted-text mt-[0.264cqw] text-[0.664cqw]">
                    {incident.location} · {incident.time}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className={panelCardClass}>
            <h2 className="text-ehs-light-text mb-[0.8cqw] text-[0.8cqw] font-semibold">
              Pending CAPAs
            </h2>
            <ul className="divide-y divide-white/10">
              {capas.map((capa) => (
                <li
                  key={capa.title}
                  className="flex items-start gap-[0.536cqw] py-[0.536cqw] first:pt-0 last:pb-0"
                >
                  <Icon
                    icon="mdi:bullhorn-outline"
                    className="text-ehs-muted-text shrink-0 text-[1.064cqw]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ehs-light-text text-[0.8cqw] font-medium">
                      {capa.title}
                    </p>
                    <p className="text-ehs-muted-text text-[0.664cqw]">
                      {capa.assignee}
                    </p>
                  </div>
                  <span className="text-ehs-muted-text shrink-0 text-[0.664cqw]">
                    {capa.due}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`rounded-2xl border-t border-white/60 bg-black/20 px-[1.064cqw] py-[0.8cqw] backdrop-blur-sm flex items-start gap-[0.8cqw]`}
          >
            <div className="bg-ehs-normal-blue/20 flex h-[2.664cqw] w-[2.664cqw] shrink-0 items-center justify-center rounded-xl">
              <Icon
                icon="mdi:clipboard-text-outline"
                className="text-ehs-normal-blue text-[1.2cqw]"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-ehs-light-text text-[0.8cqw] font-semibold">
                OSHA inspection — Leeds Plant
              </p>
              <p className="text-ehs-muted-text text-[0.664cqw] leading-relaxed">
                Scheduled for Thu 5 Jun · Preparation 78% complete
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
