// Grille tarifaire partagée client/serveur (aucune donnée sensible).
export const PLANS = [
  { id: "p5", messages: 5, amountAr: 2000 },
  { id: "p10", messages: 10, amountAr: 3500, popular: true },
  { id: "p20", messages: 20, amountAr: 5000 },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

/** Message d'erreur renvoyé par le serveur quand le solde est épuisé. */
export const PAYWALL_CODE = "PAYWALL_REQUIRED";

export const formatAr = (n: number) => `${n.toLocaleString("fr-FR")} Ar`;
