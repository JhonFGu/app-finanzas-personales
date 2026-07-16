/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { 
  Bell, CheckCircle2, Car, ShoppingBag, Home as HomeIcon, CheckCircle, 
  Utensils, Pill, Key, Gift, Coins, Ticket, Briefcase, Laptop, TrendingUp, HelpCircle, Target
} from 'lucide-react';

const iconMap: Record<string, any> = {
  utensils: Utensils,
  car: Car,
  pill: Pill,
  shopping: ShoppingBag,
  'shopping-bag': ShoppingBag,
  key: Key,
  gift: Gift,
  coins: Coins,
  ticket: Ticket,
  home: HomeIcon,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
};

const getCategoryIcon = (iconStr: string | null) => {
  const IconComp = iconMap[iconStr ?? ''] || HelpCircle;
  return <IconComp className="w-5 h-5 text-[#007AFF]" />;
};

export default function Dashboard() {
  const { 
    stats, 
    loading, 
    fetchStats, 
    user, 
    subscriptions, 
    fetchSubscriptions, 
    confirmSubscriptionPayment,
    goals,
    fetchGoals,
    setSubView,
    monthlyBudget
  } = useStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    fetchStats();
    fetchSubscriptions();
    fetchGoals();
  }, [fetchStats, fetchSubscriptions, fetchGoals]);

  const { totalSaved, totalTarget, progressPct, strokeDashoffset } = useMemo(() => {
    const saved = Array.isArray(goals) ? goals.reduce((sum, g) => sum + g.currentAmount, 0) : 0;
    const target = Array.isArray(goals) ? goals.reduce((sum, g) => sum + g.targetAmount, 0) : 0;
    const pct = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
    const circumference = 239;
    const offset = circumference - (pct / 100) * circumference;
    return { totalSaved: saved, totalTarget: target, progressPct: pct, strokeDashoffset: offset };
  }, [goals]);

  const fmt = (v: number) => formatCents(v);

  // Dynamic filter for pending subscriptions (Point 10)
  const filteredPending = useMemo(() => {
    const pending = Array.isArray(subscriptions) ? subscriptions.filter(sub => sub.status === 'pending') : [];
    const today = new Date();
    
    // Set hours to 0 to compare dates accurately
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStr = todayZero.toISOString().split('T')[0];

    // Current week start (Monday) and end (Sunday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const currentYear = todayZero.getFullYear();
    const currentMonth = todayZero.getMonth();

    return pending.filter(sub => {
      const subDate = new Date(sub.dueDate + 'T00:00:00');
      
      if (period === 'daily') {
        return sub.dueDate === todayStr;
      }
      if (period === 'weekly') {
        return subDate >= startOfWeek && subDate <= endOfWeek;
      }
      if (period === 'monthly') {
        return subDate.getFullYear() === currentYear && subDate.getMonth() === currentMonth;
      }
      return true;
    });
  }, [subscriptions, period]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#00C795] border-t-transparent rounded-full" />
      </div>
    );
  }

  const balanceVal = stats?.balance ?? 0;
  const expenseVal = stats?.expense ?? 0;

  const budgetPercent = monthlyBudget > 0 ? Math.min(100, Math.round((expenseVal / monthlyBudget) * 100)) : 0;
  let budgetMessage = `${budgetPercent}% de tus gastos, todo se ve bien.`;
  let budgetColorClass = 'text-emerald-600';
  let budgetBarColor = 'bg-[#007AFF]';
  if (budgetPercent > 80 && budgetPercent <= 100) {
    budgetMessage = `${budgetPercent}% de tu presupuesto. ¡Cuidado, te estás acercando al límite!`;
    budgetColorClass = 'text-yellow-600';
    budgetBarColor = 'bg-yellow-500';
  } else if (budgetPercent > 100) {
    budgetMessage = `${budgetPercent}% de tu presupuesto. ¡Has excedido tu límite mensual!`;
    budgetColorClass = 'text-red-500';
    budgetBarColor = 'bg-red-500';
  }

  const handlePay = async (id: number) => {
    try {
      await confirmSubscriptionPayment(id);
      alert('¡Pago confirmado e ingresado en las transacciones!');
    } catch (e: any) {
      alert(e.message || 'Error al confirmar pago');
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* 1. Header Area with Mint Green Curve (Pantalla Inicial.png) */}
      <div className="bg-[#00C795] rounded-b-[40px] px-6 pt-10 pb-20 text-white relative -mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold font-sans">Hola, bienvenido de nuevo</h1>
            <p className="text-xs text-white/80 font-medium">Buenos días, {user?.name || 'Invitado'}</p>
          </div>
          <button className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#00C795]" />
          </button>
        </div>

        {/* Overlapping Summary Card */}
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

          {/* Budget Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-[#E6F7F0] rounded-full h-3.5 overflow-hidden flex">
              <div className={`${budgetBarColor} h-full rounded-full transition-all duration-500`} style={{ width: `${budgetPercent}%` }} />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
              <span>{budgetPercent}%</span>
              <span>{fmt(monthlyBudget)}</span>
            </div>
          </div>

          {/* Budget Message */}
          <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold ${budgetColorClass}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{budgetMessage}</span>
          </div>
        </div>
      </div>

      {/* Spacer for overlapping card */}
      <div className="h-8" />

      {/* 2. Savings & Goal Summary Card */}
      <div 
        onClick={() => setSubView('goals')}
        className="bg-white rounded-3xl p-5 border border-[#E6F7F0] shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] transition-all"
      >
        {/* Left Side: Donut Goal Progress */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="#E6F7F0" strokeWidth="8" fill="transparent" />
              <circle 
                cx="48" 
                cy="48" 
                r="38" 
                stroke="#00C795" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="239" 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs font-black text-[#00C795]">{progressPct}%</span>
              <Target className="w-4 h-4 text-[#00C795] mt-0.5" />
            </div>
          </div>
          <span className="text-xs font-bold text-[#1E293B] mt-2">Ahorro para metas</span>
        </div>

        {/* Divider */}
        <div className="w-[1px] bg-slate-200 h-16" />

        {/* Right Side: Split Statistics */}
        <div className="flex-1 space-y-4 pr-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ahorro Acumulado</p>
            <p className="text-base font-black text-[#00C795] mt-0.5">{fmt(totalSaved)}</p>
          </div>
          <div className="h-[1px] bg-slate-100" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objetivo Total</p>
            <p className="text-base font-black text-[#1E293B] mt-0.5">{fmt(totalTarget)}</p>
          </div>
        </div>
      </div>

      {/* 3. Period Switcher Tabs */}
      <div className="bg-[#E6F7F0] p-1.5 rounded-full flex justify-between items-center">
        {([
          { id: 'daily', label: 'Diario' },
          { id: 'weekly', label: 'Semanal' },
          { id: 'monthly', label: 'Mensual' }
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

      {/* 4. Upcoming / Pending Subscriptions & Debts Section (Point 10) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#1E293B]">Novedades y Pagos Pendientes</h3>
        </div>

        {filteredPending.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-[#E6F7F0] text-sm">
            No hay pagos pendientes para este período
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPending.map((sub) => {
              const isOverdue = new Date(sub.dueDate + 'T00:00:00') < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 bg-white border border-[#E6F7F0] rounded-3xl px-4 py-3.5 shadow-sm"
                >
                  {/* Category circular icon wrapper */}
                  <div className="w-12 h-12 rounded-full bg-[#E0EFFF] flex items-center justify-center">
                    {getCategoryIcon(sub.categoryIcon)}
                  </div>
                  
                  {/* Left Info: Name & Date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1E293B] truncate">{sub.name}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${
                      isOverdue ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      Vence: {sub.dueDate} {isOverdue ? '(VENCIDO)' : ''}
                    </p>
                  </div>
                  
                  {/* Confirm Payment mini button */}
                  <div>
                    <button
                      onClick={() => handlePay(sub.id)}
                      className="px-3 py-1.5 bg-[#E6F7F0] hover:bg-[#d5f5e7] text-[#103E2E] rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pagar</span>
                    </button>
                  </div>

                  {/* Right Amount */}
                  <div className="text-right pl-2">
                    <p className="text-sm font-extrabold text-[#1E293B]">
                      {fmt(sub.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
