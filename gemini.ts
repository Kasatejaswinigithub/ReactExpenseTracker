
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const GeminiService = {
  async getFinancialAdvisor(transactions: Transaction[], username: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const summary = transactions.map(t => `${t.date}: ${t.type} of $${t.amount} for ${t.category}`).join('\n');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a world-class financial advisor. Analyze the following spending for ${username}:\n\n${summary}\n\nProvide 3 concise, actionable wealth-building tips based on this data. Keep it motivating and professional.`,
      });
      return response.text || "I need more data to provide a solid analysis.";
    } catch (error) {
      console.error(error);
      return "Failed to connect to AI advisor.";
    }
  },

  async animateImage(base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Check for API key selection for Veo models
    if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
            // Proceed assuming selection was successful per guidelines
        }
    }

    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this photo with cinematic movement and lighting',
        image: {
          imageBytes: base64Image.split(',')[1],
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed");
      
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
            if (window.aistudio) await window.aistudio.openSelectKey();
        }
        throw error;
    }
  }
};
