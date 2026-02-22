import React, { useState, useEffect } from 'react';
import { FastEvalRecord, MosqueInfo } from '../types.ts';
import { INITIAL_FAST_EVAL_RECORD } from '../constants.ts';
import InputGroup from './InputGroup.tsx';

interface RatingScaleProps {
  label: string;
  subLabels: [string, string];
  value: string | number;
  onChange: (value: number) => void;
}

const RatingScale: React.FC<RatingScaleProps> = ({ label, subLabels, value, onChange }) => {
  return (
    <div className="flex flex-col gap-3 md:col-span-1 lg:col-span-2">
      <div className="flex items-baseline justify-between">
        <label className="text-md font-black text-slate-700">{label}</label>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
           <span>{subLabels[0]}</span>
           <span>{subLabels[1]}</span>
        </div>
      </div>
      <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-2 gap-1 shadow-inner">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`flex-1 text-center font-black text-lg h-14 rounded-xl transition-all duration-200 flex items-center justify-center ${
              Number(value) === num 
                ? 'bg-[#0054A6] text-white shadow-md transform scale-105' 
                : 'text-slate-400 hover:bg-white hover:text-[#0054A6]'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};


const FastEvalForm: React.FC<{ mosques: MosqueInfo[], onSave: (data: any) => void, onCancel: () => void }> = ({ mosques, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FastEvalRecord>(INITIAL_FAST_EVAL_RECORD);
  const [selectedMosqueCode, setSelectedMosqueCode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormData({ ...INITIAL_FAST_EVAL_RECORD, record_id: `FEV-${Date.now()}` });
  }, []);

  const handleRatingChange = (field: keyof FastEvalRecord, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
  };

  const handleMosqueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedMosqueCode(code);
    const mosque = mosques.find(m => m.mosque_code === code);
    if (mosque) {
      setFormData(prev => ({ 
        ...prev, 
        mosque_code: code, 
        المسجد: mosque.المسجد,
        "نوع الموقع": mosque["نوع الموقع"]
      }));
       if (errors.mosque_code) setErrors(prev => ({...prev, mosque_code: ''}));
    }
  };

  const handleFormSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.mosque_code) newErrors.mosque_code = "يجب اختيار المسجد";
    if (!formData.الاسم_الكريم) newErrors.الاسم_الكريم = "يجب إدخال اسم المُقيّم";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSave({ ...formData, sheet: 'Fast_eval' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 animate-in text-right">
      <div className="text-center">
        <h2 className="text-4xl font-black text-[#003366]">نموذج تقييم وجبات الإفطار 🍲</h2>
        <p className="text-slate-500 font-bold mt-2">رأيك يهمنا لتحسين الجودة في الأعوام القادمة</p>
      </div>

      <InputGroup title="بيانات المُقيّم والموقع" icon="👤">
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المسجد / الموقع</label>
            <select value={selectedMosqueCode} onChange={handleMosqueChange} className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none ${errors.mosque_code ? 'border-red-500' : 'border-transparent'}`}>
                <option value="">اختر من القائمة...</option>
                {mosques.map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
            </select>
            {errors.mosque_code && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.mosque_code}</span>}
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسمك الكريم</label>
            <input type="text" name="الاسم_الكريم" value={formData.الاسم_الكريم} onChange={handleChange} placeholder="أدخل اسمك..." className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-[#0054A6] shadow-inner ${errors.الاسم_الكريم ? 'border-red-500' : 'border-transparent'}`} />
            {errors.الاسم_الكريم && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.الاسم_الكريم}</span>}
        </div>
      </InputGroup>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#0054A6]/5 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
          <h3 className="text-xl font-black text-[#003366]">تقييم جودة الوجبة والمورد</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <RatingScale label="حرارة الوجبة" subLabels={['باردة', 'ساخنة']} value={formData.حرارة_الوجبة} onChange={(v) => handleRatingChange('حرارة_الوجبة', v)} />
            <RatingScale label="جودة الأرز" subLabels={['سيئة', 'ممتازة']} value={formData.الرز} onChange={(v) => handleRatingChange('الرز', v)} />
            <RatingScale label="جودة الدجاج" subLabels={['سيئة', 'ممتازة']} value={formData.الدجاج} onChange={(v) => handleRatingChange('الدجاج', v)} />
            <RatingScale label="جودة السمبوسة" subLabels={['سيئة', 'ممتازة']} value={formData.السمبوسة} onChange={(v) => handleRatingChange('السمبوسة', v)} />
            <RatingScale label="جودة الشوربة" subLabels={['سيئة', 'ممتازة']} value={formData.الشوربة} onChange={(v) => handleRatingChange('الشوربة', v)} />
            <RatingScale label="تنوع الأصناف" subLabels={['قليل جداً', 'متنوع جداً']} value={formData.تنوع_أصناف_الوجبة} onChange={(v) => handleRatingChange('تنوع_أصناف_الوجبة', v)} />
            <RatingScale label="جودة التغليف" subLabels={['سيئة', 'ممتازة']} value={formData.التغليف} onChange={(v) => handleRatingChange('التغليف', v)} />
            <RatingScale label="النقل والتعبئة" subLabels={['سيئة', 'ممتازة']} value={formData.النقل_والتعبئة} onChange={(v) => handleRatingChange('النقل_والتعبئة', v)} />
            <RatingScale label="الالتزام بالوقت" subLabels={['متأخر دائماً', 'في الموعد']} value={formData.الالتزام_في_الوقت} onChange={(v) => handleRatingChange('الالتزام_في_الوقت', v)} />
            <RatingScale label="توصي بالتعامل معه مستقبلاً؟" subLabels={['لا أوصي', 'أوصي بشدة']} value={formData.التوصية_بتكرار_التعامل_في_الأعوام_القادمة} onChange={(v) => handleRatingChange('التوصية_بتكرار_التعامل_في_الأعوام_القادمة', v)} />
        </div>
      </div>
      
       <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">📝</div>
            <label className="text-xl font-black text-[#003366]">ملاحظات عامة</label>
         </div>
         <textarea name="ملاحظات_عامة" value={formData.ملاحظات_عامة} onChange={handleChange} rows={4} className="w-full px-8 py-6 bg-slate-50 rounded-[2rem] outline-none focus:bg-white border-2 border-transparent focus:border-[#0054A6] font-bold text-[#003366] text-lg shadow-inner" placeholder="صف تجربتك مع المورد، أو أي اقتراحات للتحسين..." />
      </div>

      <div className="fixed bottom-10 left-0 right-0 px-4 z-[50] pointer-events-none">
        <div className="w-full max-w-lg mx-auto flex gap-2">
            <button 
              type="button"
              onClick={handleFormSubmit} 
              className="pointer-events-auto flex-grow bg-[#0054A6] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all border-b-4 border-[#003366]"
            >
              ✅ إرسال التقييم
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="pointer-events-auto w-24 bg-slate-100 text-slate-500 py-6 rounded-[2.5rem] font-black text-xl shadow-lg flex items-center justify-center gap-4 active:scale-95 transition-all border-b-4 border-slate-200"
            >
              إلغاء
            </button>
        </div>
      </div>
    </div>
  );
};

export default FastEvalForm;
