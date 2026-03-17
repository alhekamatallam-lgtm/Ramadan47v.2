
import React, { useState, useEffect } from 'react';
import { EidRecord, MosqueInfo } from '../types.ts';
import { INITIAL_EID_RECORD } from '../constants.ts';
import InputGroup from './InputGroup';

const getTodayHijri = () => {
  try {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    return formatter.format(today).replace('هـ', '').trim();
  } catch (e) { return ""; }
};

const convertAndCleanNumbers = (val: string | number) => {
  if (val === undefined || val === null) return '';
  const strVal = val.toString();
  const converted = strVal.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
  return converted.replace(/[^\d]/g, '');
};

interface EidFormProps {
  initialData?: EidRecord;
  mosques: MosqueInfo[];
  isAdmin: boolean;
  onSave: (record: EidRecord) => void;
  onCancel: () => void;
}

const EidForm: React.FC<EidFormProps> = ({ initialData, mosques, isAdmin, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EidRecord>(INITIAL_EID_RECORD);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [selectedMosqueCode, setSelectedMosqueCode] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setSelectedMosqueCode(initialData.mosque_code);
      if (isAdmin) setIsPasswordCorrect(true);
    } else {
      setFormData({ ...INITIAL_EID_RECORD, record_id: `EID-${Date.now()}`, تاريخ_هجري: getTodayHijri() });
    }
  }, [initialData, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const mosque = mosques.find(m => m.mosque_code === selectedMosqueCode);
    setIsPasswordCorrect(mosque && String(mosque.pwd).trim() === String(enteredPassword).trim());
  }, [enteredPassword, selectedMosqueCode, mosques, isAdmin]);

  const handleChange = (e: any) => {
    const { name, value, inputMode } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: inputMode === 'numeric' ? convertAndCleanNumbers(value) : value 
    }));
  };

  const handleMosqueChange = (e: any) => {
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
    }
  };

  const handleFormSubmit = () => {
    if (!formData.mosque_code) {
      alert('الرجاء اختيار المسجد');
      return;
    }
    onSave({ ...formData });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 animate-in text-right" dir="rtl">
      {!isAdmin && (
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#C5A059]"></div>
          <h3 className="text-xl font-black text-[#003366] mb-8 flex items-center gap-3">
             <span className="w-10 h-10 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-xl">👤</span>
             بيانات المشرف الميداني - تقرير العيد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المسجد / الموقع</label>
               <select value={selectedMosqueCode} onChange={handleMosqueChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#C5A059] shadow-inner appearance-none">
                 <option value="">اختر من القائمة...</option>
                 {mosques.map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
               <input type="password" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#C5A059] shadow-inner text-center tracking-widest" />
            </div>
          </div>
        </div>
      )}

      {(isPasswordCorrect || isAdmin) && (
        <div className="space-y-8 animate-in">
          <InputGroup title="معلومات التقرير" icon="🎉">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اليوم / الليلة</label>
               <input type="text" value={formData.label_day} readOnly className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-lg text-slate-400 font-bold" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">التاريخ الهجري</label>
               <input type="text" value={formData.تاريخ_هجري} readOnly className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-lg text-slate-400 font-bold" />
            </div>
          </InputGroup>

          <InputGroup title="إحصائيات صلاة العيد" icon="👥">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المصلين (رجال)</label>
              <input type="text" inputMode="numeric" name="عدد_المصلين_رجال" value={formData.عدد_المصلين_رجال} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المصلين (نساء)</label>
              <input type="text" inputMode="numeric" name="عدد_المصلين_نساء" value={formData.عدد_المصلين_نساء} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد هدايا العيد الموزعة</label>
              <input type="text" inputMode="numeric" name="عدد_هدايا_العيد" value={formData.عدد_هدايا_العيد} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">السقيا (كراتين الماء)</label>
              <input type="text" inputMode="numeric" name="السقيا" value={formData.السقيا} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
          </InputGroup>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">📝</div>
                <label className="text-xl font-black text-[#003366] uppercase tracking-widest">ملاحظات إضافية</label>
             </div>
             <textarea name="ملاحظات" value={formData.ملاحظات} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none focus:bg-white border-2 border-transparent focus:border-[#0054A6] font-bold text-[#003366] shadow-inner" placeholder="أي ملاحظات حول صلاة العيد وتوزيع الهدايا..." />
          </div>

          <div className="fixed bottom-10 left-0 right-0 px-4 z-[50] pointer-events-none">
            <div className="w-full max-w-lg mx-auto flex gap-2">
                <button 
                  type="button"
                  onClick={handleFormSubmit} 
                  className="pointer-events-auto flex-grow bg-[#C5A059] text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-[#ad8949]"
                >
                  📤 إرسال تقرير العيد
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="pointer-events-auto w-24 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-slate-200"
                >
                  إلغاء
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EidForm;
