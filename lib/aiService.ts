
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY; 

export const analyzeIngredientWithAI = async (ingredientName: string) => {
  try {
    console.log("🔄 Sending to Groq...", ingredientName);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a skincare expert. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: `
              Analyze: "${ingredientName}".
              Return JSON structure:
              {
                "overallLevel": "SAFE" | "CAUTION" | "AVOID",
                "summary": "String",
                "ingredients": [
                  {
                    "name": "String",
                    "level": "SAFE" | "CAUTION" | "AVOID",
                    "function": "String",
                    "explanation": "String",
                    "suitableFor": ["String"]
                  }
                ]
              }
            `
          }
        ],
        
        model: "llama-3.3-70b-versatile", 
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

   
    if (data.error) {
        console.error("❌ Groq API Error:", data.error.message);
        throw new Error(data.error.message);
    }

    if (data.choices && data.choices[0]?.message?.content) {
        const jsonStr = data.choices[0].message.content;
        console.log("✅ AI Success!");
        return JSON.parse(jsonStr);
    } else {
        throw new Error("Empty response from AI");
    }

  } catch (error) {
    console.log("⚠️ AI Failed, using MOCK data.");
    
    
    return {
      overallLevel: "SAFE",
      summary: "AI unavailable. Showing demo result for: " + ingredientName,
      ingredients: [
        {
          name: ingredientName || "Ingredient",
          level: "SAFE",
          function: "Moisturizer (Demo)",
          explanation: "This is a placeholder because the AI model is updating.",
          suitableFor: ["All Skin Types"]
        }
      ]
    };
  }
};