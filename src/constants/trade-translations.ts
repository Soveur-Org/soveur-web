export const TRADE_NAME_FR: Record<string, string> = {
  plumber: "Plombier",
  heating_engineer: "Chauffagiste",
  electrician: "Électricien",
  mason: "Maçon",
  painter: "Peintre",
  tiler: "Carreleur",
  carpenter: "Menuisier",
  roofer: "Couvreur",
  landscaper: "Paysagiste",
  other: "Autre métier",
};

// Le libellé vient de l'API (référentiel des métiers du backend) ; la table
// ci-dessus ne sert que de secours si l'API ne le renvoie pas.
export function getTradeLabel(trade: {
  trade: string;
  customName?: string | null;
  label?: string | null;
}): string {
  if (trade.label) return trade.label;
  if (trade.trade === "other" && trade.customName) return trade.customName;
  return TRADE_NAME_FR[trade.trade] ?? trade.trade;
}
