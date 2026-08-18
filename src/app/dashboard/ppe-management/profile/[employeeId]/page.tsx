import { PpeEmployeeProfilePageClient } from "@/components/ppe/profile/PpeEmployeeProfilePageClient";

export type PpeEmployeeProfilePageProps = Readonly<{
  params: Promise<{ employeeId: string }>;
}>;

export default async function PpeEmployeeProfilePage(
  props: PpeEmployeeProfilePageProps,
) {
  const { employeeId } = await props.params;

  return (
    <PpeEmployeeProfilePageClient issueId={decodeURIComponent(employeeId)} />
  );
}
