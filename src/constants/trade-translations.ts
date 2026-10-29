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

export function getTradeLabel(trade: {
  trade: string;
  customName?: string | null;
}): string {
  if (trade.trade === "other" && trade.customName) return trade.customName;
  return TRADE_NAME_FR[trade.trade] ?? trade.trade;
}
