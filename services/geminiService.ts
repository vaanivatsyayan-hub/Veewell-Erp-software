
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as required by the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const verifyGSTIN = async (gstin: string) => {
  if (!gstin) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Validate this Indian GSTIN format and simulate fetching legal details: ${gstin}. 
                 Return a JSON object with: isValid (boolean), legalName, tradeName, status (Active/Cancelled), and errorMessage if invalid.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            legalName: { type: Type.STRING },
            tradeName: { type: Type.STRING },
            status: { type: Type.STRING },
            errorMessage: { type: Type.STRING }
          },
          required: ["isValid"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("GST verification error:", error);
    return { isValid: false, errorMessage: "Verification failed. Please try again." };
  }
};

export const getFinancialSummary = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this ERP financial data and provide a professional 2-sentence summary of business health: ${JSON.stringify(data)}`,
    });
    return response.text;
  } catch (error) {
    return "Unable to generate insights at this moment.";
  }
};
