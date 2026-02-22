
export interface MosqueRecord {
  record_id: string;
  created_at: string;
  code_day: string;
  label_day: string;
  mosque_code: string;
  المسجد: string;
  "نوع الموقع": string;
  تاريخ_هجري: string;
  عدد_المصلين_رجال: number | string;
  عدد_المصلين_نساء: number | string;
  عدد_وجبات_الافطار_فعلي: number | string;
  عدد_كراتين_ماء: number | string;
  عدد_مستفيدي_الضيافة: number | string;
  عدد_طلاب_الحلقات: number | string;
  عدد_الاوجه_طلاب: number | string;
  عدد_طالبات_الحلقات: number | string;
  عدد_الاوجه_طالبات: number | string;
  عدد_المتطوعين: number | string;
  "عدد المشرفين": number | string;
  عدد_المسابقات: number | string;
  عدد_اطفال_الحضانة: number | string;
  عدد_الكلمات_الرجالية: number | string;
  عدد_الكلمات_النسائية: number | string;
  عدد_مستفيدي_الكلمات: number | string;
  عدد_المعتكفين_رجال: number | string;
  عدد_وجبات_السحور_رجال: number | string;
  عدد_المعتكفين_نساء: number | string;
  عدد_وجبات_السحور_نساء: number | string;
  البرنامج_المجتمعي: string;
  عدد_المستفيدين: number | string;
  وصف_البرنامج: string;
  ملاحظات: string;
  الاعتماد?: string; // معتمد، يعاد التقرير، قيد المراجعة
}

export interface MaintenanceRecord {
  record_id: string;
  mosque_code?: string;
  المسجد?: string;
  "نوع الموقع"?: string;
  اليوم: string;
  label?: string;
  code_day?: string;
  label_day?: string;
  التاريخ: string;
  أعمال_النظافة_عدد: number | string;
  أعمال_الصيانة_عدد: number | string;
  عدد_كراتين_الماء_الواقعي: number | string;
  المبادرات_المقدمة: string;
  الخدمات_اللوجستية: string;
  أعمال_النظافة_سرد: string;
  أعمال_الصيانة_سرد: string;
  ملاحظات_ومشكلات_ومقترحات: string;
  created_at?: string;
  الاعتماد?: string;
}

export interface FastEvalRecord {
  record_id: string;
  الاسم_الكريم: string;
  mosque_code: string;
  المسجد: string;
  "نوع الموقع": string;
  حرارة_الوجبة: number | string;
  الرز: number | string;
  الدجاج: number | string;
  السمبوسة: number | string;
  الشوربة: number | string;
  تنوع_أصناف_الوجبة: number | string;
  التغليف: number | string;
  النقل_والتعبئة: number | string;
  الالتزام_في_الوقت: number | string;
  التوصية_بتكرار_التعامل_في_الأعوام_القادمة: number | string;
  ملاحظات_عامة: string;
  created_at?: string;
}

export interface VisitRecord {
  record_id: string;
  الاسم_الكريم: string;
  اليوم: string;
  mosque_code: string;
  المسجد: string;
  "نوع الموقع": string;
  النظافة: number | string;
  التكييف: number | string;
  الرائحة: number | string;
  الإنارة: number | string;
  المظهر_العام_الداخلي: number | string;
  المظهر_العام_الخارجي: number | string;
  مدخل_المسجد: number | string;
  مواقف_السيارت: number | string; // Note: Typo in API is 'السيارت', kept for consistency
  ملاحظات_عامة: string;
  created_at?: string;
}


export interface PhotoRecord {
  public_id: string;
  secure_url: string;
  webp_url: string;
  format: string;
  tags: string;
}

export interface MosqueInfo {
  mosque_code: string;
  المسجد: string;
  "نوع الموقع": string;
  supervisor?: string;
  supervisor_name?: string;
  pwd?: number | string;
}

export interface DayInfo {
  code_day: string;
  label: string;
}

export interface ApiResponse {
  success: boolean;
  sheets: {
    daily_mosque_report: MosqueRecord[];
    mosque: MosqueInfo[];
    Dayd: DayInfo[];
    Maintenance_Report: MaintenanceRecord[];
    photo: PhotoRecord[];
    Fast_eval: FastEvalRecord[];
    Visit: VisitRecord[];
  };
}