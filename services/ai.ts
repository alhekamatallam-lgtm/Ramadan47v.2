
import { GoogleGenAI } from "@google/genai";
import { MosqueRecord } from "../types.ts";

export const analyzeFieldData = async (records: MosqueRecord[]) => {
  if (!records || records.length === 0) return "لا توجد بيانات كافية للتحليل حالياً.";
  
  // Lazy initialization: Initialize the AI client only when the function is called.
  // This prevents the entire app from crashing if the API key is missing on load.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const dataSummary = records.map(r => ({
    mosque: r.المسجد,
    attendance: (Number(r.عدد_المصلين_رجال || 0) + Number(r.عدد_المصلين_نساء || 0)),
    meals: r.عدد_وجبات_الافطار_فعلي,
    notes: r.ملاحظات,
    status: r.الاعتماد
  }));

  const prompt = `
    أنت محلل بيانات ذكي لمشاريع رمضان. حلل البيانات التالية لعدد من المساجد وقدم تقريراً تنفيذياً باللغة العربية:
    - لخص الحالة العامة للميدان.
    - استخرج أي مشاكل أو ملاحظات سلبية تتكرر في المساجد (مثل نقص المياه، ازدحام، ملاحظات صيانة).
    - قدم 3 توصيات ذكية للمشرفين لتحسين التجربة غداً.
    
    البيانات: ${JSON.stringify(dataSummary)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "أنت مساعد إداري ذكي لمؤسسة عبدالله الراجحي الخيرية. كن دقيقاً، مهنياً، ومختصراً في نقاط واضحة.",
        temperature: 0.7,
      },
    });

    return response.text ?? "";
  } catch (error) {
    console.error("AI Error:", error);
    return "حدث خطأ أثناء محاولة تحليل البيانات ذكياً. يرجى مراجعة التقارير يدوياً.";
  }
};