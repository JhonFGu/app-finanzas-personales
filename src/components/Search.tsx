/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { 
  ArrowLeft, Bell, ChevronDown, ShoppingBag, Car, X, Trash2, Edit2,
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

// Placeholder check for Plus icon import safety
import { Plus } from 'lucide-react';

const getCategoryIcon = (iconStr: string | null, type: 'income' | 'expense') => {
  const IconComp = iconMap[iconStr ?? ''] || HelpCircle;
  const iconClass = type === 'income' ? 'w-5 h-5 text-[#00C795]' : 'w-5 h-5 text-[#007AFF]';
  return <IconComp className={iconClass} />;
};

const monthsList = [
  { value: '', label: 'Cualquier mes' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export default function Search() {
  const { setSubView, categories, transactions, fetchTransactions, deleteTransaction, setEditingTransaction } = useStore();
  
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportType, setReportType] = useState<'income' | 'expense'>('expense');
  
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fmt = (v: number) => formatCents(v);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filtered = transactions.filter(tx => {
      // 1. Text keyword search on note
      if (query && !tx.note?.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      // 2. Category search
      if (selectedCat && tx.categoryId !== Number(selectedCat)) {
        return false;
      }
      // 3. Month search
      if (selectedMonth) {
        const txDate = new Date(tx.date + 'T00:00:00');
        const txMonth = txDate.getMonth() + 1; // 1-12
        if (txMonth !== Number(selectedMonth)) {
          return false;
        }
      }
      // 4. Report Type search
      if (reportType && tx.type !== reportType) {
        return false;
      }
      return true;
    });

    setResults(filtered);
    setSearched(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta transacción?')) {
      try {
        await deleteTransaction(id);
        setResults(prev => prev.filter(r => r.id !== id));
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
      
      {/* Header with Search Bar input integrated */}
      <div className="bg-[#00C795] text-white pt-10 pb-16 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setSubView(null)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Buscar</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Integrated search text input */}
        <form onSubmit={handleSearch} className="mt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por palabra clave..."
            className="w-full px-6 py-3.5 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm font-medium"
          />
        </form>
      </div>

      {/* Main Filter Form rounded card */}
      <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-5">
        
        {/* Category dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Categorías</label>
          <div className="relative">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] appearance-none font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all cursor-pointer"
            >
              <option value="">Cualquier categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#00C795] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Month Selector (Point 8) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Mes de Transacción</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] appearance-none font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#00C795] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Report Radios */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Reporte</label>
          <div className="flex gap-8 px-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-[#1E293B]">
              <input
                type="radio"
                name="reportType"
                checked={reportType === 'income'}
                onChange={() => setReportType('income')}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                reportType === 'income' ? 'border-[#00C795] bg-[#E6F7F0]' : 'border-slate-300'
              }`}>
                {reportType === 'income' && <div className="w-3 h-3 rounded-full bg-[#00C795]" />}
              </div>
              <span>Ingresos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-[#1E293B]">
              <input
                type="radio"
                name="reportType"
                checked={reportType === 'expense'}
                onChange={() => setReportType('expense')}
                className="hidden"
              />
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                reportType === 'expense' ? 'border-[#00c795] bg-[#E6F7F0]' : 'border-slate-300'
              }`}>
                {reportType === 'expense' && <div className="w-3 h-3 rounded-full bg-[#00C795]" />}
              </div>
              <span>Gastos</span>
            </label>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full py-4 rounded-full bg-[#E6F7F0] text-[#103E2E] font-extrabold text-base hover:opacity-90 active:scale-98 transition-all pt-4"
        >
          Buscar
        </button>

      </div>

      {/* Real Search Results */}
      {searched && (
        <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-3 animate-slide-up">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider px-1">Resultados de búsqueda</h3>
          
          {results.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No se encontraron transacciones con los filtros indicados.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="w-full text-left flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm transition-all focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isIncome ? 'bg-[#E6F7F0]' : 'bg-[#E0EFFF]'
                    }`}>
                      {getCategoryIcon(tx.categoryIcon, tx.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-[#1E293B] truncate">{tx.categoryName || 'Sin categoría'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{tx.date}</p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${
                        isIncome ? 'text-[#00C795]' : 'text-[#007AFF]'
                      }`}>
                        {isIncome ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal Overlay */}
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

    </div>
  );
}
