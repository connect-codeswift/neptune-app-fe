export type AuditTemplate = Readonly<{
  id: string;
  title: string;
  sectionCount: number;
  itemCount: number;
  /** Programme the template belongs to, e.g. "Safety". */
  category: string;
  /** Sites it applies to, e.g. "Manufacturing" or "All". */
  scope: string;
  lastUsed: string;
}>;
