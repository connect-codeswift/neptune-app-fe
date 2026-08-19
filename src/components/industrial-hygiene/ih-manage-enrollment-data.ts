import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  IH_SURVEILLANCE_PROGRAMS,
  type IhSurveillanceProgram,
} from "@/components/industrial-hygiene/ih-medical-surveillance-data";

export const IH_MEDICAL_SURVEILLANCE_PATH = `${IH_BASE_PATH}/medical-surveillance`;

export function ihManageEnrollmentPath(programId: string): string {
  return `${IH_MEDICAL_SURVEILLANCE_PATH}/${programId}`;
}

export type IhEnrollmentStatus = "Compliant" | "Overdue" | "Pending";

export type IhEnrollmentRow = Readonly<{
  id: string;
  name: string;
  department: string;
  lastExam: string;
  nextExamDue: string;
  status: IhEnrollmentStatus;
}>;

export type IhEnrollmentProgramDetail = Readonly<{
  program: IhSurveillanceProgram;
  employees: readonly IhEnrollmentRow[];
}>;

const HEARING_ENROLLMENT: readonly IhEnrollmentRow[] = [
  {
    id: "en-1",
    name: "Carlos Reyes",
    department: "Process Area B",
    lastExam: "2025-11-15",
    nextExamDue: "2026-11-15",
    status: "Compliant",
  },
  {
    id: "en-2",
    name: "Amy Chen",
    department: "Lab Operations",
    lastExam: "2025-10-02",
    nextExamDue: "2026-10-02",
    status: "Compliant",
  },
  {
    id: "en-3",
    name: "Tom Bradley",
    department: "Maintenance",
    lastExam: "2024-08-20",
    nextExamDue: "2025-08-20",
    status: "Overdue",
  },
  {
    id: "en-4",
    name: "Sam Okafor",
    department: "Battery Room",
    lastExam: "-",
    nextExamDue: "-",
    status: "Pending",
  },
  {
    id: "en-5",
    name: "Janet Flores",
    department: "Maintenance",
    lastExam: "2025-12-01",
    nextExamDue: "2026-12-01",
    status: "Compliant",
  },
  {
    id: "en-6",
    name: "Priya Sharma",
    department: "Quality Ctrl",
    lastExam: "2024-06-10",
    nextExamDue: "2025-06-10",
    status: "Overdue",
  },
];

const RESPIRATORY_ENROLLMENT: readonly IhEnrollmentRow[] = [
  {
    id: "en-r1",
    name: "James Torres",
    department: "Process Area A",
    lastExam: "2025-09-12",
    nextExamDue: "2026-09-12",
    status: "Compliant",
  },
  {
    id: "en-r2",
    name: "Lena Park",
    department: "Maintenance",
    lastExam: "2024-07-01",
    nextExamDue: "2025-07-01",
    status: "Overdue",
  },
  {
    id: "en-r3",
    name: "Amy Chen",
    department: "Lab Operations",
    lastExam: "2025-11-20",
    nextExamDue: "2026-11-20",
    status: "Compliant",
  },
];

const BENZENE_ENROLLMENT: readonly IhEnrollmentRow[] = [
  {
    id: "en-b1",
    name: "Carlos Reyes",
    department: "Process Area B",
    lastExam: "2025-12-10",
    nextExamDue: "2026-12-10",
    status: "Compliant",
  },
  {
    id: "en-b2",
    name: "Sarah Mitchell",
    department: "Lab 1",
    lastExam: "2026-01-08",
    nextExamDue: "2027-01-08",
    status: "Compliant",
  },
];

const LEAD_ENROLLMENT: readonly IhEnrollmentRow[] = [
  {
    id: "en-l1",
    name: "Sam Okafor",
    department: "Battery Room",
    lastExam: "2024-05-15",
    nextExamDue: "2025-05-15",
    status: "Overdue",
  },
  {
    id: "en-l2",
    name: "Tom Bradley",
    department: "Maintenance",
    lastExam: "-",
    nextExamDue: "-",
    status: "Pending",
  },
  {
    id: "en-l3",
    name: "Janet Flores",
    department: "Battery Room",
    lastExam: "2025-08-01",
    nextExamDue: "2026-08-01",
    status: "Compliant",
  },
];

const ASBESTOS_ENROLLMENT: readonly IhEnrollmentRow[] = [
  {
    id: "en-a1",
    name: "Priya Sharma",
    department: "Quality Ctrl",
    lastExam: "2025-09-01",
    nextExamDue: "2026-09-01",
    status: "Compliant",
  },
  {
    id: "en-a2",
    name: "James Torres",
    department: "Fabrication Hall",
    lastExam: "2025-10-15",
    nextExamDue: "2026-10-15",
    status: "Compliant",
  },
];

const ENROLLMENT_BY_PROGRAM: Record<string, readonly IhEnrollmentRow[]> = {
  "sv-1": HEARING_ENROLLMENT,
  "sv-2": RESPIRATORY_ENROLLMENT,
  "sv-3": BENZENE_ENROLLMENT,
  "sv-4": LEAD_ENROLLMENT,
  "sv-5": ASBESTOS_ENROLLMENT,
};

export function getIhEnrollmentProgramDetail(
  programId: string,
): IhEnrollmentProgramDetail | null {
  const program = IH_SURVEILLANCE_PROGRAMS.find(
    (item) => item.id === programId,
  );
  if (!program) return null;

  return {
    program,
    employees: ENROLLMENT_BY_PROGRAM[programId] ?? [],
  };
}

export function ihEnrollmentSubtitle(program: IhSurveillanceProgram): string {
  return `${program.regulation} · ${program.frequency} exams · ${String(program.enrolled)} enrolled`;
}

export function ihEmployeeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}
