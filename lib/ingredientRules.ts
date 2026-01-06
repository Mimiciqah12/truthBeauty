type SafetyLevel = "SAFE" | "CAUTION" | "AVOID";

type IngredientResult = {
  name: string;
  level: SafetyLevel;
  function: string;
  explanation: string;
  suitableFor: string[];
  avoidIf: string[];
};

export function analyseIngredient(input: string) {
  const ingredients = input
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  const database: IngredientResult[] = [
  {
    name: "Niacinamide",
    level: "SAFE",
    function: "Strengthens skin barrier and reduces oil",
    explanation:
      "Niacinamide helps improve the skin barrier, reduces redness, and controls excess oil with a very low risk of irritation.",
    suitableFor: ["Oily Skin", "Acne-prone Skin", "Sensitive Skin"],
    avoidIf: ["Very high concentration on damaged skin"],
  },

  {
    name: "Fragrance",
    level: "AVOID",
    function: "Adds scent to cosmetic products",
    explanation:
      "Fragrance is a common cause of irritation and allergic reactions, especially for sensitive or compromised skin.",
    suitableFor: ["Normal skin (low concentration only)"],
    avoidIf: ["Sensitive Skin", "Eczema", "Rosacea"],
  },

  {
    name: "Retinol",
    level: "CAUTION",
    function: "Boosts cell turnover and reduces signs of aging",
    explanation:
      "Retinol is a powerful vitamin A derivative that helps improve acne, fine lines, and skin texture. However, it can cause dryness, peeling, and irritation, especially for beginners.",
    suitableFor: ["Oily Skin", "Acne-prone Skin", "Aging Skin"],
    avoidIf: [
      "Sensitive Skin",
      "Pregnant or breastfeeding users",
      "Compromised skin barrier",
    ],
  },

  {
    name: "Sulfates",
    level: "AVOID",
    function: "Cleansing and foaming agent",
    explanation:
      "Sulfates can strip the skin of its natural oils, leading to dryness, irritation, and barrier damage when used frequently.",
    suitableFor: ["Very oily skin (occasional use only)"],
    avoidIf: ["Dry Skin", "Sensitive Skin", "Eczema", "Damaged skin barrier"],
  },
];


  const results: IngredientResult[] = ingredients.map((name) => {
    const found = database.find(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );

    return (
      found || {
        name,
        level: "CAUTION",
        function: "Unknown function",
        explanation:
          "There is limited scientific data available for this ingredient. Patch testing is recommended before use.",
        suitableFor: ["Unknown"],
        avoidIf: ["Sensitive skin"],
      }
    );
  });

  /* ===== OVERALL SAFETY LEVEL ===== */
  const overallLevel: SafetyLevel = results.some((i) => i.level === "AVOID")
    ? "AVOID"
    : results.some((i) => i.level === "CAUTION")
    ? "CAUTION"
    : "SAFE";

  /* ===== OVERALL SUMMARY ===== */
  const summary =
    overallLevel === "SAFE"
      ? "These ingredients are generally safe for most skin types when used appropriately."
      : overallLevel === "CAUTION"
      ? "Some ingredients may cause irritation depending on skin type or concentration."
      : "One or more ingredients may irritate or harm sensitive skin and should be avoided.";

  return {
    overallLevel,
    summary,
    ingredients: results,
  };
}
