import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Dashboard" />
      <div className="flex-1 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text mb-6 text-sm">
          Welcome back, Sarah. Select a module from the sidebar to get started.
        </Text>
        <div className="border-ehs-border bg-ehs-light-text grid gap-4 rounded-2xl border p-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Open incidents", value: "12" },
            { label: "Near misses", value: "19" },
            { label: "Active hazards", value: "44" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-ehs-border bg-ehs-light-bg rounded-xl border px-4 py-5"
            >
              <Text as="p" className="text-ehs-muted-text text-sm">
                {stat.label}
              </Text>
              <Text
                as="p"
                className="text-ehs-darker mt-2 text-3xl font-bold tabular-nums"
              >
                {stat.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
