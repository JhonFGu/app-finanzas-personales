/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { 
  ArrowLeft, Bell, Calendar, ArrowUpRight, ArrowDownRight, Plus, 
  Car, ShoppingBag, Edit2, Trash2, X, 
  Utensils, Pill, Key, Gift, Coins, Ticket, Home, Briefcase, Laptop, TrendingUp, HelpCircle
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
  home: Home,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  plus: Plus,
};

const getCategoryIcon = (iconStr: string | null, type: 'income' | 'expense') => {
  const IconComp = iconMap[iconStr ?? ''] || HelpCircle;
  const iconClass = type === 'income' ? 'w-5 h-5 text-[#00C795]' : 'w-5 h-5 text-[#007AFF]';
  return <IconComp className={iconClass} />;
};

export default function Transactions() {
  const { stats, setSubView, setActiveTab, transactions, fetchTransactions, deleteTransaction, setEditingTransaction } = useStore();
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fmt = (v: number) => formatCents(v);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const balanceVal = stats?.balance ?? 0;
  const incomeVal = stats?.income ?? 0;
  const expenseVal = stats?.expense ?? 0;

  // Group transactions by month
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    
    transactions.forEach(tx => {
      let monthName = 'Otros';
      if (tx.date) {
        const dateObj = new Date(tx.date + 'T00:00:00');
        if (!isNaN(dateObj.getTime())) {
          monthName = dateObj.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        }
      }
      if (!groups[monthName]) {
        groups[monthName] = [];
      }
      groups[monthName].push(tx);
    });

    return groups;
  }, [transactions]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta transacción?')) {
      try {
        await deleteTransaction(id);
        setSelectedTx(null);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleEdit = (tx: any) => {
    setEditingTransaction(tx);
    setSubView('add-expense');
    setSelectedTx(null);
  };

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* Header section (Transacciones.png) */}
      <div className="bg-[#00C795] text-white pt-10 pb-20 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Transacciones</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Overlapping Total Balance Card */}
        <div className="absolute left-6 right-6 bottom-[-24px] bg-white border border-[#E6F7F0] shadow-md rounded-3xl p-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Total</p>
          <h2 className="text-3xl font-extrabold text-[#1E293B] mt-1 tracking-tight">{fmt(balanceVal)}</h2>
        </div>
      </div>

      {/* Spacer for overlapping balance card */}
      <div className="h-6" />

      {/* Income & Expense Side-by-Side Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-white border border-[#E6F7F0] shadow-sm rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F7F0] flex items-center justify-center text-[#00C795]">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos</p>
            <p className="text-sm font-extrabold text-[#00C795] mt-0.5">{fmt(incomeVal)}</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white border border-[#E6F7F0] shadow-sm rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E0EFFF] flex items-center justify-center text-[#007AFF]">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gastos</p>
            <p className="text-sm font-extrabold text-[#007AFF] mt-0.5">{fmt(expenseVal)}</p>
          </div>
        </div>
      </div>

      {/* Transaction List Grouped by Month */}
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-[#E6F7F0]">
            No hay transacciones aún
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([month, txs]) => (
            <div key={month} className="space-y-3">
              {/* Month Header row */}
              <div className="flex justify-between items-center px-1">
                <h3 className="text-base font-extrabold text-[#1E293B]">{month}</h3>
                <button
                  onClick={() => setSubView('calendar')}
                  className="p-1.5 bg-[#E6F7F0] text-[#00C795] rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Transactions in Month */}
              <div className="space-y-3">
                {txs.map(tx => {
                  const isIncome = tx.type === 'income';
                  return (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="w-full text-left flex items-center gap-3 bg-white border border-[#E6F7F0] rounded-3xl px-4 py-3.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none"
                    >
                      {/* Circle Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isIncome ? 'bg-[#E6F7F0]' : 'bg-[#E0EFFF]'
                      }`}>
                        {getCategoryIcon(tx.categoryIcon, tx.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-[#1E293B] truncate">{tx.categoryName || 'Sin categoría'}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{tx.date}</p>
                      </div>

                      {/* Note Tag */}
                      <div className="hidden xs:block max-w-[120px] truncate">
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase truncate block">
                          {tx.note || (isIncome ? 'Ingreso' : 'Gasto')}
                        </span>
                      </div>

                      {/* Value */}
                      <div className="text-right pl-2">
                        <p className={`text-base font-extrabold ${
                          isIncome ? 'text-[#00C795]' : 'text-[#007AFF]'
                        }`}>
                          {isIncome ? '+' : '-'}{fmt(tx.amount)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal Overlay (Point 6) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-5 animate-scale-up text-[#1E293B]">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold">Detalle de Transacción</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Body */}
            <div className="space-y-4 text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                selectedTx.type === 'income' ? 'bg-[#E6F7F0]' : 'bg-[#E0EFFF]'
              }`}>
                {getCategoryIcon(selectedTx.categoryIcon, selectedTx.type)}
              </div>
              <div>
                <h4 className="text-lg font-black">{selectedTx.categoryName || 'Sin categoría'}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{selectedTx.date}</p>
              </div>

              <div className="py-2.5 bg-slate-50 rounded-2xl">
                <p className={`text-3xl font-black ${
                  selectedTx.type === 'income' ? 'text-[#00C795]' : 'text-[#007AFF]'
                }`}>
                  {selectedTx.type === 'income' ? '+' : '-'}{fmt(selectedTx.amount)}
                </p>
              </div>

              {selectedTx.note && (
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mensaje o Nota</span>
                  <p className="text-sm font-semibold text-slate-700 bg-slate-50/50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                    {selectedTx.note}
                  </p>
                </div>
              )}

              {/* Display attached image if present (Point 5/6) */}
              {selectedTx.imageUrl && (
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Comprobante</span>
                  <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-48">
                    <img 
                      src={selectedTx.imageUrl} 
                      alt="Comprobante" 
                      className="w-full object-cover max-h-48 cursor-pointer hover:opacity-95" 
                      onClick={() => window.open(selectedTx.imageUrl, '_blank')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedTx.id)}
                className="flex-1 py-3 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors font-extrabold text-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
              <button
                onClick={() => handleEdit(selectedTx)}
                className="flex-grow py-3 rounded-full bg-[#E0EFFF] text-[#007AFF] hover:bg-[#cbe3ff] transition-colors font-extrabold text-sm flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setSubView('add-expense')}
        className="fixed z-40 w-14 h-14 rounded-full bg-[#00C795] text-white shadow-lg shadow-[#00C795]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        style={{
          bottom: 'calc(var(--safe-bottom) + 5rem)',
          right: '1.25rem',
        }}
      >
        <Plus className="w-8 h-8 stroke-[2.5]" />
      </button>

    </div>
  );
}
