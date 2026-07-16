import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { Search, Calendar, ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Analysis() {
  const { stats, setSubView, fetchTransactions, transactions, goals, fetchGoals } = useStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'year'>('monthly');

  const fmt = (v: number) => formatCents(v);

  // Fetch transactions and goals on mount
  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, [fetchTransactions, fetchGoals]);

  const balanceVal = stats?.balance ?? 0;
  const incomeVal = stats?.income ?? 0;
  const expenseVal = stats?.expense ?? 0;

  // Helper date generators for current week Mon-Sun
  const getDaysOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sun, 1 = Mon ...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return weekdays.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return { name, dateStr };
    });
  };

  // Helper weeks builder for current month
  const getWeeksOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    return [
      { name: 'Sem 1', start: new Date(year, month, 1), end: new Date(year, month, 7) },
      { name: 'Sem 2', start: new Date(year, month, 8), end: new Date(year, month, 14) },
      { name: 'Sem 3', start: new Date(year, month, 15), end: new Date(year, month, 21) },
      { name: 'Sem 4', start: new Date(year, month, 22), end: new Date(year, month, 31) },
    ];
  };

  // Dynamic Chart Data Calculation (Point 7)
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [
        { name: 'Ene', Ingresos: 0, Gastos: 0 },
        { name: 'Feb', Ingresos: 0, Gastos: 0 },
        { name: 'Mar', Ingresos: 0, Gastos: 0 },
        { name: 'Abr', Ingresos: 0, Gastos: 0 },
        { name: 'May', Ingresos: 0, Gastos: 0 },
        { name: 'Jun', Ingresos: 0, Gastos: 0 },
        { name: 'Jul', Ingresos: 0, Gastos: 0 },
      ];
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    if (period === 'daily') {
      const days = getDaysOfCurrentWeek();
      return days.map(dayObj => {
        let incomeTotal = 0;
        let expenseTotal = 0;
        transactions.forEach(tx => {
          if (tx.date === dayObj.dateStr) {
            if (tx.type === 'income') incomeTotal += tx.amount;
            else expenseTotal += tx.amount;
          }
        });
        return {
          name: dayObj.name,
          Ingresos: incomeTotal / 100,
          Gastos: expenseTotal / 100,
        };
      });
    }

    if (period === 'weekly') {
      const weeks = getWeeksOfCurrentMonth();
      return weeks.map(weekObj => {
        let incomeTotal = 0;
        let expenseTotal = 0;
        transactions.forEach(tx => {
          const txDate = new Date(tx.date + 'T00:00:00');
          if (txDate >= weekObj.start && txDate <= weekObj.end) {
            if (tx.type === 'income') incomeTotal += tx.amount;
            else expenseTotal += tx.amount;
          }
        });
        return {
          name: weekObj.name,
          Ingresos: incomeTotal / 100,
          Gastos: expenseTotal / 100,
        };
      });
    }

    if (period === 'monthly') {
      const monthsList = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthsList.map((name, index) => {
        let incomeTotal = 0;
        let expenseTotal = 0;
        transactions.forEach(tx => {
          const txDate = new Date(tx.date + 'T00:00:00');
          if (txDate.getFullYear() === currentYear && txDate.getMonth() === index) {
            if (tx.type === 'income') incomeTotal += tx.amount;
            else expenseTotal += tx.amount;
          }
        });
        return {
          name,
          Ingresos: incomeTotal / 100,
          Gastos: expenseTotal / 100,
        };
      });
    }

    if (period === 'year') {
      const years = [currentYear - 2, currentYear - 1, currentYear];
      return years.map(yr => {
        let incomeTotal = 0;
        let expenseTotal = 0;
        transactions.forEach(tx => {
          const txDate = new Date(tx.date + 'T00:00:00');
          if (txDate.getFullYear() === yr) {
            if (tx.type === 'income') incomeTotal += tx.amount;
            else expenseTotal += tx.amount;
          }
        });
        return {
          name: yr.toString(),
          Ingresos: incomeTotal / 100,
          Gastos: expenseTotal / 100,
        };
      });
    }

    return [];
  }, [transactions, period]);

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* 1. Header Balance Summary (Analisis.png) */}
      <div className="bg-[#00C795] rounded-b-[40px] px-6 pt-10 pb-20 text-white relative -mx-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Análisis</h1>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Balance detail card */}
        <div className="absolute left-6 right-6 bottom-[-40px] bg-white rounded-3xl p-5 shadow-lg border border-[#E6F7F0] text-[#1E293B] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saldo Total</p>
              <h2 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">{fmt(balanceVal)}</h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gastos Totales</p>
              <h2 className="text-lg font-bold text-[#007AFF] tracking-tight">-{fmt(expenseVal)}</h2>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-[#E6F7F0] rounded-full h-3.5 overflow-hidden">
              <div className="bg-[#007AFF] h-full rounded-full transition-all duration-500" style={{ width: '30%' }} />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
              <span>30%</span>
              <span>$20,000.00</span>
            </div>
          </div>

          {/* Check message */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-[#00C795]" />
            <span>30% de tus gastos, todo se ve bien.</span>
          </div>
        </div>
      </div>

      {/* Spacer for header */}
      <div className="h-8" />

      {/* 2. Switcher Tabs (Daily, Weekly, Monthly, Year) - Point 7 */}
      <div className="bg-[#E6F7F0] p-1.5 rounded-full flex justify-between items-center">
        {([
          { id: 'daily', label: 'Diario' },
          { id: 'weekly', label: 'Semanal' },
          { id: 'monthly', label: 'Mensual' },
          { id: 'year', label: 'Anual' }
        ] as const).map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              period === p.id
                ? 'bg-[#00C795] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 3. Income & Expenses Chart Container */}
      <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-extrabold text-[#1E293B]">Ingresos y Gastos</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSubView('search')}
              className="p-2 bg-[#E6F7F0] text-[#00C795] rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setSubView('calendar')}
              className="p-2 bg-[#E6F7F0] text-[#00C795] rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Dual Bar Chart (Recharts) */}
        <div className="h-52 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} />
              {/* Teal Bar for Income */}
              <Bar dataKey="Ingresos" fill="#00C795" radius={[4, 4, 0, 0]} maxBarSize={10} />
              {/* Blue Bar for Expense */}
              <Bar dataKey="Gastos" fill="#007AFF" radius={[4, 4, 0, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Totals Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Total */}
        <div className="bg-white border border-[#E6F7F0] rounded-3xl p-4 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[#00C795] mb-2">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos</p>
          <p className="text-base font-extrabold text-[#00C795] mt-1">{fmt(incomeVal)}</p>
        </div>

        {/* Expense Total */}
        <div className="bg-white border border-[#E6F7F0] rounded-3xl p-4 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#E0EFFF] flex items-center justify-center text-[#007AFF] mb-2">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gastos</p>
          <p className="text-base font-extrabold text-[#007AFF] mt-1">{fmt(expenseVal)}</p>
        </div>
      </div>

      {/* 5. My Targets Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-[#1E293B]">Mis Metas</h3>
          <button 
            onClick={() => setSubView('goals')}
            className="text-xs font-bold text-[#00C795] hover:opacity-80 transition-opacity"
          >
            Gestionar Metas
          </button>
        </div>
        
        {!goals || goals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-3xl border border-[#E6F7F0]">
            No tienes metas creadas. <button onClick={() => setSubView('goals')} className="text-[#00C795] font-extrabold underline hover:opacity-80">Crear meta</button>
          </div>
        ) : (
          goals.slice(0, 3).map((goal) => {
            const progressPct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            return (
              <div 
                key={goal.id}
                onClick={() => setSubView('goals')}
                className="bg-white border border-[#E6F7F0] rounded-3xl p-4 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: (goal.color || '#00C795') + '15' }}>
                    <Target className="w-5 h-5" style={{ color: goal.color || '#00C795' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-extrabold text-[#1E293B] truncate">{goal.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progressPct}%`, backgroundColor: goal.color || '#00C795' }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
