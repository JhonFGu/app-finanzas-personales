/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { parseToCents } from '../lib/format';
import { ArrowLeft, Bell, ChevronDown, Camera, X } from 'lucide-react';

export default function AddExpense() {
  const { 
    categories, 
    addTransaction, 
    updateTransaction,
    setSubView, 
    prefilledCategoryId, 
    setPrefilledCategoryId,
    editingTransaction,
    setEditingTransaction
  } = useStore();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('10000');
  const [title, setTitle] = useState('Combustible');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Prefilled Category or Edit Mode
  useEffect(() => {
    if (editingTransaction) {
      // Edit Mode
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId.toString());
      setAmount((editingTransaction.amount / 100).toString());
      setNote(editingTransaction.note || '');
      setTitle(editingTransaction.note || '');
      setImageUrl(editingTransaction.imageUrl || null);
    } else if (prefilledCategoryId) {
      // Prefilled Category Mode
      const cat = categories.find(c => c.id === prefilledCategoryId);
      if (cat) {
        setType(cat.type);
        setCategoryId(cat.id.toString());
        setTitle(cat.type === 'expense' ? 'Combustible' : 'Salario');
      }
      setPrefilledCategoryId(null); // Clear once consumed
    }
  }, [editingTransaction, prefilledCategoryId, categories, setPrefilledCategoryId]);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategoryId(''); // Reset category on type change
    setTitle(newType === 'expense' ? 'Combustible' : 'Salario');
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (base64 of huge images could fail Neon query size limit of 10MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('La imagen es demasiado grande. Elige una menor a 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!categoryId) {
      setErrorMsg('Por favor selecciona una categoría');
      return;
    }
    const amountCents = parseToCents(amount);
    if (amountCents <= 0) {
      setErrorMsg('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.id === Number(categoryId));
      const txData = {
        amount: amountCents,
        type,
        categoryId: Number(categoryId),
        note: note || title || selectedCategory?.name || '',
        date,
        imageUrl,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, txData);
        setEditingTransaction(null);
      } else {
        await addTransaction(txData);
      }

      // Return to previous view
      setSubView(null);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingTransaction(null);
    setSubView(null);
  };

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* Header */}
      <div className="bg-[#00C795] text-white pt-10 pb-16 px-6 -mx-4 rounded-b-[40px] relative">
        <div className="flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">
            {editingTransaction 
              ? (type === 'expense' ? 'Editar Gasto' : 'Editar Ingreso')
              : (type === 'expense' ? 'Añadir Gasto' : 'Añadir Ingreso')
            }
          </h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form Rounded Card */}
      <div className="bg-white border border-[#E6F7F0] rounded-3xl p-5 shadow-sm space-y-5">
        
        {/* Toggle Switch between Gasto and Ingreso */}
        <div className="flex p-1 bg-[#E6F7F0] rounded-2xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            disabled={!!editingTransaction} // Disable editing type after creation for safety
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-[#007AFF] hover:bg-[#007AFF]/5 disabled:opacity-50'
            }`}
          >
            GASTO
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            disabled={!!editingTransaction}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-[#00C795] text-white shadow-sm'
                : 'text-[#00C795] hover:bg-[#00C795]/5 disabled:opacity-50'
            }`}
          >
            INGRESO
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all cursor-pointer"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Categoría</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] appearance-none font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all cursor-pointer"
                required
              >
                <option value="">Selecciona la categoría</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-[#00C795] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Monto</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="$0"
              className="w-full px-5 py-3.5 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all"
              required
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">
              {type === 'expense' ? 'Título del Gasto' : 'Título del Ingreso'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'Combustible, Comida, Alquiler...' : 'Salario, Freelance, Reembolso...'}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all"
              required
            />
          </div>

          {/* Enter Message Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Mensaje o Nota</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe una nota opcional..."
              rows={3}
              className="w-full px-5 py-3.5 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Attached Image Field (Point 5) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 ml-1">Adjuntar Imagen</label>
            
            {!imageUrl ? (
              <label className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-[#00C795]/30 bg-[#E6F7F0]/30 text-[#00C795] font-bold text-sm hover:bg-[#E6F7F0]/50 transition-all cursor-pointer">
                <Camera className="w-5 h-5" />
                <span>Subir Foto o Comprobante</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-48">
                <img
                  src={imageUrl}
                  alt="Comprobante adjunto"
                  className="w-full h-full object-cover max-h-48"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/85 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-4 rounded-full bg-slate-100 text-slate-600 font-extrabold text-base transition-all hover:bg-slate-200"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-grow py-4 rounded-full font-extrabold text-base transition-all disabled:opacity-50 ${
                type === 'expense'
                  ? 'bg-[#E0EFFF] text-[#007AFF] hover:bg-[#cbe3ff]'
                  : 'bg-[#E6F7F0] text-[#103E2E] hover:opacity-90'
              }`}
            >
              {loading ? 'Guardando...' : editingTransaction ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
