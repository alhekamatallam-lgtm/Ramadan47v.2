import React, { useState, useMemo } from 'react';
import { FastEvalRecord, MosqueInfo } from '../types.ts';

// Reusable component for displaying an average rating with a progress bar
const AverageRatingBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const percentage = (score / 5) * 100;
  let barColorClass = 'bg-slate-300';
  if (score >= 4) barColorClass = 'bg-emerald-500';
  else if (score >= 3) barColorClass = 'bg-yellow-500';
  else if (score > 0) barColorClass = 'bg-red-500';

  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-baseline">
        <span className="font-bold text-slate-600 text-sm">{label}</span>
        <span className={`font-black text-xl ${score >= 4 ? 'text-emerald-600' : score >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>{score.toFixed(1)}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className={`${barColorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};


const FastEvalResults: React.FC<{ records: FastEvalRecord[], mosques: MosqueInfo[], onBack: () => void }> = ({ records, mosques, onBack }) => {
  const [selectedMosque, setSelectedMosque] = useState<string>('all');

  const evaluationCriteria = {
    حرارة_الوجبة: 'حرارة الوجبة',
    الرز: 'جودة الأرز',
    الدجاج: 'جودة الدجاج',
    السمبوسة: 'جودة السمبوسة',
    الشوربة: 'جودة الشوربة',
    تنوع_أصناف_الوجبة: 'تنوع الأصناف',
    التغليف: 'جودة التغليف',
    النقل_والتعبئة: 'النقل والتعبئة',
    الالتزام_في_الوقت: 'الالتزام بالوقت',
    التوصية_بتكرار_التعامل_في_الأعوام_القادمة: 'التوصية بالتعامل مستقبلاً'
  };

  const filteredRecords = useMemo(() => {
    if (selectedMosque === 'all') return records;
    return records.filter(r => r.mosque_code === selectedMosque);
  }, [records, selectedMosque]);

  const averageScores = useMemo(() => {
    const scores: { [key: string]: { sum: number, count: number } } = {};
    
    Object.keys(evaluationCriteria).forEach(key => {
      scores[key] = { sum: 0, count: 0 };
    });

    filteredRecords.forEach(record => {
      Object.keys(evaluationCriteria).forEach(key => {
        const value = Number(record[key as keyof FastEvalRecord]);
        if (!isNaN(value) && value > 0) {
          scores[key].sum += value;
          scores[key].count++;
        }
      });
    });

    const averages: { [key: string]: number } = {};
    Object.keys(scores).forEach(key => {
      averages[key] = scores[key].count > 0 ? scores[key].sum / scores[key].count : 0;
    });

    return averages;
  }, [filteredRecords]);

  const generalNotes = useMemo(() => {
    return filteredRecords
      .filter(r => r.ملاحظات_عامة && r.ملاحظات_عامة.trim() !== '')
      .map(r => ({ note: r.ملاحظات_عامة, mosque: r.المسجد, evaluator: r.الاسم_الكريم }));
  }, [filteredRecords]);

  const totalAverage = useMemo(() => {
    // FIX: `Object.values(averageScores)` returns `unknown[]` because `averageScores` has a
    // string index signature. Cast to `number[]` to allow type-safe filtering and reduction.
    const allScores = (Object.values(averageScores) as number[]).filter(s => s > 0);
    return allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  }, [averageScores]);


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in text-right">
       <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-black text-[#003366]">نتائج تقييم الوجبات</h2>
            <p className="text-slate-400 text-sm font-bold">ملخص متوسط التقييمات والملاحظات الميدانية</p>
          </div>
        </div>
      </div>

       <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-8">
           <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-[#003366] to-[#0054A6] text-white rounded-[2rem] shadow-lg">
             <span className="text-sm font-bold opacity-70">المتوسط العام للتقييم</span>
             <span className="text-7xl font-black my-2">{totalAverage.toFixed(1)}</span>
             <span className="font-bold">من 5</span>
           </div>
           <div className="flex-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">فلترة حسب المسجد</label>
             <select 
               value={selectedMosque} 
               onChange={(e) => setSelectedMosque(e.target.value)}
               className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#003366] appearance-none shadow-inner outline-none focus:border-[#0054A6]"
             >
               <option value="all">عرض كل المساجد</option>
               {mosques.map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
             </select>
           </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
           <h3 className="text-xl font-black text-[#003366] mb-6">📊 متوسط التقييمات</h3>
           <div className="space-y-4">
            {Object.entries(evaluationCriteria).map(([key, label]) => (
                <AverageRatingBar key={key} label={label} score={averageScores[key]} />
            ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black text-[#003366] mb-6">📝 أبرز الملاحظات</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {generalNotes.length > 0 ? generalNotes.map((item, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <p className="text-slate-700 font-medium leading-relaxed mb-4">"{item.note}"</p>
                 <div className="text-xs font-bold text-slate-400 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span>- {item.evaluator}</span>
                    <span>{item.mosque}</span>
                 </div>
              </div>
            )) : (
              <div className="text-center py-16 text-slate-400 font-bold">
                 <div className="text-3xl mb-2">🤷‍♂️</div>
                 لا توجد ملاحظات مسجلة لهذا الاختيار.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastEvalResults;
