
import React, { useState, useMemo } from 'react';
import { MosqueRecord, MosqueInfo, DayInfo, EidRecord } from '../types.ts';

interface RecordListProps {
  records: (MosqueRecord | EidRecord)[];
  mosques: MosqueInfo[];
  days: DayInfo[];
  isAdmin: boolean;
  onEdit: (record: any) => void;
  onAddNew: (type: string) => void;
  onBulkUpdate: (recordIds: string[], newStatus: 'يعتمد' | 'مرفوض') => void;
  isEid?: boolean;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'يعتمد': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'مرفوض': return 'bg-red-100 text-red-700 border-red-200';
    case 'معتمد': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'يعاد التقرير': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

const RecordList: React.FC<RecordListProps> = ({ records, mosques, days, isAdmin, onEdit, onAddNew, onBulkUpdate, isEid = false }) => {
  const [filters, setFilters] = useState({ 
    mosque: '', 
    day: isEid ? 'DAY_Eid' : '', 
    status: '',
    formType: isEid ? 'eid' : 'daily'
  });
  const [selected, setSelected] = useState<string[]>([]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

    const filteredRecords = useMemo(() => {
    return (records || [])
      .filter(r => {
        const mosqueMatch = !filters.mosque || r.mosque_code === filters.mosque;
        const dayMatch = !filters.day || r.code_day === filters.day;
        const statusMatch = !filters.status || (r.الاعتماد || 'قيد المراجعة') === filters.status;
        
        // Determine form type of the record
        let recordType = 'daily';
        if ('عدد_هدايا_العيد' in r) recordType = 'eid';
        if ('أعمال_الصيانة_عدد' in r) recordType = 'maintenance';
        
        const typeMatch = !filters.formType || recordType === filters.formType;
        
        return mosqueMatch && dayMatch && statusMatch && typeMatch;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [records, filters]);

  // Update isEid based on filter if we are in a combined view
  const currentIsEid = filters.formType === 'eid';
  const currentIsMaintenance = filters.formType === 'maintenance';

  const handleSelect = (recordId: string) => {
    setSelected(prev => 
      prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredRecords.length) {
      setSelected([]);
    } else {
      setSelected(filteredRecords.map(r => r.record_id));
    }
  };

  const handleBulkAction = (status: 'يعتمد' | 'مرفوض') => {
    if (selected.length === 0) return;
    onBulkUpdate(selected, status);
    setSelected([]);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6 text-right" dir="rtl">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-black text-[#003366]">
               {filters.formType === 'eid' ? 'سجلات تقارير العيد' : 
                filters.formType === 'maintenance' ? 'سجلات الصيانة والنظافة' : 
                'سجلات الأنشطة الميدانية'}
             </h1>
             {isAdmin && <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mt-1 block">وضع المسؤول مفعل 🔐</span>}
          </div>
          <button onClick={() => onAddNew(filters.formType)} className="p-4 bg-[#0054A6] text-white rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-black text-sm hidden sm:inline">إضافة تقرير</span>
          </button>
        </div>
        
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select name="formType" value={filters.formType} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-[#0054A6] shadow-sm appearance-none text-[#0054A6]">
            <option value="daily">تقرير المسجد اليومي</option>
            <option value="eid">تقرير صلاة العيد</option>
            <option value="maintenance">تقرير الصيانة والنظافة</option>
          </select>
          <select name="mosque" value={filters.mosque} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-[#0054A6] shadow-sm appearance-none">
            <option value="">كل المساجد</option>
            {(mosques || []).map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
          </select>
          <select name="day" value={filters.day} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-[#0054A6] shadow-sm appearance-none">
            <option value="">كل الأيام</option>
            {(days || []).map(d => <option key={d.code_day} value={d.code_day}>{d.label}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-[#0054A6] shadow-sm appearance-none">
            <option value="">كل الحالات</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="يعتمد">يعتمد</option>
            <option value="مرفوض">مرفوض</option>
          </select>
        </div>
      </div>

            {isAdmin && selected.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between animate-in fade-in border border-slate-200">
          <p className="text-sm font-bold text-slate-600">تم تحديد {selected.length} سجلات</p>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('يعتمد')} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs">✅ اعتماد المحدد</button>
            <button onClick={() => handleBulkAction('مرفوض')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs">❌ رفض المحدد</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="p-4 w-12">
                  {isAdmin && <input type="checkbox" onChange={handleSelectAll} checked={selected.length === filteredRecords.length && filteredRecords.length > 0} className="rounded border-slate-300" />}
                </th>
                <th className="px-8 py-6 text-right">المسجد</th>
                <th className="px-8 py-6 text-right">اليوم / الليلة</th>
                {currentIsMaintenance ? (
                  <>
                    <th className="px-8 py-6 text-center">أعمال صيانة</th>
                    <th className="px-8 py-6 text-center">أعمال نظافة</th>
                    <th className="px-8 py-6 text-center">كراتين الماء</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-6 text-center">إجمالي المصلين</th>
                    {currentIsEid ? (
                      <>
                        <th className="px-8 py-6 text-center">هدايا العيد</th>
                        <th className="px-8 py-6 text-center">السقيا</th>
                      </>
                    ) : (
                      <>
                        <th className="px-8 py-6 text-center">وجبات الإفطار</th>
                        <th className="px-8 py-6 text-center">المعتكفين</th>
                        <th className="px-8 py-6 text-center">وجبات السحور</th>
                      </>
                    )}
                  </>
                )}
                <th className="px-8 py-6 text-center">الحالة</th>
                <th className="px-8 py-6 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                                                <tr key={record.record_id} className={`transition-colors group ${selected.includes(record.record_id) ? 'bg-[#0054A6]/10' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4">
                    {isAdmin && <input type="checkbox" checked={selected.includes(record.record_id)} onChange={() => handleSelect(record.record_id)} className="rounded border-slate-300" />}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-black text-[#003366] text-sm">{record.المسجد}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{record.mosque_code}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-xs font-black text-[#0054A6] bg-[#0054A6]/10 px-4 py-2 rounded-xl inline-block">
                      {record.label_day || record.code_day || (record as any).اليوم || (record as any).label}
                    </span>
                  </td>
                  {currentIsMaintenance ? (
                    <>
                      <td className="px-8 py-6 text-center">
                        <div className="font-black text-slate-700 text-lg tabular-nums">
                          {Number((record as any).أعمال_الصيانة_عدد || 0).toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="font-black text-slate-700 text-lg tabular-nums">
                          {Number((record as any).أعمال_النظافة_عدد || 0).toLocaleString('en-US')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="font-black text-blue-600 text-lg tabular-nums">
                          {Number((record as any).عدد_كراتين_الماء_الواقعي || 0).toLocaleString('en-US')}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-8 py-6 text-center">
                        <div className="font-black text-slate-700 text-lg tabular-nums">
                          {(Number((record as any).عدد_المصلين_رجال || 0) + Number((record as any).عدد_المصلين_نساء || 0)).toLocaleString('en-US')}
                        </div>
                      </td>
                      {currentIsEid ? (
                        <>
                          <td className="px-8 py-6 text-center">
                            <div className="font-black text-[#C5A059] text-lg tabular-nums">
                              {Number((record as any).عدد_هدايا_العيد || 0).toLocaleString('en-US')}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="font-black text-blue-600 text-lg tabular-nums">
                              {Number((record as any).السقيا || 0).toLocaleString('en-US')}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-8 py-6 text-center">
                            <div className="font-black text-slate-700 text-lg tabular-nums">
                              {Number((record as any).عدد_وجبات_الافطار_فعلي || 0).toLocaleString('en-US')}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="font-black text-indigo-600 text-lg tabular-nums">
                              {(Number((record as any).عدد_المعتكفين_رجال || 0) + Number((record as any).عدد_المعتكفين_نساء || 0)).toLocaleString('en-US')}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="font-black text-emerald-600 text-lg tabular-nums">
                              {(Number((record as any).عدد_وجبات_السحور_رجال || 0) + Number((record as any).عدد_وجبات_السحور_نساء || 0)).toLocaleString('en-US')}
                            </div>
                          </td>
                        </>
                      )}
                    </>
                  )}
                  <td className="px-8 py-6 text-center whitespace-nowrap">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm ${getStatusStyle(record.الاعتماد || '')}`}>
                      {record.الاعتماد || 'قيد المراجعة'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {((record.الاعتماد !== 'يعتمد' && record.الاعتماد !== 'معتمد') || isAdmin) ? (
                      <button 
                        onClick={() => onEdit(record)} 
                        className={`text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-sm ${
                          isAdmin ? 'bg-[#003366] text-white hover:bg-[#0054A6]' : 'text-[#0054A6] bg-[#0054A6]/5 hover:bg-[#0054A6]/10 border border-[#0054A6]/10'
                        }`}
                      >
                        {isAdmin ? 'مراجعة واعتماد' : 'تعديل التقرير'}
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-[10px] font-black flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        تم الاعتماد
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={currentIsMaintenance ? 8 : (currentIsEid ? 7 : 8)} className="px-8 py-20 text-center text-slate-400 font-bold">لا توجد سجلات مطابقة للبحث...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordList;