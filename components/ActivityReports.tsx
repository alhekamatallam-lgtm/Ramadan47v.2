
import React, { useState, useMemo } from 'react';
import { MosqueRecord, MosqueInfo, DayInfo } from '../types.ts';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, MapPin, Calendar, LayoutGrid, Droplets, Users, ShieldCheck } from 'lucide-react';

interface ActivityReportsProps {
  records: MosqueRecord[];
  mosques: MosqueInfo[];
  days: DayInfo[];
  onBack: () => void;
}

const ActivityReports: React.FC<ActivityReportsProps> = ({ records, mosques, days, onBack }) => {
  const [selectedMosque, setSelectedMosque] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.code_day || '');
  const [activeTab, setActiveTab] = useState<'iftar' | 'worshippers'>('iftar');

  const chartData = useMemo(() => {
    let filtered = records;
    if (selectedMosque) {
      filtered = records.filter(r => r.mosque_code === selectedMosque);
    }

    const dayOrder = days.map(d => d.code_day);
    
    const grouped = dayOrder.map(dayCode => {
      const dayLabel = days.find(d => d.code_day === dayCode)?.label || dayCode;
      const dayRecords = filtered.filter(r => r.code_day === dayCode);
      
      const iftarMeals = dayRecords.reduce((sum, r) => sum + Number(r.عدد_وجبات_الافطار_فعلي || 0), 0);
      const worshippers = dayRecords.reduce((sum, r) => sum + Number(r.عدد_المصلين_رجال || 0) + Number(r.عدد_المصلين_نساء || 0), 0);

      return {
        name: dayLabel,
        iftar: iftarMeals,
        worshippers: worshippers,
        code: dayCode
      };
    }).filter(d => d.iftar > 0 || d.worshippers > 0);

    return grouped;
  }, [records, selectedMosque, days]);

  const mosqueDistributionData = useMemo(() => {
    if (!selectedDay) return [];

    const dayRecords = records.filter(r => r.code_day === selectedDay);
    
    return mosques.map(m => {
      const record = dayRecords.find(r => r.mosque_code === m.mosque_code);
      return {
        name: m.المسجد,
        iftar: Number(record?.عدد_وجبات_الافطار_فعلي || 0),
        worshippers: Number(record?.عدد_المصلين_رجال || 0) + Number(record?.عدد_المصلين_نساء || 0),
        code: m.mosque_code
      };
    }).filter(d => activeTab === 'iftar' ? d.iftar > 0 : d.worshippers > 0)
      .sort((a, b) => activeTab === 'iftar' ? b.iftar - a.iftar : b.worshippers - a.worshippers);
  }, [records, mosques, selectedDay, activeTab]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { type: 'neutral', value: 0 };
    const last = activeTab === 'iftar' ? chartData[chartData.length - 1].iftar : chartData[chartData.length - 1].worshippers;
    const prev = activeTab === 'iftar' ? chartData[chartData.length - 2].iftar : chartData[chartData.length - 2].worshippers;
    const diff = last - prev;
    if (diff > 0) return { type: 'up', value: diff };
    if (diff < 0) return { type: 'down', value: Math.abs(diff) };
    return { type: 'neutral', value: 0 };
  }, [chartData, activeTab]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (activeTab === 'iftar' ? d.iftar : d.worshippers), 0);
  }, [chartData, activeTab]);

  const averageValue = useMemo(() => {
    return chartData.length > 0 ? Math.round(totalValue / chartData.length) : 0;
  }, [totalValue, chartData.length]);

  const extraStats = useMemo(() => {
    let filtered = records;
    if (selectedMosque) {
      filtered = records.filter(r => r.mosque_code === selectedMosque);
    }
    
    return {
      water: filtered.reduce((sum, r) => sum + Number(r.عدد_كراتين_ماء || 0), 0),
      volunteers: filtered.reduce((sum, r) => sum + Number(r.عدد_المتطوعين || 0), 0),
      supervisors: filtered.reduce((sum, r) => sum + Number(r["عدد المشرفين"] || 0), 0),
    };
  }, [records, selectedMosque]);

  return (
    <div className="space-y-8 animate-in fade-in text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-black text-[#003366]">تقارير الأداء والنمو</h2>
            <p className="text-slate-400 text-sm font-bold">تحليل بياني لتطور وجبات الإفطار وأعداد المصلين</p>
          </div>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-1">
          <button 
            onClick={() => setActiveTab('iftar')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'iftar' ? 'bg-[#0054A6] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            🍱 وجبات الإفطار
          </button>
          <button 
            onClick={() => setActiveTab('worshippers')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'worshippers' ? 'bg-[#0054A6] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            👥 أعداد المصلين
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
          <MapPin className="w-5 h-5 text-[#C5A059] mr-2" />
          <select 
            value={selectedMosque} 
            onChange={(e) => setSelectedMosque(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-[#003366] text-sm flex-grow md:w-64"
          >
            <option value="">جميع المساجد</option>
            {mosques.map(m => (
              <option key={m.mosque_code} value={m.mosque_code}>{m.المسجد}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shadow-sm">
            <Droplets className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">بطاقة السقيا</h4>
            <div className="text-2xl font-black text-[#003366] tabular-nums">
              {extraStats.water.toLocaleString('en-US')}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">إجمالي كراتين الماء</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">بطاقة المتطوعين</h4>
            <div className="text-2xl font-black text-[#003366] tabular-nums">
              {extraStats.volunteers.toLocaleString('en-US')}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">إجمالي المتطوعين</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">بطاقة المشرفين</h4>
            <div className="text-2xl font-black text-[#003366] tabular-nums">
              {extraStats.supervisors.toLocaleString('en-US')}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">إجمالي المشرفين</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#0054A6]"></div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
              {activeTab === 'iftar' ? 'إجمالي وجبات الإفطار' : 'إجمالي عدد المصلين'}
            </h3>
            <div className="text-4xl font-black text-[#003366] mb-4">
              {totalValue.toLocaleString('ar-SA')}
            </div>
            
            <div className="flex items-center gap-2">
              {trend.type === 'up' && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  <span>تزايد بمقدار {trend.value.toLocaleString('ar-SA')} عن اليوم السابق</span>
                </div>
              )}
              {trend.type === 'down' && (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                  <TrendingDown className="w-3 h-3" />
                  <span>تناقص بمقدار {trend.value.toLocaleString('ar-SA')} عن اليوم السابق</span>
                </div>
              )}
              {trend.type === 'neutral' && (
                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold">
                  <Minus className="w-3 h-3" />
                  <span>استقرار في الأداء</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#003366] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
             <h3 className="text-white/50 text-xs font-black uppercase tracking-widest mb-2">
               {activeTab === 'iftar' ? 'متوسط الوجبات يومياً' : 'متوسط المصلين يومياً'}
             </h3>
             <div className="text-4xl font-black mb-4">
               {averageValue.toLocaleString('ar-SA')}
             </div>
             <p className="text-white/60 text-xs font-bold">بناءً على {chartData.length} أيام من البيانات المسجلة</p>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-[#C5A059]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-[#003366]">منحنى النمو اليومي</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-1">
                 <div className={`w-3 h-3 rounded-full ${activeTab === 'iftar' ? 'bg-[#0054A6]' : 'bg-[#C5A059]'}`}></div>
                 <span>{activeTab === 'iftar' ? 'وجبات الإفطار' : 'أعداد المصلين'}</span>
               </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTab === 'iftar' ? '#0054A6' : '#C5A059'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeTab === 'iftar' ? '#0054A6' : '#C5A059'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1.5rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '1rem',
                    textAlign: 'right'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                  labelStyle={{ fontWeight: 900, color: '#003366', marginBottom: '0.5rem' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeTab === 'iftar' ? 'iftar' : 'worshippers'} 
                  name={activeTab === 'iftar' ? 'وجبات الإفطار' : 'أعداد المصلين'}
                  stroke={activeTab === 'iftar' ? '#0054A6' : '#C5A059'} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table for Trends */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[#C5A059]" />
          <h3 className="text-xl font-black text-[#003366]">تفاصيل البيانات اليومية</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">اليوم</th>
                <th className="px-8 py-4 text-center">
                  {activeTab === 'iftar' ? 'وجبات الإفطار' : 'أعداد المصلين'}
                </th>
                <th className="px-8 py-4 text-center">التغير</th>
                <th className="px-8 py-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {chartData.map((d, i) => {
                const val = activeTab === 'iftar' ? d.iftar : d.worshippers;
                const prev = i > 0 ? (activeTab === 'iftar' ? chartData[i-1].iftar : chartData[i-1].worshippers) : null;
                const diff = prev !== null ? val - prev : 0;
                
                return (
                  <tr key={d.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-[#003366]">{d.name}</td>
                    <td className="px-8 py-5 text-center font-black text-slate-700 tabular-nums">{val.toLocaleString('ar-SA')}</td>
                    <td className="px-8 py-5 text-center">
                      {prev !== null ? (
                        <div className={`flex items-center justify-center gap-1 font-bold text-xs ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString('ar-SA')}
                          {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        </div>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-8 py-5 text-center">
                       {diff > 0 ? (
                         <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">نمو 📈</span>
                       ) : diff < 0 ? (
                         <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">تراجع 📉</span>
                       ) : (
                         <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black">مستقر</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution by Mosque for Selected Day */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0054A6]/10 rounded-xl flex items-center justify-center text-[#0054A6]">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#003366]">
                {activeTab === 'iftar' ? 'توزيع الوجبات حسب المسجد' : 'توزيع المصلين حسب المسجد'}
              </h3>
              <p className="text-slate-400 text-[10px] font-bold">مقارنة أداء المساجد في يوم محدد</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full md:w-auto">
            <Calendar className="w-4 h-4 text-[#C5A059] mr-1" />
            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#003366] text-xs"
            >
              {days.map(d => (
                <option key={d.code_day} value={d.code_day}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {mosqueDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mosqueDistributionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#003366', fontSize: 11, fontWeight: 900 }}
                  width={150}
                  textAnchor="end"
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    textAlign: 'right'
                  }}
                />
                <Bar 
                  dataKey={activeTab === 'iftar' ? 'iftar' : 'worshippers'} 
                  name={activeTab === 'iftar' ? 'عدد الوجبات' : 'عدد المصلين'} 
                  radius={[0, 10, 10, 0]} 
                  barSize={25}
                >
                  {mosqueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#C5A059' : (activeTab === 'iftar' ? '#0054A6' : '#C5A059')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <div className="text-4xl">📊</div>
              <p className="font-bold">لا توجد بيانات مسجلة لهذا اليوم</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityReports;
