import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { ArrowLeft, Bell, ChevronDown, ShoppingBag } from 'lucide-react';

export default function Calendar() {
  const { setSubView } = useStore();
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [activeSubTab, setActiveSubTab] = useState<'spends' | 'categories'>('spends');

  const fmt = (v: number) => formatCents(v);

  // Hardcoded calendar details for April 2023 matching the Figma mockup
  const monthDays = useMemo(() => {
    // Mon - Sun starting offset for April 2023. April 1, 2023 was Saturday.
    // So offset is 5 empty cells at the start
    const days: (number | null)[] = [null, null, null, null, null, 1, 2];
    for (let i = 3; i <= 31; i++) {
      days.push(i);
    }
    return days;
  }, []);

  const weekHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Mock list of transactions for selected day (April 24) matching Figma
  const dailyTransactions = useMemo(() => {
    if (selectedDay === 24) {
      return [
        {
          id: 101,
          name: 'Supermercado',
          time: '17:00 - 24 de Abril',
          tag: 'Despensa',
          amount: 10000,
          type: 'expense' as const,
          icon: 'utensils'
        },
        {
          id: 102,
          name: 'Otros',
          time: '17:00 - 24 de Abril',
          tag: 'Pagos',
          amount: 12000,
          type: 'income' as const,
          icon: 'plus'
        }
      ];
    }
    return [];
  }, [selectedDay]);

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* 1. Header Area (Calendario.png) */}
      <div className="bg-[#00C795] text-white pt-10 pb-16 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSubView(null)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Calendario</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Calendar grid rounded card */}
      <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Month & Year Selectors */}
        <div className="flex justify-between items-center mb-2 px-1">
          <button className="flex items-center gap-1 text-[#00C795] font-extrabold text-base">
            <span>Abril</span>
            <ChevronDown className="w-4 h-4 stroke-[3]" />
          </button>
          <button className="flex items-center gap-1 text-[#00C795] font-extrabold text-base">
            <span>2023</span>
            <ChevronDown className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400">
          {weekHeaders.map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-extrabold text-slate-600">
          {monthDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const isSelected = selectedDay === day;
            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                className={`py-2 rounded-full font-extrabold transition-all relative flex items-center justify-center mx-auto w-8 h-8 ${
                  isSelected
                    ? 'bg-[#00C795] text-white shadow-md shadow-[#00C795]/30'
                    : 'hover:bg-slate-100'
                }`}
              >
                {day}
                {/* Visual marker if there are transactions */}
                {(day === 24 || day === 30 || day === 15) && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 bg-[#00C795] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Sub Tabs: Spends vs Categories */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={() => setActiveSubTab('spends')}
            className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeSubTab === 'spends'
                ? 'bg-[#00C795] text-white shadow-sm'
                : 'bg-[#E6F7F0] text-[#103E2E]'
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeSubTab === 'categories'
                ? 'bg-[#00C795] text-white shadow-sm'
                : 'bg-[#E6F7F0] text-[#103E2E]'
            }`}
          >
            Categorías
          </button>
        </div>

      </div>

      {/* 4. Transactions List for Selected Day */}
      <div className="space-y-3">
        {dailyTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-[#E6F7F0] text-sm">
            Sin transacciones para el día {selectedDay} de Abril
          </div>
        ) : (
          dailyTransactions.map(tx => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 bg-white border border-[#E6F7F0] rounded-3xl px-4 py-3.5 shadow-sm"
              >
                {/* Circular Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-[#E0EFFF]`}>
                  <ShoppingBag className="w-5 h-5 text-[#007AFF]" />
                </div>

                {/* Name & Date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-[#1E293B] truncate">{tx.name}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{tx.time}</p>
                </div>

                {/* Subtag */}
                <div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase">
                    {tx.tag}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right pl-2">
                  <p className={`text-base font-extrabold ${
                    isIncome ? 'text-[#00C795]' : 'text-[#007AFF]'
                  }`}>
                    {isIncome ? '+' : '-'}{fmt(tx.amount)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
