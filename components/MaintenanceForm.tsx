
import React, { useState, useEffect } from 'react';
import { MaintenanceRecord, MosqueInfo, DayInfo } from '../types.ts';
import { INITIAL_MAINTENANCE_RECORD } from '../constants.ts';
import InputGroup from './InputGroup.tsx';

const convertAndCleanNumbers = (val: string) => {
  if (!val) return '';
  const converted = val.toString().replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
  return converted.replace(/[^\d]/g, '');
};

const MaintenanceForm: React.FC<any> = ({ initialData, mosques, days, isAdmin, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MaintenanceRecord>(INITIAL_MAINTENANCE_RECORD);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [selectedMosqueCode, setSelectedMosqueCode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setSelectedMosqueCode(initialData.mosque_code || '');
      if (isAdmin) setIsPasswordCorrect(true);
    } else {
      setFormData(prev => ({ ...prev, record_id: `MNT-${Date.now()}`, التاريخ: new Date().toISOString() }));
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMosqueChange = (e: any) => {
    const code = e.target.value;
    setSelectedMosqueCode(code);
    const mosque = mosques.find(m => m.mosque_code === code);
    setFormData(prev => ({ 
      ...prev, 
      mosque_code: code, 
      المسجد: mosque?.المسجد || '',
      "نوع الموقع": mosque?.["نوع الموقع"] || ''
    }));
    setEnteredPassword('');
  };

    const handleFormSubmit = () => {
    if (!formData.code_day) {
      setErrors({ code_day: 'يرجى اختيار اليوم' });
      return;
    }
    const dayInfo = days.find(d => d.code_day === formData.code_day);
    const payload = {
      ...formData,
      sheet: 'Maintenance_Report',
      label: dayInfo?.label || formData.label_day || formData.اليوم,
      اليوم: dayInfo?.label || formData.label_day || formData.اليوم,
    };
    onSave(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 animate-in text-right">
      {!isAdmin && (
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#003366]"></div>
          <h3 className="text-2xl font-black text-[#003366] mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-[#003366]/10 rounded-xl flex items-center justify-center text-xl">🛠️</span>
            تحقق مشرف الصيانة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الموقع / المسجد</label>
              <select value={selectedMosqueCode} onChange={handleMosqueChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:bg-white focus:border-[#003366] font-bold text-[#003366] appearance-none shadow-inner">
                <option value="">اختر المسجد المراد رفع تقريره...</option>
                                {(mosques || []).map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
              <input type="password" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg outline-none focus:bg-white focus:border-[#003366] font-bold tracking-widest shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {(isPasswordCorrect || isAdmin) ? (
        <div className="space-y-8 animate-in">
          <InputGroup title="اليوم والتاريخ" icon="📅">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                اليوم <span className="text-red-500">*</span>
              </label>
                            <select 
                name="code_day" 
                value={formData.code_day} 
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  const day = days.find(d => d.code_day === selectedCode);
                  setFormData(prev => ({ 
                    ...prev, 
                    code_day: selectedCode,
                    label_day: day?.label || '',
                    اليوم: day?.label || ''
                  }));
                  if (errors.code_day) setErrors(prev => ({ ...prev, code_day: '' }));
                }} 
                className={`px-4 py-3 border-2 rounded-lg bg-white font-bold outline-none transition-all ${errors.code_day ? 'border-red-500' : 'focus:border-[#003366]'}`} 
              >
                <option value="">اختر اليوم...</option>
                {(days || []).map(d => <option key={d.code_day} value={d.code_day}>{d.label}</option>)}
              </select>
                            {errors.code_day && <span className="text-red-500 text-[10px] font-bold mr-2">{errors.code_day}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">التاريخ</label>
              <input type="text" value={new Date(formData.التاريخ).toLocaleDateString('ar-SA')} readOnly className="px-4 py-3 border-2 border-slate-100 rounded-lg bg-slate-50 font-bold text-slate-400" />
            </div>
          </InputGroup>

          <InputGroup title="إحصائيات الصيانة والنظافة" icon="📊">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أعمال النظافة</label>
              <input type="text" inputMode="numeric" name="أعمال_النظافة_عدد" value={formData.أعمال_النظافة_عدد} onChange={handleChange} className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold" placeholder="أدخل العدد" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أعمال الصيانة</label>
              <input type="text" inputMode="numeric" name="أعمال_الصيانة_عدد" value={formData.أعمال_الصيانة_عدد} onChange={handleChange} className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold" placeholder="أدخل العدد" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">كراتين الماء</label>
              <input type="text" inputMode="numeric" name="عدد_كراتين_الماء_الواقعي" value={formData.عدد_كراتين_الماء_الواقعي} onChange={handleChange} className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold" placeholder="أدخل العدد" />
            </div>
          </InputGroup>

          {isAdmin && (
            <div className="bg-[#003366] p-10 rounded-[3rem] shadow-2xl text-white">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🔐</span>
                اعتماد تقرير الصيانة
              </h3>
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mr-2">حالة الاعتماد</label>
                <div className="relative">
                  <select 
                    value={formData.الاعتماد || 'قيد المراجعة'} 
                    onChange={(e) => setFormData(p => ({ ...p, الاعتماد: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg font-black outline-none border-2 transition-all appearance-none cursor-pointer ${
                      formData.الاعتماد === 'يعتمد' ? 'bg-emerald-500 border-emerald-400 text-white' : 
                      formData.الاعتماد === 'مرفوض' ? 'bg-red-500 border-red-400 text-white' : 
                      'bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    <option value="قيد المراجعة" className="text-slate-800">قيد المراجعة</option>
                    <option value="يعتمد" className="text-slate-800">يعتمد ✅</option>
                    <option value="مرفوض" className="text-slate-800">مرفوض ❌</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <textarea name="أعمال_النظافة_سرد" value={formData.أعمال_النظافة_سرد} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-lg font-bold" placeholder="تفاصيل أعمال النظافة..." />
            <textarea name="أعمال_الصيانة_سرد" value={formData.أعمال_الصيانة_سرد} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-lg font-bold" placeholder="تفاصيل أعمال الصيانة..." />
          </div>

          <div className="fixed bottom-10 left-0 right-0 px-4 z-[50] pointer-events-none">
             <div className="w-full max-w-lg mx-auto flex gap-2">
                <button 
                  type="button"
                  onClick={handleFormSubmit} 
                  className="pointer-events-auto flex-grow bg-[#0054A6] text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-[#003366]"
                >
                  {isAdmin ? '💾 حفظ التعديلات والاعتماد' : '📥 رفع تقرير الصيانة'}
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
      ) : (
        <div className="bg-[#003366]/5 p-12 rounded-[3rem] border-2 border-dashed border-[#003366]/20 text-center space-y-4">
            <div className="text-4xl">🔑</div>
            <h4 className="text-xl font-bold text-[#003366]">بانتظار التحقق...</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">يرجى اختيار المسجد وإدخال كلمة المرور الموحدة لفتح تقرير الصيانة</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceForm;