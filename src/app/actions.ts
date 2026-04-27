"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generatePost(prompt: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `
      Jesteś ekspertem od marketingu i tworzenia treści. 
      Na podstawie poniższego tematu/linku przygotuj:
      1. Profesjonalny post na LinkedIn (angażujący, z hasztagami).
      2. Skrypt do krótkiego wideo (TikTok/Reels) - maksymalnie 60 sekund.

      TEMAT: ${prompt}

      Zwróć odpowiedź w formacie JSON (tylko JSON, bez markdowna):
      {
        "linkedin": "treść posta tutaj",
        "video_script": "treść skryptu tutaj"
      }
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Oczyszczanie JSONa (Gemini czasem dodaje ```json)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonStr);

    // Zapis do Supabase
    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      original_prompt: prompt,
      linkedin_preview: data.linkedin,
      video_script: data.video_script,
    });

    if (error) throw error;

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Generation error:", error);
    return { success: false, error: "Błąd podczas generowania treści." };
  }
}
