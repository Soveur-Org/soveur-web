export const CATEGORY_NAME_FR: Record<string, string> = {
  commerceSalesAndMarketing: "Commerce, ventes et marketing",
  transportLogisticsAndServices: "Transport, logistique et services",
  educationAndTraining: "Education et formation",
  craftAndConstruction: "Artisanat et construction",
  emergencySecurityAndRescue: "Urgence, securite et secours",
  itAndDigital: "Informatique et numerique",
  communicationMediaAndCreation: "Communication, medias et creation",
  healthAndSocial: "Sante et social",
  construction_renovation: "Construction et renovation",
  repair_emergency: "Reparation et urgence",
  garden_outdoor: "Jardin et exterieur",
  moving_transport: "Deménagement et transport",
  education_training: "Education et formation",
  digital_services: "Services numeriques",
  wellness_beauty: "Bien-etre et beaute",
  specialized_services: "Services specialises",
  automotive: "Automobile",
  cleaning_services: "Services de nettoyage",
  personal_services: "Services a la personne",
  events: "Evenementiel",
  professional_services: "Services professionnels",
};

export function translateCategoryNameToFrench(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  return CATEGORY_NAME_FR[rawName] ?? rawName;
}
