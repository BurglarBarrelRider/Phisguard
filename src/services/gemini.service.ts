import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../models/report.model';

// This is a placeholder for the actual API key.
// In a real application, this should be handled securely.
declare var process: any;

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly MODEL_NAME = 'gemini-2.5-flash';
  private responseSchema = {
    type: Type.OBJECT,
    properties: {
      isPhishing: { type: Type.BOOLEAN, description: "True if the email is likely a phishing attempt, otherwise false." },
      confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating the confidence in the phishing assessment. 1.0 is highest confidence." },
      summary: { type: Type.STRING, description: "A detailed, multi-sentence summary of the analysis. Explain the core threat and why the email is considered malicious or safe." },
      redFlags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "The category of the red flag (e.g., 'Suspicious Link', 'Urgency', 'Sender Anomaly', 'Generic Greeting', 'Grammatical Errors')." },
            description: { type: Type.STRING, description: "A detailed explanation of the specific red flag found in the email, quoting the problematic part if possible." }
          },
          required: ['category', 'description']
        }
      },
      recommendedAction: { type: Type.STRING, description: "A clear, direct instruction for the user. Examples: 'Delete this email immediately and do not click any links.', 'Mark as spam and block the sender.', 'It is safe to reply, but remain cautious.'" },
      educationalTakeaway: { type: Type.STRING, description: "A brief educational point explaining the tactic used in the email and how the user can spot similar threats in the future. For example: 'This email uses a common tactic of misspelling a brand's domain to appear legitimate. Always double-check sender addresses.'" }
    },
    required: ['isPhishing', 'confidenceScore', 'summary', 'redFlags', 'recommendedAction', 'educationalTakeaway']
  };

  constructor() {
    try {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI. API key might be missing.', e);
    }
  }

  async analyzeEmail(emailContent: string): Promise<AnalysisResult> {
    if (!this.ai) {
      throw new Error("Gemini AI client is not initialized. Check API key.");
    }

    const systemInstruction = "You are an expert cybersecurity analyst specializing in identifying phishing emails. Analyze the following email content and provide a structured JSON response. Your analysis must be thorough, clear, and actionable. Provide a detailed summary, specific red flags, a direct recommended action for the user, and a helpful educational takeaway to prevent future incidents. Focus on identifying common phishing tactics like suspicious links, urgent language, sender impersonation, and grammatical errors.";

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: emailContent,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: this.responseSchema,
          temperature: 0.2
        },
      });

      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString) as AnalysisResult;
      
      // Ensure score is within bounds
      result.confidenceScore = Math.max(0, Math.min(1, result.confidenceScore));

      return result;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to analyze email. The AI service may be unavailable or the request was malformed.');
    }
  }
}