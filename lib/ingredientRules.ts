type SafetyLevel = "SAFE" | "CAUTION" | "AVOID";

export type IngredientResult = {
  name: string;
  level: SafetyLevel;
  function: string;
  explanation: string;
  suitableFor: string[];
  avoidIf: string[];
};

type DatabaseEntry = {
  name: string;
  level: SafetyLevel;
  function_en: string;
  explanation_en: string;
  function_ms: string;
  explanation_ms: string;
  suitableFor: string[];
  avoidIf: string[];
};

export function analyseIngredient(input: string, language: 'en' | 'ms' = 'en') {
  const ingredients = input
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  const database: DatabaseEntry[] = [
    {
      name: "Niacinamide",
      level: "SAFE",
      function_en: "Strengthens skin barrier and reduces oil",
      explanation_en: "Niacinamide helps improve the skin barrier, reduces redness, and controls excess oil with a very low risk of irritation.",
      function_ms: "Menguatkan penghalang kulit dan mengurangkan minyak",
      explanation_ms: "Niacinamide membantu memperbaiki penghalang kulit, mengurangkan kemerahan, dan mengawal minyak berlebihan dengan risiko iritasi yang sangat rendah.",
      suitableFor: ["Oily Skin", "Acne-prone Skin", "Sensitive Skin"],
      avoidIf: ["Very high concentration on damaged skin"],
    },
    {
      name: "Fragrance",
      level: "AVOID",
      function_en: "Adds scent to cosmetic products",
      explanation_en: "Fragrance is a common cause of irritation and allergic reactions, especially for sensitive or compromised skin.",
      function_ms: "Menambah wangian pada produk",
      explanation_ms: "Pewangi adalah punca biasa iritasi dan reaksi alahan, terutamanya untuk kulit sensitif atau kulit yang bermasalah.",
      suitableFor: ["Normal skin (low concentration only)"],
      avoidIf: ["Sensitive Skin", "Eczema", "Rosacea"],
    },
    {
      name: "Retinol",
      level: "CAUTION",
      function_en: "Boosts cell turnover and reduces signs of aging",
      explanation_en: "Retinol is a powerful vitamin A derivative that helps improve acne, fine lines, and skin texture. However, it can cause dryness, peeling, and irritation, especially for beginners.",
      function_ms: "Meningkatkan pembaharuan sel dan kurangkan penuaan",
      explanation_ms: "Retinol adalah derivatif vitamin A yang kuat membantu jerawat dan garis halus. Namun, ia boleh menyebabkan kekeringan, pengelupasan, dan iritasi, terutamanya untuk pengguna baru.",
      suitableFor: ["Oily Skin", "Acne-prone Skin", "Aging Skin"],
      avoidIf: ["Sensitive Skin", "Pregnant or breastfeeding users", "Compromised skin barrier"],
    },
    {
      name: "Sulfates",
      level: "AVOID",
      function_en: "Cleansing and foaming agent",
      explanation_en: "Sulfates can strip the skin of its natural oils, leading to dryness, irritation, and barrier damage when used frequently.",
      function_ms: "Agen pembersih dan pembuih",
      explanation_ms: "Sulfat boleh menghilangkan minyak semula jadi kulit, menyebabkan kekeringan, iritasi, dan kerosakan penghalang kulit jika digunakan terlalu kerap.",
      suitableFor: ["Very oily skin (occasional use only)"],
      avoidIf: ["Dry Skin", "Sensitive Skin", "Eczema", "Damaged skin barrier"],
    },
  ];

  const results: IngredientResult[] = ingredients.map((name) => {
    const found = database.find(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );

    if (found) {
      return {
        name: found.name,
        level: found.level,
        function: language === 'ms' ? found.function_ms : found.function_en,
        explanation: language === 'ms' ? found.explanation_ms : found.explanation_en,
        suitableFor: found.suitableFor,
        avoidIf: found.avoidIf,
      };
    }

    return {
      name,
      level: "CAUTION",
      function: language === 'ms' ? "Fungsi tidak diketahui" : "Unknown function",
      explanation: language === 'ms' 
        ? "Data saintifik terhad untuk bahan ini. Ujian tampalan (patch test) disyorkan sebelum penggunaan." 
        : "There is limited scientific data available for this ingredient. Patch testing is recommended before use.",
      suitableFor: ["Unknown"],
      avoidIf: ["Sensitive skin"],
    };
  });

  const overallLevel: SafetyLevel = results.some((i) => i.level === "AVOID")
    ? "AVOID"
    : results.some((i) => i.level === "CAUTION")
    ? "CAUTION"
    : "SAFE";

  /* ===== OVERALL SUMMARY ===== */
  let summary = "";
  if (language === 'ms') {
    summary = overallLevel === "SAFE"
      ? "Bahan-bahan ini secara umumnya selamat untuk kebanyakan jenis kulit apabila digunakan dengan betul."
      : overallLevel === "CAUTION"
      ? "Sesetengah bahan mungkin menyebabkan iritasi bergantung pada jenis kulit atau kepekatan."
      : "Satu atau lebih bahan mungkin merengsakan atau membahayakan kulit sensitif dan harus dielakkan.";
  } else {
    summary = overallLevel === "SAFE"
      ? "These ingredients are generally safe for most skin types when used appropriately."
      : overallLevel === "CAUTION"
      ? "Some ingredients may cause irritation depending on skin type or concentration."
      : "One or more ingredients may irritate or harm sensitive skin and should be avoided.";
  }

  return {
    overallLevel,
    summary,
    ingredients: results,
  };
}