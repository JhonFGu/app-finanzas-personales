/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { formatCents, parseToCents } from '../lib/format';
import { 
  ArrowLeft, Plus, Trash2, Edit2, CheckCircle, 
  Calendar, ChevronDown, HelpCircle,
  Utensils, Car, Pill, ShoppingBag, Key, Gift, Coins, Ticket, Home, Briefcase, Laptop, TrendingUp
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
  const IconComp = iconMap[iconStr ?? ''] || HelpCircle;
  return <IconComp className="w-5 h-5 text-[#007AFF]" />;
};

export default function SubscriptionsView() {
  const { 
    subscriptions, 
    categories, 
    fetchSubscriptions, 
    fetchCategories, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription, 
    confirmSubscriptionPayment,
    setSubView 
  } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'recurring' | 'one-time'>('recurring');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fmt = (v: number) => formatCents(v);

  useEffect(() => {
    fetchSubscriptions();
    fetchCategories();
  }, [fetchSubscriptions, fetchCategories]);

  const handleEditClick = (sub: any) => {
    setEditingId(sub.id);
    setName(sub.name);
    setAmount((sub.amount / 100).toString());
    setCategoryId(sub.categoryId.toString());
    setType(sub.type);
    setDueDate(sub.dueDate);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setCategoryId('');
    setType('recurring');
    setDueDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !categoryId || !dueDate) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }

    const amountCents = parseToCents(amount);
    if (amountCents <= 0) {
      setErrorMsg('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const data = {
        name,
        amount: amountCents,
        categoryId: Number(categoryId),
        type,
        dueDate,
      };

      if (editingId) {
        await updateSubscription(editingId, data);
      } else {
        await addSubscription(data);
      }

      handleCancelForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta suscripción?')) {
      try {
        await deleteSubscription(id);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleConfirmPayment = async (id: number) => {
    try {
      await confirmSubscriptionPayment(id);
      alert('¡Pago registrado con éxito y agregado a tus Transacciones!');
    } catch (err: any) {
      alert(err.message || 'Error al confirmar pago');
    }
  };

  const handleCancelSub = async (id: number) => {
    if (confirm('¿Deseas marcar esta suscripción como Cancelada?')) {
      try {
        await updateSubscription(id, { action: 'cancel' });
      } catch (err: any) {
        alert(err.message || 'Error al cancelar');
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* Header */}
      <div className="bg-[#00C795] text-white pt-10 pb-16 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSubView(null)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Suscripciones y Deudas</h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add/Edit Form Overlay/Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#1E293B] pb-2 border-b border-slate-100">
              {editingId ? 'Editar Suscripción' : 'Nueva Suscripción/Deuda'}
            </h3>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre / Servicio</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Netflix, Pago Internet, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Monto de Pago</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] appearance-none font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                    required
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#00C795] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Cobro</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType('recurring')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      type === 'recurring'
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-[#E0EFFF] text-[#007AFF]'
                    }`}
                  >
                    Recurrente Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('one-time')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      type === 'one-time'
                        ? 'bg-[#00C795] text-white'
                        : 'bg-[#E6F7F0] text-[#00C795]'
                    }`}
                  >
                    Deuda Única
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha de Vencimiento / Corte</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 cursor-pointer"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-3 rounded-full bg-[#E6F7F0] text-[#103E2E] font-extrabold text-sm hover:opacity-90 transition-all"
                >
                  {loading ? 'Guardando...' : editingId ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-[#E6F7F0]">
            No tienes pagos recurrentes o deudas registradas
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const isPaid = sub.status === 'paid';
              const isCancelled = sub.status === 'cancelled';
              const isRecurring = sub.type === 'recurring';

              return (
                <div 
                  key={sub.id}
                  className={`bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all ${
                    isPaid ? 'opacity-70' : isCancelled ? 'opacity-50' : ''
                  }`}
                >
                  {/* Status Banner indicator */}
                  <div className={`absolute top-0 right-0 left-0 h-1.5 ${
                    isPaid ? 'bg-emerald-500' : isCancelled ? 'bg-slate-400' : 'bg-red-500'
                  }`} />

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0EFFF] flex items-center justify-center">
                        {getCategoryIcon(sub.categoryIcon)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1E293B]">{sub.name}</h4>
                        <div className="flex gap-2 items-center mt-0.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isRecurring ? 'bg-[#E0EFFF] text-[#007AFF]' : 'bg-[#E6F7F0] text-[#00C795]'
                          }`}>
                            {isRecurring ? 'Suscripción' : 'Deuda Única'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {sub.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-[#1E293B]">{fmt(sub.amount)}</p>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : isCancelled ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'
                      }`}>
                        {isPaid ? 'Pagado' : isCancelled ? 'Cancelado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (only if not already completed/cancelled) */}
                  {!isPaid && !isCancelled && (
                    <div className="flex gap-3 pt-3 border-t border-slate-100 justify-between items-center">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(sub)}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelSub(sub.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-xs font-bold"
                        >
                          Cancelar Suscripción
                        </button>
                        <button
                          onClick={() => handleConfirmPayment(sub.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E6F7F0] text-[#103E2E] hover:opacity-90 transition-colors text-xs font-black flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirmar Pago</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Info messages for completed states */}
                  {(isPaid || isCancelled) && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100 justify-between items-center text-xs font-bold text-slate-400">
                      <span>Este registro se encuentra {isPaid ? 'Pagado' : 'Cancelado'}</span>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 flex gap-1 items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
