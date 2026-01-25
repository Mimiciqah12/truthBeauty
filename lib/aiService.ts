
const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export const analyzeIngredientWithAI = async (ingredientName: string) => {
  if (!ingredientName) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a friendly expert dermatologist. You provide detailed, educational, and safe advice. You MUST return ONLY valid JSON."
          },
          {
            role: "user",
            content: `
              Analyze this skincare ingredient list: "${ingredientName}".

              Strictly follow this JSON structure. Provide translations for English (en) and Malay (ms).

              {
                "overallLevel": "SAFE" | "CAUTION" | "AVOID",
                "health_score": (integer 0-100),
                
                "verdict_title_en": "A short, catchy title (e.g., 'Great for Hydration')",
                "verdict_title_ms": "Tajuk pendek menarik (e.g., 'Sangat Bagus untuk Hidrasi')",
                
                "verdict_description_en": "A conversational paragraph (2-3 sentences). Mention key 'hero' ingredients by name and explain what they do. Explain why it is safe or risky. Tone: Helpful expert.",
                "verdict_description_ms": "Satu perenggan perbualan (2-3 ayat). Sebut nama bahan 'hero' utama dan terangkan fungsinya. Terangkan kenapa ia selamat atau berisiko. Nada: Pakar yang membantu.",
                
                "hero_ingredients": ["Ingredient A", "Ingredient B"],

                "ingredients": [
                  {
                    "name": "Ingredient Name",
                    "level": "SAFE" | "CAUTION" | "AVOID",
                    
                    "function_en": "Specific function (e.g., Humectant)",
                    "function_ms": "Fungsi spesifik (e.g., Humektan)",
                    
                    "explanation_en": "Detailed scientific mechanism (how it works).",
                    "explanation_ms": "Mekanisme saintifik terperinci (bagaimana ia berfungsi).",
                    
                    "suitableFor_en": ["Oily Skin", "Dry Skin"],
                    "suitableFor_ms": ["Kulit Berminyak", "Kulit Kering"]
                  }
                ]
              }
            `
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3, 
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("Network Error");
    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
        return JSON.parse(data.choices[0].message.content);
    } else {
        throw new Error("Empty response");
    }

  } catch (error: any) {
    console.error("⚠️ AI ERROR:", error.message);
   
    return {
      overallLevel: "CAUTION",
      health_score: 50,
      verdict_title_en: "Analysis Failed",
      verdict_title_ms: "Analisis Gagal",
      verdict_description_en: "We could not connect to the AI server. Please check your internet connection.",
      verdict_description_ms: "Kami tidak dapat menyambung ke pelayan AI. Sila semak sambungan internet anda.",
      hero_ingredients: [],
      ingredients: [
        {
          name: ingredientName,
          level: "CAUTION",
          function_en: "Unknown",
          function_ms: "Tidak Diketahui",
          explanation_en: "Could not analyze due to network error.",
          explanation_ms: "Tidak dapat dianalisis kerana ralat rangkaian.",
          suitableFor_en: ["Unknown"],
          suitableFor_ms: ["Tidak Diketahui"]
        }
      ]
    };
  }
};