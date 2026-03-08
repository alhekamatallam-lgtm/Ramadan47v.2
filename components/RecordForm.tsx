import React, { useState, useEffect } from 'react';
import { MosqueRecord, MosqueInfo, DayInfo } from '../types.ts';
import { INITIAL_RECORD } from '../constants.ts';
import InputGroup from './InputGroup.tsx';

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

const RecordForm: React.FC<any> = ({ initialData, mosques, days, isAdmin, onSave, onCancel }) => {
  const [formData, setFormData] = useState<MosqueRecord>(INITIAL_RECORD);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [selectedMosqueCode, setSelectedMosqueCode] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasCommunityPrograms, setHasCommunityPrograms] = useState(false);
  const [communityPrograms, setCommunityPrograms] = useState<{name: string, description: string, beneficiaries: string}[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setSelectedMosqueCode(initialData.mosque_code);
      if (isAdmin) setIsPasswordCorrect(true);
    } else {
      setFormData({ ...INITIAL_RECORD, record_id: `MRJ-${Date.now()}`, تاريخ_هجري: getTodayHijri() });
    }
  }, [initialData, isAdmin]);

  useEffect(() => {
    if (initialData?.البرنامج_المجتمعي) {
      setHasCommunityPrograms(true);
      const programs = initialData.البرنامج_المجتمعي.split('##').filter(p => p.trim() !== '');
      setCommunityPrograms(programs.map((p: string) => {
        const [name = '', beneficiaries = '', description = ''] = p.split('|');
        return { name, beneficiaries, description };
      }));
    } else {
      setHasCommunityPrograms(false);
      setCommunityPrograms([]);
    }
  }, [initialData]);

  const handleCommunityProgramChange = (index: number, field: 'name' | 'description' | 'beneficiaries', value: string) => {
    const updatedPrograms = [...communityPrograms];
    updatedPrograms[index][field] = value;
    setCommunityPrograms(updatedPrograms);
  };

  const handleCommunityProgramsCountChange = (countStr: string) => {
    const count = parseInt(countStr, 10) || 0;
    if (count >= 0 && count <= 15) { // Limit to 15 programs
      const newPrograms = Array.from({ length: count }, (_, i) => 
        communityPrograms[i] || { name: '', description: '', beneficiaries: '' }
      );
      setCommunityPrograms(newPrograms);
    }
  };

  useEffect(() => {
    if (!hasCommunityPrograms) {
      setFormData(prev => ({ ...prev, البرنامج_المجتمعي: '', عدد_المستفيدين: '0', عدد_البرامج_المجتمعية: '0' }));
      return;
    }

    const programString = communityPrograms
      .map(p => `${p.name || ''}|${p.beneficiaries || ''}|${p.description || ''}`)
      .join('##');

    const totalBeneficiaries = communityPrograms.reduce((sum, p) => sum + (parseInt(p.beneficiaries, 10) || 0), 0);

    setFormData(prev => ({ 
      ...prev, 
      البرنامج_المجتمعي: programString,
      عدد_المستفيدين: String(totalBeneficiaries),
      عدد_البرامج_المجتمعية: String(communityPrograms.length)
    }));
  }, [communityPrograms, hasCommunityPrograms]);

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
    const newErrors: { [key: string]: string } = {};
    if (!formData.label_day || formData.label_day === "") {
      newErrors.label_day = 'يجب اختيار اليوم أو الليلة (حقل إلزامي)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onSave({ ...formData, sheet: 'daily_mosque_report' });
  };

  const isFarm = formData["نوع الموقع"] === "مزرعة";

  const lastTenDaysLabels = [
    "اليوم العشرون", "اليوم الحادي والعشرون", "اليوم الثاني والعشرون",
    "اليوم الثالث والعشرون", "اليوم الرابع والعشرون", "اليوم الخامس والعشرون",
    "اليوم السادس والعشرون", "اليوم السابع والعشرون", "اليوم الثامن والعشرون",
    "اليوم التاسع والعشرون", "اليوم الثلاثون"
  ];
  
  const showItikafSection = isAdmin || lastTenDaysLabels.some(label => formData.label_day?.includes(label));

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 animate-in text-right">
      {!isAdmin && (
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-[#0054A6]"></div>
          <h3 className="text-xl font-black text-[#003366] mb-8 flex items-center gap-3">
             <span className="w-10 h-10 bg-[#0054A6]/10 rounded-xl flex items-center justify-center text-xl">👤</span>
             بيانات المشرف الميداني
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المسجد / الموقع</label>
               <select value={selectedMosqueCode} onChange={handleMosqueChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none">
                 <option value="">اختر من القائمة...</option>
                 {mosques.map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
               <input type="password" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#0054A6] shadow-inner text-center tracking-widest" />
            </div>
          </div>
        </div>
      )}

      {(isPasswordCorrect || isAdmin) && (
        <div className="space-y-8 animate-in">
          <InputGroup title="الوقت والموقع" icon="📅">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest flex items-center gap-1">
                 اليوم / الليلة <span className="text-red-500 font-black">*</span>
               </label>
               <select 
                 name="label_day" 
                 value={formData.code_day}
                 onChange={(e) => {
                   const selectedCode = e.target.value;
                   const d = days.find(x => x.code_day === selectedCode);
                   setFormData(p => ({ 
                     ...p, 
                     label_day: d?.label || '', 
                     code_day: selectedCode 
                   }));
                   if (errors.label_day) setErrors(prev => ({ ...prev, label_day: '' }));
                 }} 
                 className={`px-4 py-3 border-2 rounded-lg bg-white font-bold outline-none transition-all appearance-none ${errors.label_day ? 'border-red-500 bg-red-50/30' : 'focus:border-[#0054A6]'}`} 
               >
                 <option value="">اختر اليوم...</option>
                 {days.map(d => <option key={d.code_day} value={d.code_day}>{d.label}</option>)}
               </select>
               {errors.label_day && <span className="text-red-600 text-[10px] font-black mr-2 animate-pulse">⚠️ {errors.label_day}</span>}
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">التاريخ الهجري</label>
               <input type="text" value={formData.تاريخ_هجري} readOnly className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-lg text-slate-400 font-bold" />
            </div>
          </InputGroup>

          <InputGroup title="إحصائيات المصلين والإفطار" icon="🕌">
            {!isFarm && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المصلين (رجال)</label>
                  <input type="text" inputMode="numeric" name="عدد_المصلين_رجال" value={formData.عدد_المصلين_رجال} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المصلين (نساء)</label>
                  <input type="text" inputMode="numeric" name="عدد_المصلين_نساء" value={formData.عدد_المصلين_نساء} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">وجبات الإفطار</label>
              <input type="text" inputMode="numeric" name="عدد_وجبات_الافطار_فعلي" value={formData.عدد_وجبات_الافطار_فعلي} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كراتين ماء</label>
              <input type="text" inputMode="numeric" name="عدد_كراتين_ماء" value={formData.عدد_كراتين_ماء} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">مستفيدي الضيافة</label>
              <input type="text" inputMode="numeric" name="عدد_مستفيدي_الضيافة" value={formData.عدد_مستفيدي_الضيافة} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
          </InputGroup>

          <InputGroup title="الحلقات القرآنية" icon="📖">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">طلاب الحلقات</label>
              <input type="text" inputMode="numeric" name="عدد_طلاب_الحلقات" value={formData.عدد_طلاب_الحلقات} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الأوجه المنجزة (طلاب)</label>
              <input type="text" inputMode="numeric" name="عدد_الاوجه_طلاب" value={formData.عدد_الاوجه_طلاب} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">طالبات الحلقات</label>
              <input type="text" inputMode="numeric" name="عدد_طالبات_الحلقات" value={formData.عدد_طالبات_الحلقات} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الأوجه المنجزة (طالبات)</label>
              <input type="text" inputMode="numeric" name="عدد_الاوجه_طالبات" value={formData.عدد_الاوجه_طالبات} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
          </InputGroup>

          <InputGroup title="البرامج الدعوية" icon="📢">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمات رجالية</label>
              <input type="text" inputMode="numeric" name="عدد_الكلمات_الرجالية" value={formData.عدد_الكلمات_الرجالية} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمات نسائية</label>
              <input type="text" inputMode="numeric" name="عدد_الكلمات_النسائية" value={formData.عدد_الكلمات_النسائية} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">مستفيدي الكلمات</label>
              <input type="text" inputMode="numeric" name="عدد_مستفيدي_الكلمات" value={formData.عدد_مستفيدي_الكلمات} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المسابقات</label>
              <input type="text" inputMode="numeric" name="عدد_المسابقات" value={formData.عدد_المسابقات} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">أطفال الحضانة</label>
              <input type="text" inputMode="numeric" name="عدد_اطفال_الحضانة" value={formData.عدد_اطفال_الحضانة} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
          </InputGroup>

          <InputGroup title="القوى البشرية" icon="👥">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المشرفين</label>
              <input type="text" inputMode="numeric" name="عدد المشرفين" value={formData["عدد المشرفين"]} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المتطوعين</label>
              <input type="text" inputMode="numeric" name="عدد_المتطوعين" value={formData.عدد_المتطوعين} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
            </div>
          </InputGroup>

          <InputGroup title="البرامج المجتمعية" icon="🤝">
            <div className="col-span-full">
                <label className="block text-sm font-bold text-slate-600 mb-2">هل هناك برامج مجتمعية؟</label>
                <div className="flex gap-4">
                    <button type="button" onClick={() => setHasCommunityPrograms(true)} className={`flex-1 py-2 px-4 rounded-md font-bold transition-all text-sm ${hasCommunityPrograms ? 'bg-[#0054A6] text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>نعم</button>
                    <button type="button" onClick={() => { setHasCommunityPrograms(false); setCommunityPrograms([]); }} className={`flex-1 py-2 px-4 rounded-md font-bold transition-all text-sm ${!hasCommunityPrograms ? 'bg-[#C5A059] text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>لا</button>
                </div>
            </div>

            {hasCommunityPrograms && (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-slate-200 mt-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كم عدد البرامج المجتمعية المقامة؟</label>
                      <input 
                        type="number" 
                        value={communityPrograms.length}
                        onChange={(e) => handleCommunityProgramsCountChange(e.target.value)} 
                        min="0"
                        max="15"
                        placeholder="0"
                        className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">إجمالي عدد المستفيدين</label>
                      <input 
                        type="text"
                        value={communityPrograms.reduce((sum, p) => sum + (parseInt(p.beneficiaries, 10) || 0), 0)}
                        readOnly 
                        className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6] bg-slate-50 text-slate-500"
                      />
                    </div>

                                        {communityPrograms.map((program, index) => (
                        <div key={index} className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-dashed border-slate-200 pt-6 mt-6 animate-in">
                            <h4 className="text-md font-bold text-[#0054A6] col-span-full">البرنامج {index + 1}</h4>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم البرنامج</label>
                              <input 
                                type="text"
                                value={program.name} 
                                onChange={(e) => handleCommunityProgramChange(index, 'name', e.target.value)} 
                                placeholder="مثال: مصابيح"
                                className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">وصف البرنامج</label>
                              <input 
                                type="text"
                                value={program.description} 
                                onChange={(e) => handleCommunityProgramChange(index, 'description', e.target.value)} 
                                placeholder="وصف مختصر للبرنامج"
                                className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عدد المستفيدين</label>
                              <input 
                                type="number" 
                                value={program.beneficiaries} 
                                onChange={(e) => handleCommunityProgramChange(index, 'beneficiaries', e.target.value)} 
                                placeholder="0"
                                className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]"
                              />
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </InputGroup>

          {showItikafSection && (
            <InputGroup title="الاعتكاف والسحور" icon="🌙">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المعتكفين (رجال)</label>
                <input type="text" inputMode="numeric" name="عدد_المعتكفين_رجال" value={formData.عدد_المعتكفين_رجال} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">وجبات سحور (رجال)</label>
                <input type="text" inputMode="numeric" name="عدد_وجبات_السحور_رجال" value={formData.عدد_وجبات_السحور_رجال} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المعتكفين (نساء)</label>
                <input type="text" inputMode="numeric" name="عدد_المعتكفين_نساء" value={formData.عدد_المعتكفين_نساء} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">وجبات سحور (نساء)</label>
                <input type="text" inputMode="numeric" name="عدد_وجبات_السحور_نساء" value={formData.عدد_وجبات_السحور_نساء} onChange={handleChange} placeholder="0" className="px-4 py-3 border-2 border-slate-100 rounded-lg font-bold outline-none focus:border-[#0054A6]" />
              </div>
            </InputGroup>
          )}

          {isAdmin && (
            <div className="bg-[#003366] p-10 rounded-[3rem] shadow-2xl text-white border-b-8 border-[#C5A059]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">🔐</span>
                اعتماد التقرير الميداني
              </h3>
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mr-2">تغيير حالة الاعتماد</label>
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

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">📝</div>
                <label className="text-xl font-black text-[#003366] uppercase tracking-widest">ملاحظات ومرئيات إضافية</label>
             </div>
             <textarea name="ملاحظات" value={formData.ملاحظات} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none focus:bg-white border-2 border-transparent focus:border-[#0054A6] font-bold text-[#003366] shadow-inner" placeholder="هل هناك أي تحديات أو قصص نجاح تود مشاركتها؟" />
          </div>

          <div className="fixed bottom-10 left-0 right-0 px-4 z-[50] pointer-events-none">
            <div className="w-full max-w-lg mx-auto flex gap-2">
                <button 
                  type="button"
                  onClick={handleFormSubmit} 
                  className="pointer-events-auto flex-grow bg-[#0054A6] text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-[#003366]"
                >
                  {isAdmin ? '💾 حفظ التعديلات والاعتماد النهائي' : '📤 إرسال التقرير للمراجعة'}
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

export default RecordForm;