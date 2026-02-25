export const CATEGORY_NAME_FR: Record<string, string> = {
  commerceSalesAndMarketing: "Commerce, ventes et marketing",
  transportLogisticsAndServices: "Transport, logistique et services",
  educationAndTraining: "Education et formation",
  craftAndConstruction: "Artisanat et construction",
  emergencySecurityAndRescue: "Urgence, securite et secours",
  itAndDigital: "Informatique et numerique",
  communicationMediaAndCreation: "Communication, medias et creation",
  healthAndSocial: "Sante et social",
};

export function translateCategoryNameToFrench(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  return CATEGORY_NAME_FR[rawName] ?? rawName;
}
