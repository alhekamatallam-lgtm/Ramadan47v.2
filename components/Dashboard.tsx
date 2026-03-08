
import React, { useState } from 'react';
import { MosqueRecord, MosqueInfo, DayInfo, PhotoRecord } from '../types.ts';
import ImageSlider from './ImageSlider.tsx';
import { analyzeFieldData } from '../services/ai.ts';

interface DashboardProps {
  records: MosqueRecord[];
  mosques: MosqueInfo[];
  days: DayInfo[];
  photos: PhotoRecord[];
  onNavigateToRecords: () => void;
  onNavigateToAdd: () => void;
  onNavigateToMaintenance: () => void;
  onNavigateToFastEval: () => void;
  onNavigateToVisit: () => void;
  onNavigateToGallery: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, mosques, days, photos, onNavigateToRecords, onNavigateToAdd, onNavigateToMaintenance, onNavigateToFastEval, onNavigateToVisit, onNavigateToGallery }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

    const totalWorshippers = records.reduce((sum, r) => {
    const men = parseInt(String(r.عدد_المصلين_رجال), 10) || 0;
    const women = parseInt(String(r.عدد_المصلين_نساء), 10) || 0;
    return sum + men + women;
  }, 0);
    const totalIftarMeals = records.reduce((sum, r) => {
    const meals = parseInt(String(r.عدد_وجبات_الافطار_فعلي), 10) || 0;
    return sum + meals;
  }, 0);
    const totalStudents = records.reduce((sum, r) => {
    const maleStudents = parseInt(String(r.عدد_طلاب_الحلقات), 10) || 0;
    const femaleStudents = parseInt(String(r.عدد_طالبات_الحلقات), 10) || 0;
    return sum + maleStudents + femaleStudents;
  }, 0);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const insight = await analyzeFieldData(records);
      setAiInsight(insight);
    } catch (err) {
      setAiInsight("فشل في استرداد التحليل.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#003366]">مرحباً بك 🌙</h2>
          <p className="text-[#5a7b9c] font-bold mt-2">بوابة الميدان - مؤسسة عبدالله الراجحي الخيرية</p>
        </div>

        <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl border-2 border-[#C5A059]/10 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 group">
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-50 shadow-inner relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/5 to-transparent pointer-events-none"></div>
            <img 
              src="https://res.cloudinary.com/domimvikq/image/upload/v1771792001/Qq2mkLQtzasD479_ryol7f.png" 
              alt="QR Code" 
              className="w-full h-full object-contain relative z-10 p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em]">الوصول السريع</span>
            <div className="h-1 w-8 bg-[#C5A059] rounded-full mt-1 group-hover:w-12 transition-all"></div>
          </div>
        </div>
      </div>

      <ImageSlider photos={photos} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button onClick={onNavigateToAdd} className="group bg-[#0054A6] text-white p-10 rounded-[3rem] shadow-2xl shadow-[#0054A6]/20 flex flex-col items-center text-center gap-6 transition-all hover:translate-y-[-4px] active:scale-95 border-b-8 border-[#003366]">
          <div className="w-20 h-20 bg-[#C5A059] rounded-[2rem] flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-xl">📝</div>
          <div>
            <h3 className="text-2xl font-black">تقرير المسجد الميداني</h3>
            <p className="text-white/60 text-sm mt-2">إحصائيات المصلين، الإفطار والبرامج</p>
          </div>
        </button>

        <button onClick={onNavigateToMaintenance} className="group bg-white text-[#003366] p-10 rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col items-center text-center gap-6 transition-all hover:translate-y-[-4px] active:scale-95 border-b-8 border-slate-200">
          <div className="w-20 h-20 bg-[#003366]/5 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🛠️</div>
          <div>
            <h3 className="text-2xl font-black text-[#003366]">لوحة الصيانة والنظافة</h3>
            <p className="text-slate-500 text-sm mt-2">متابعة النظافة، الصيانة واللوجستيات</p>
          </div>
        </button>

        <button onClick={onNavigateToFastEval} className="group bg-[#C5A059] text-white p-10 rounded-[3rem] shadow-2xl shadow-[#C5A059]/20 flex flex-col items-center text-center gap-6 transition-all hover:translate-y-[-4px] active:scale-95 border-b-8 border-[#ad8949]">
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🍲</div>
          <div>
            <h3 className="text-2xl font-black text-white">تقييم وجبات الإفطار</h3>
            <p className="text-white/60 text-sm mt-2">تقييم جودة الوجبات والموردين</p>
          </div>
        </button>

        <button onClick={onNavigateToVisit} className="group bg-white text-[#003366] p-10 rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col items-center text-center gap-6 transition-all hover:translate-y-[-4px] active:scale-95 border-b-8 border-slate-200">
          <div className="w-20 h-20 bg-[#003366]/5 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📋</div>
          <div>
            <h3 className="text-2xl font-black text-[#003366]">نموذج زيارة ميدانية</h3>
            <p className="text-slate-500 text-sm mt-2">تسجيل تفاصيل الزيارات وتقييم الوجبات</p>
          </div>
        </button>

        <button onClick={onNavigateToGallery} className="group bg-white text-[#003366] p-10 rounded-[3rem] shadow-xl border-2 border-slate-100 flex flex-col items-center text-center gap-6 transition-all hover:translate-y-[-4px] active:scale-95 border-b-8 border-slate-200">
          <div className="w-20 h-20 bg-[#003366]/5 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🖼️</div>
          <div>
            <h3 className="text-2xl font-black text-[#003366]">معرض الصور الميداني</h3>
            <p className="text-slate-500 text-sm mt-2">التوثيق البصري للأنشطة والخدمات</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={onNavigateToRecords} className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-[#003366] font-black flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-[#0054A6]/30 transition-all group shadow-sm">
            <span className="text-2xl group-hover:translate-x-2 transition-transform">📊</span>
            تصفح سجلات الأنشطة والتقارير السابقة
        </button>
        <StatCard label="إجمالي المصلين" value={totalWorshippers} color="#0054A6" icon="👥" />
        <StatCard label="وجبات الإفطار" value={totalIftarMeals} color="#C5A059" icon="🍱" />
        <StatCard label="طلاب الحلقات" value={totalStudents} color="#003366" icon="📖" />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: string }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="absolute top-0 right-0 w-2 h-full" style={{ backgroundColor: color }}></div>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <h4 className="text-4xl font-black tabular-nums" style={{ color }}>{value.toLocaleString('en-US')}</h4>
  </div>
);

export default Dashboard;