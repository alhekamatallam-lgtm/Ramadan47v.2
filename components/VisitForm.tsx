
import React, { useState, useEffect } from 'react';
import { VisitRecord, MosqueInfo, DayInfo } from '../types.ts';
import { INITIAL_VISIT_RECORD } from '../constants.ts';
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


const VisitForm: React.FC<{ mosques: MosqueInfo[], days: DayInfo[], onSave: (data: any) => void, onCancel: () => void }> = ({ mosques, days, onSave, onCancel }) => {
  const [formData, setFormData] = useState<VisitRecord>(INITIAL_VISIT_RECORD);
  const [selectedMosqueCode, setSelectedMosqueCode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormData({ ...INITIAL_VISIT_RECORD, record_id: `VISIT-${Date.now()}` });
  }, []);

  const handleRatingChange = (field: keyof VisitRecord, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    if (!formData.الاسم_الكريم) newErrors.الاسم_الكريم = "يجب إدخال اسم الزائر";
    if (!formData.اليوم) newErrors.اليوم = "يجب اختيار اليوم";

    const ratingFields: (keyof VisitRecord)[] = ['النظافة', 'التكييف', 'الرائحة', 'الإنارة', 'المظهر_العام_الداخلي', 'المظهر_العام_الخارجي', 'مدخل_المسجد', 'مواقف_السيارت'];
    let firstRatingError = '';
    for (const field of ratingFields) {
      if (!formData[field]) {
        firstRatingError = 'يرجى تقييم جميع البنود من 1 إلى 5';
        break;
      }
    }
    if (firstRatingError) newErrors.ratings = firstRatingError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSave({ ...formData, sheet: 'Visit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 animate-in text-right">
      <div className="text-center">
        <h2 className="text-4xl font-black text-[#003366]">نموذج تقرير زيارة ميدانية 📋</h2>
        <p className="text-slate-500 font-bold mt-2">لتقييم نظافة وجاهزية مرافق المسجد</p>
      </div>

      <InputGroup title="بيانات الزائر والموقع" icon="👤">
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المسجد / الموقع</label>
            <select value={selectedMosqueCode} onChange={handleMosqueChange} className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none ${errors.mosque_code ? 'border-red-500' : 'border-transparent'}`}>
                <option value="">اختر من القائمة...</option>
                {mosques.map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
            </select>
            {errors.mosque_code && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.mosque_code}</span>}
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم الزائر الكريم</label>
            <input type="text" name="الاسم_الكريم" value={formData.الاسم_الكريم} onChange={handleChange} placeholder="أدخل اسمك..." className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-[#0054A6] shadow-inner ${errors.الاسم_الكريم ? 'border-red-500' : 'border-transparent'}`} />
            {errors.الاسم_الكريم && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.الاسم_الكريم}</span>}
        </div>
         <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                اليوم <span className="text-red-500">*</span>
              </label>
              <select 
                name="اليوم" 
                value={formData.اليوم} 
                onChange={handleChange} 
                className={`px-6 py-5 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all appearance-none ${errors.اليوم ? 'border-red-500' : 'border-transparent focus:border-[#003366]'}`}
              >
                <option value="">اختر اليوم...</option>
                {days.map(d => <option key={d.code_day} value={d.label}>{d.label}</option>)}
              </select>
              {errors.اليوم && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.اليوم}</span>}
            </div>
      </InputGroup>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#0054A6]/5 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
          <h3 className="text-xl font-black text-[#003366]">تقييم جاهزية المسجد ومرافقه</h3>
        </div>
        {errors.ratings && <div className="-mt-4 mb-6 text-center text-red-500 font-bold text-sm animate-in fade-in">{errors.ratings}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <RatingScale label="النظافة" subLabels={['سيئة', 'ممتازة']} value={formData.النظافة} onChange={(v) => handleRatingChange('النظافة', v)} />
            <RatingScale label="التكييف" subLabels={['سيء', 'ممتاز']} value={formData.التكييف} onChange={(v) => handleRatingChange('التكييف', v)} />
            <RatingScale label="الرائحة" subLabels={['سيئة', 'ممتازة']} value={formData.الرائحة} onChange={(v) => handleRatingChange('الرائحة', v)} />
            <RatingScale label="الإنارة" subLabels={['ضعيفة', 'ممتازة']} value={formData.الإنارة} onChange={(v) => handleRatingChange('الإنارة', v)} />
            <RatingScale label="المظهر العام الداخلي" subLabels={['سيء', 'ممتاز']} value={formData.المظهر_العام_الداخلي} onChange={(v) => handleRatingChange('المظهر_العام_الداخلي', v)} />
            <RatingScale label="المظهر العام الخارجي" subLabels={['سيء', 'ممتاز']} value={formData.المظهر_العام_الخارجي} onChange={(v) => handleRatingChange('المظهر_العام_الخارجي', v)} />
            <RatingScale label="مدخل المسجد" subLabels={['سيء', 'ممتاز']} value={formData.مدخل_المسجد} onChange={(v) => handleRatingChange('مدخل_المسجد', v)} />
            <RatingScale label="مواقف السيارات" subLabels={['سيئة', 'ممتازة']} value={formData.مواقف_السيارت} onChange={(v) => handleRatingChange('مواقف_السيارت', v)} />
        </div>
      </div>
      
       <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">📝</div>
            <label className="text-xl font-black text-[#003366]">ملاحظات عامة</label>
         </div>
         <textarea name="ملاحظات_عامة" value={formData.ملاحظات_عامة} onChange={handleChange} rows={4} className="w-full px-8 py-6 bg-slate-50 rounded-[2rem] outline-none focus:bg-white border-2 border-transparent focus:border-[#0054A6] font-bold text-[#003366] text-lg shadow-inner" placeholder="صف تجربتك أو أي اقتراحات للتحسين..." />
      </div>

      <div className="fixed bottom-10 left-0 right-0 px-4 z-[50] pointer-events-none">
        <div className="w-full max-w-lg mx-auto flex gap-2">
            <button 
              type="button"
              onClick={handleFormSubmit} 
              className="pointer-events-auto flex-grow bg-[#0054A6] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all border-b-4 border-[#003366]"
            >
              ✅ إرسال تقرير الزيارة
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

export default VisitForm;
