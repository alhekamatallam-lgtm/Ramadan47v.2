
import { GoogleGenAI } from "@google/genai";
import { MosqueRecord } from "../types.ts";

export const analyzeFieldData = async (records: MosqueRecord[]) => {
  if (!records || records.length === 0) return "لا توجد بيانات كافية للتحليل حالياً.";
  
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return "تنبيه: مفتاح API الخاص بـ Gemini غير متوفر. يرجى التأكد من إعداد البيئة بشكل صحيح.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
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