
import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, MosqueInfo, DayInfo } from '../types.ts';

interface MaintenanceDashboardProps {
  records: MaintenanceRecord[];
  mosques: MosqueInfo[];
  days: DayInfo[];
  isAdmin: boolean;
  onEdit: (record: MaintenanceRecord) => void;
  onBack: () => void;
  onAddNew: () => void;
  onBulkUpdate: (recordIds: string[], newStatus: 'يعتمد' | 'مرفوض') => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'يعتمد': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'مرفوض': return 'bg-red-50 text-red-600 border-red-100';
    case 'معتمد': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ records, mosques, days, isAdmin, onEdit, onBack, onAddNew, onBulkUpdate }) => {
  const [filters, setFilters] = useState({ mosque: '', day: '', status: '' });
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
        return mosqueMatch && dayMatch && statusMatch;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [records, filters]);

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
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-black text-[#003366]">لوحة الصيانة والنظافة</h2>
            <p className="text-slate-400 text-sm font-bold">متابعة وإدارة تقارير الصيانة الدورية</p>
          </div>
        </div>
        <button onClick={onAddNew} className="bg-[#0054A6] text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-[#003366] transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            تقرير جديد
        </button>
      </div>

            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="mosque" value={filters.mosque} onChange={handleFilterChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none">
            <option value="">كل المساجد</option>
            {(mosques || []).map(m => <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>)}
          </select>
          <select name="day" value={filters.day} onChange={handleFilterChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none">
            <option value="">كل الأيام</option>
            {(days || []).map(d => <option key={d.code_day} value={d.code_day}>{d.label}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-lg font-bold outline-none focus:border-[#0054A6] shadow-inner appearance-none">
            <option value="">كل الحالات</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="يعتمد">يعتمد</option>
            <option value="مرفوض">مرفوض</option>
          </select>
        </div>

        {isAdmin && selected.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
            <p className="text-sm font-bold text-slate-600">تم تحديد {selected.length} سجلات</p>
            <div className="flex gap-2">
              <button onClick={() => handleBulkAction('يعتمد')} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs">✅ اعتماد المحدد</button>
              <button onClick={() => handleBulkAction('مرفوض')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs">❌ رفض المحدد</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b-2 border-slate-100">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-4">
                                    {isAdmin && <input type="checkbox" onChange={handleSelectAll} checked={selected.length === filteredRecords.length && filteredRecords.length > 0} className="rounded border-slate-300" />}
                </th>
                <th className="px-4 py-5">المسجد</th>
                <th className="px-4 py-5">اليوم</th>
                <th className="px-4 py-5">أعمال صيانة</th>
                <th className="px-4 py-5">أعمال نظافة</th>
                <th className="px-4 py-5">كراتين الماء</th>
                <th className="px-4 py-5">الحالة</th>
                <th className="px-4 py-5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
                                <tr key={r.record_id || i} className={`transition-colors ${selected.includes(r.record_id) ? 'bg-[#0054A6]/10' : 'hover:bg-slate-50/50'}`}>
                                    <td className="p-4">
                    {isAdmin && <input type="checkbox" checked={selected.includes(r.record_id)} onChange={() => handleSelect(r.record_id)} className="rounded border-slate-300" />}
                  </td>
                  <td className="px-4 py-5 font-bold text-[#003366] whitespace-nowrap text-sm">{r.المسجد || 'غير محدد'}</td>
                  <td className="px-4 py-5 font-bold text-slate-600 whitespace-nowrap">{r.اليوم || r.label || r.label_day || 'غير محدد'}</td>
                  <td className="px-4 py-5 font-black text-slate-600 tabular-nums">{Number(r.أعمال_الصيانة_عدد || 0).toLocaleString('en-US')}</td>
                  <td className="px-4 py-5 font-black text-slate-600 tabular-nums">{Number(r.أعمال_النظافة_عدد || 0).toLocaleString('en-US')}</td>
                  <td className="px-4 py-5 font-black text-slate-600 tabular-nums">{Number(r.عدد_كراتين_الماء_الواقعي || 0).toLocaleString('en-US')}</td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${getStatusStyle(r.الاعتماد || '')}`}>
                      {r.الاعتماد || 'قيد المراجعة'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    {((r.الاعتماد !== 'يعتمد' && r.الاعتماد !== 'معتمد') || isAdmin) ? (
                      <button onClick={() => onEdit(r)} className="text-[#0054A6] text-xs font-black bg-[#0054A6]/10 px-4 py-2 rounded-lg hover:bg-[#0054A6]/20 transition-colors">
                        {isAdmin ? 'مراجعة واعتماد' : 'تعديل'}
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
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-bold">
                     <div className="text-3xl mb-2">🤷‍♂️</div>
                     لا توجد سجلات صيانة لعرضها حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;