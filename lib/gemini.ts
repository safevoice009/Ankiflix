import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getIntelligenceInsight(title: string, description: string) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    // Fallback/Mock for local demo if no key is provided
    return `Artificial Intelligence insight for "${title}": This deck represents a high-authority intelligence asset. Mastery of this material will grant a 1% performance edge in your field. Synchronizing synaptic paths...`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are the Ankiflix Intelligence Engine. 
    A user is studying a flashcard deck titled "${title}".
    Description: "${description}"
    
    Provide a concise (2-3 sentences), cinematic, and high-authority explanation of why this material is critical to master and one specific "Synaptic Tip" for memorization.
    Maintain the Ankiflix "Premium Cinematic Mastery" tone.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Intelligence synchronization interrupted. Synaptic path remains stable.";
  }
}
