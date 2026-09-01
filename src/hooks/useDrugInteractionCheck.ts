import { useMemo } from "react";
import type { PrescriptionDrugLine } from "@/types/prescription";

export interface DrugInteractionWarning {
  drugNames: [string, string];
  message: string;
}

/**
 * Drug Interaction Engine — placeholder implementation.
 *
 * TODO(AI team — Drug Interaction Engine owner): replace the body of this
 * hook with a real call to the interaction-checking service. The page that
 * consumes this hook (PrescriptionBuilderPage) should NOT need to change at
 * all when that happens — only this file does.
 *
 * Current behavior (mock): flags a warning whenever 2+ drugs are added,
 * purely so the UI for showing a warning exists and can be reviewed. This is
 * not a real interaction check and must not be treated as clinical advice.
 */
export function useDrugInteractionCheck(drugs: PrescriptionDrugLine[]): DrugInteractionWarning[] {
  return useMemo(() => {
    if (drugs.length < 2) return [];

    // Mock: pair up the first two drugs as a placeholder warning.
    return [
      {
        drugNames: [drugs[0].drug.name, drugs[1].drug.name],
        message: "تحذير تجريبي (mock) — لسه مش محرك تعارض حقيقي.",
      },
    ];
  }, [drugs]);
}
