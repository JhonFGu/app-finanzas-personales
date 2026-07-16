/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { formatCents, parseToCents } from '../lib/format';
import { 
  ArrowLeft, Plus, Trash2, Edit2, Coins, Target,
  ChevronDown, Check, Car, Home, Laptop, Plane, TrendingUp, Shield
} from 'lucide-react';

const iconMap: Record<string, any> = {
  target: Target,
  car: Car,
  home: Home,
  laptop: Laptop,
  plane: Plane,
  'trending-up': TrendingUp,
  shield: Shield,
  coins: Coins,
};

const defaultLocations = [
  { id: 'bank_account', name: 'Cuenta Bancaria' },
  { id: 'pocket', name: 'Bolsillo de Billetera' },
  { id: 'virtual_card', name: 'Cuenta Virtual / Neobanco' },
  { id: 'cash', name: 'Efectivo' },
  { id: 'other', name: 'Otros' },
];

const getGoalIcon = (iconStr: string | null, color: string | null) => {
  const IconComp = iconMap[iconStr ?? ''] || Target;
  return <IconComp className="w-5 h-5" style={{ color: color || '#00C795' }} />;
};

export default function GoalsView() {
  const { 
    goals, 
    fetchGoals, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    contributeToGoal,
    fetchCategories,
    setSubView 
  } = useStore();

  const [locations, setLocations] = useState<{ id: string; name: string }[]>(() => {
    const saved = localStorage.getItem('finwise_saving_locations');
    return saved ? JSON.parse(saved) : defaultLocations;
  });

  const locationLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    locations.forEach(loc => {
      map[loc.id] = loc.name;
    });
    return map;
  }, [locations]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states (Create/Edit Goal)
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingLocation, setSavingLocation] = useState('bank_account');
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [selectedColor, setSelectedColor] = useState('#00C795');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states (Contribution)
  const [contribAmount, setContribAmount] = useState('');
  const [contribError, setContribError] = useState('');

  const fmt = (v: number) => formatCents(v);

  useEffect(() => {
    fetchGoals();
    fetchCategories(); // Make sure categories are fetched for contribution transactions
  }, [fetchGoals, fetchCategories]);

  const handleEditClick = (goal: any) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount((goal.targetAmount / 100).toString());
    setCurrentAmount((goal.currentAmount / 100).toString());
    setDueDate(goal.dueDate);
    setSavingLocation(goal.savingLocation);
    setShowCustomLocationInput(false);
    setCustomLocationName('');
    setSelectedIcon(goal.icon || 'target');
    setSelectedColor(goal.color || '#00C795');
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDueDate(new Date().toISOString().split('T')[0]);
    setSavingLocation('bank_account');
    setShowCustomLocationInput(false);
    setCustomLocationName('');
    setSelectedIcon('target');
    setSelectedColor('#00C795');
    setShowAddForm(false);
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || !dueDate || !savingLocation) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }

    const targetCents = parseToCents(targetAmount);
    const currentCents = parseToCents(currentAmount || '0');

    if (targetCents <= 0) {
      setErrorMsg('Por favor ingresa una cantidad meta válida');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      let finalLocation = savingLocation;
      if (savingLocation === 'NEW_LOCATION') {
        if (!customLocationName.trim()) {
          setErrorMsg('Por favor ingresa el nombre de la nueva ubicación');
          setLoading(false);
          return;
        }
        const newId = 'custom_' + Date.now();
        const newLoc = { id: newId, name: customLocationName.trim() };
        const updated = [...locations, newLoc];
        setLocations(updated);
        localStorage.setItem('finwise_saving_locations', JSON.stringify(updated));
        finalLocation = newId;
      }

      const data = {
        name,
        targetAmount: targetCents,
        currentAmount: currentCents,
        dueDate,
        savingLocation: finalLocation,
        icon: selectedIcon,
        color: selectedColor,
      };

      if (editingId) {
        await updateGoal(editingId, data);
      } else {
        await addGoal(data);
      }

      handleCancelForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la meta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta meta de ahorro?')) {
      try {
        await deleteGoal(id);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar la meta');
      }
    }
  };

  const handleOpenContribute = (goalId: number) => {
    setSelectedGoalId(goalId);
    setContribAmount('');
    setContribError('');
    setShowContributeForm(true);
  };

  const handleSaveContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribAmount || !selectedGoalId) {
      setContribError('Por favor ingresa un monto');
      return;
    }

    const contribCents = parseToCents(contribAmount);
    if (contribCents <= 0) {
      setContribError('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setContribError('');
    try {
      await contributeToGoal(selectedGoalId, contribCents);
      setShowContributeForm(false);
      setSelectedGoalId(null);
    } catch (err: any) {
      setContribError(err.message || 'Error al abonar aporte');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Total Saved
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* Header Banner */}
      <div className="bg-[#00C795] text-white pt-10 pb-16 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSubView(null)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Metas de Ahorro</h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute left-6 right-6 -bottom-8 bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,199,149,0.12)] text-[#1E293B] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reservado</p>
            <p className="text-2xl font-black text-[#00C795] mt-1">{fmt(totalSaved)}</p>
          </div>
          <Coins className="w-9 h-9 text-[#00C795]/20" />
        </div>
      </div>

      <div className="h-6" /> {/* Spacer for floating banner */}

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <h3 className="text-base font-extrabold text-[#1E293B] pb-2 border-b border-slate-100">
              {editingId ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}
            </h3>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre de la Meta</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Comprar Laptop, Fondo de Emergencia, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Monto Objetivo</label>
                  <input
                    type="number"
                    step="any"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="$0.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Monto Ahorrado</label>
                  <input
                    type="number"
                    step="any"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="$0.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ubicación del Ahorro</label>
                <div className="relative">
                  <select
                    value={savingLocation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSavingLocation(val);
                      if (val === 'NEW_LOCATION') {
                        setShowCustomLocationInput(true);
                      } else {
                        setShowCustomLocationInput(false);
                        setCustomLocationName('');
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] appearance-none font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 cursor-pointer"
                    required
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                    <option value="NEW_LOCATION">+ Agregar nueva ubicación...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#00C795] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {showCustomLocationInput && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre de la Nueva Ubicación</label>
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder="Ej. Alcancía, Caja Fuerte, etc."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 cursor-pointer"
                  required
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Selecciona un Icono</label>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {Object.keys(iconMap).map((key) => {
                    const IconComp = iconMap[key];
                    const isSelected = selectedIcon === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedIcon(key)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isSelected ? 'bg-[#00C795] border-[#00C795] text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Selecciona un Color</label>
                <div className="flex gap-3 justify-between">
                  {['#00C795', '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#8E44AD'].map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className="w-8 h-8 rounded-full border transition-all relative flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color, borderColor: isSelected ? '#1E293B' : 'transparent' }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
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

      {/* Contribute Form Modal */}
      {showContributeForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#1E293B] pb-2 border-b border-slate-100">
              Abonar Aporte de Ahorro
            </h3>

            {contribError && (
              <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
                {contribError}
              </div>
            )}

            <form onSubmit={handleSaveContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Monto a Aportar</label>
                <input
                  type="number"
                  step="any"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  * Este abono se registrará como un "Otros Gastos" en tu historial de transacciones para deducir el saldo real.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeForm(false);
                    setSelectedGoalId(null);
                  }}
                  className="flex-1 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-3 rounded-full bg-[#E6F7F0] text-[#103E2E] font-extrabold text-sm hover:opacity-90 transition-all"
                >
                  {loading ? 'Abonando...' : 'Confirmar Aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-[#E6F7F0]">
            No tienes metas de ahorro registradas
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div 
                  key={goal.id}
                  className={`bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all ${
                    isCompleted ? 'bg-[#E6F7F0]/20' : ''
                  }`}
                >
                  {/* Color top accent */}
                  <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: goal.color || '#00C795' }} />

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: (goal.color || '#00C795') + '15' }}>
                        {getGoalIcon(goal.icon, goal.color)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1E293B]">{goal.name}</h4>
                        <div className="flex gap-2 items-center mt-0.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#E6F7F0] text-[#103E2E]">
                            {locationLabelMap[goal.savingLocation] || 'Ahorros'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            Límite: {goal.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-[#1E293B]">
                        {fmt(goal.currentAmount)} <span className="text-slate-300 font-normal">/ {fmt(goal.targetAmount)}</span>
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">{progressPct}% completado</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${progressPct}%`, 
                          backgroundColor: goal.color || '#00C795' 
                        }} 
                      />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-3 pt-3 border-t border-slate-100 justify-between items-center">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(goal)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenContribute(goal.id)}
                      disabled={isCompleted}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#E6F7F0] text-[#103E2E] hover:opacity-90'
                      }`}
                    >
                      {isCompleted ? '¡Meta Cumplida!' : 'Aportar Ahorro'}
                    </button>
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
