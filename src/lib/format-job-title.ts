const ACRONYMS: Readonly<Record<string, string>> = {
  ehs: "EHS",
  bbs: "BBS",
  ppe: "PPE",
  capa: "CAPA",
  sds: "SDS",
};

/**
 * Turns a role name into something presentable — "ehs_manager" becomes "EHS Manager". Used as
 * the display fallback for accounts with no job title set, which is every account created
 * before the field existed.
 */
export function formatJobTitleLabel(
  role: string | null | undefined,
): string | null {
  if (!role?.trim()) {
    return null;
  }

  return role
    .trim()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower in ACRONYMS) {
        return ACRONYMS[lower];
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
