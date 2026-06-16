export type DiseaseType = {
  value: string;
  label: string;
};

// Disease/condition templates. Vitals are NOT hardcoded per patient — each type
// maps to a set of vital_templates seeded in the database (condition_type column).
export const DISEASE_TYPES: DiseaseType[] = [
  { value: "diabetes", label: "Diabetes Follow-up" },
  { value: "hypertension", label: "Hypertension Follow-up" },
  { value: "copd", label: "COPD Monitoring" },
  { value: "post_surgery", label: "Post-Surgery Recovery" },
  { value: "general", label: "General / Custom" },
];

export function diseaseLabel(value: string): string {
  return DISEASE_TYPES.find((d) => d.value === value)?.label ?? value;
}

export const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-sky-100 text-sky-800 border-sky-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};
