/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useStore } from '../store';
import { formatCents } from '../lib/format';
import { 
  ArrowLeft, CheckCircle2, Car, ShoppingBag, Key, Gift, Coins, 
  Ticket, Plus, Pill, Utensils, Home, Briefcase, Laptop, 
  TrendingUp, HelpCircle, Edit2, Trash2, Check
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

const getCategoryIcon = (iconStr: string | null) => {
  return iconMap[iconStr ?? ''] || HelpCircle;
};

const curatedColors = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#6B7280', // Slate
];

const availableIcons = [
  'utensils', 'car', 'pill', 'shopping-bag', 'key', 'gift',
  'coins', 'ticket', 'home', 'briefcase', 'laptop', 'trending-up'
];

export default function CategoriesView() {
  const { categories, stats, setActiveTab, setSubView, setPrefilledCategoryId, fetchCategories, fetchStats } = useStore();
  const [isManaging, setIsManaging] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('shopping-bag');
  const [color, setColor] = useState('#3B82F6');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fmt = (v: number) => formatCents(v);

  const balanceVal = stats?.balance ?? 0;
  const expenseVal = stats?.expense ?? 0;

  const handleSelectCategory = (catId: number) => {
    setPrefilledCategoryId(catId);
    setSubView('add-expense');
  };

  const handleEditClick = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || 'shopping-bag');
    setColor(cat.color || '#3B82F6');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setIcon('shopping-bag');
    setColor('#3B82F6');
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, icon, color }),
      });

      if (!res.ok) throw new Error('Error al guardar categoría');
      
      await fetchCategories();
      await fetchStats();
      handleCancelEdit();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Las transacciones asociadas podrían verse afectadas.')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar la categoría');
      await fetchCategories();
      await fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* Header with Balance summary overlapping card */}
      <div className="bg-[#00C795] rounded-b-[40px] px-6 pt-10 pb-20 text-white relative -mx-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => isManaging ? setIsManaging(false) : setActiveTab('home')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">
            {isManaging ? 'Gestionar Categorías' : 'Categorías'}
          </h1>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Overlapping Balance details */}
        {!isManaging && (
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
                <span>{fmt(2000000)}</span>
              </div>
            </div>

            {/* Check message */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-[#00C795]" />
              <span>30% de tus gastos, todo se ve bien.</span>
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      {!isManaging && <div className="h-8" />}

      {/* Conditional View: 1. Main category grid, 2. Manage list */}
      {!isManaging ? (
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 pt-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const catColor = cat.color || '#3B82F6';

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div 
                  className="w-20 h-20 rounded-[24px] flex items-center justify-center transition-all duration-200 shadow-sm text-white scale-100 hover:scale-105"
                  style={{ backgroundColor: catColor }}
                >
                  <Icon className="w-8 h-8 stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-[#1E293B] mt-2.5 uppercase tracking-wide text-center truncate w-full px-1">
                  {cat.name}
                </span>
              </button>
            );
          })}

          {/* Static 'MÁS' category button to toggle management */}
          <button
            onClick={() => setIsManaging(true)}
            className="flex flex-col items-center group cursor-pointer focus:outline-none"
          >
            <div className="w-20 h-20 rounded-[24px] flex items-center justify-center transition-all duration-200 shadow-sm bg-[#E6F7F0] text-[#00C795] hover:bg-[#d0f2e5] hover:scale-105">
              <Plus className="w-8 h-8 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-[#1E293B] mt-2.5 uppercase tracking-wide text-center">
              MÁS
            </span>
          </button>
        </div>
      ) : (
        /* Management UI (Add/Edit category form & List) */
        <div className="space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
              {editingId ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
            </h3>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Tipo</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    type === 'expense'
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#E0EFFF] text-[#007AFF]'
                  }`}
                >
                  GASTO
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    type === 'income'
                      ? 'bg-[#00C795] text-white'
                      : 'bg-[#E6F7F0] text-[#00C795]'
                  }`}
                >
                  INGRESO
                </button>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Icono</label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((ico) => {
                  const IconComp = iconMap[ico];
                  const isSelected = icon === ico;
                  return (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setIcon(ico)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-[#00C795] bg-[#E6F7F0] text-[#00C795] scale-105' 
                          : 'border-slate-100 hover:bg-slate-50 text-slate-400'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Color</label>
              <div className="flex flex-wrap gap-2.5 justify-between px-1">
                {curatedColors.map((col) => {
                  const isSelected = color === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all relative hover:scale-105 active:scale-95 shadow-sm"
                      style={{ backgroundColor: col }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-sm"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-full bg-[#E6F7F0] text-[#103E2E] font-bold text-sm hover:opacity-90 transition-all"
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>

          {/* List of categories */}
          <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Categorías Existentes
            </h3>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const IconComp = getCategoryIcon(cat.icon);
                const isExpense = cat.type === 'expense';
                return (
                  <div key={cat.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#1E293B]">{cat.name}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          isExpense ? 'bg-[#E0EFFF] text-[#007AFF]' : 'bg-[#E6F7F0] text-[#00C795]'
                        }`}>
                          {isExpense ? 'Gasto' : 'Ingreso'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
