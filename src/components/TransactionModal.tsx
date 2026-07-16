/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { parseToCents } from '../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TransactionModal({ open, onClose }: Props) {
  const { categories, addTransaction } = useStore();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCats = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (open) {
      setAmount('');
      setType('expense');
      setCategoryId(null);
      setNote('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setCategoryId(null);
  }, [type]);

  const handleSubmit = async () => {
    if (!amount || !categoryId) return;
    setSaving(true);
    try {
      await addTransaction({
        amount: parseToCents(amount),
        type,
        categoryId,
        note: note || undefined,
      });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && amount && categoryId) {
      handleSubmit();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 pb-8 animate-slide-up max-h-[90dvh] overflow-y-auto"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Nueva Transacción</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 active:bg-slate-600 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <input
          ref={inputRef}
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="$ 0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-4xl font-bold text-center bg-transparent border-b-2 border-slate-600 pb-4 mb-5 outline-none focus:border-emerald-500"
        />

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-colors min-h-[48px] ${
              type === 'expense'
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                : 'bg-slate-700 text-slate-400 border-2 border-transparent'
            }`}
          >
            GASTO
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-colors min-h-[48px] ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                : 'bg-slate-700 text-slate-400 border-2 border-transparent'
            }`}
          >
            INGRESO
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {filteredCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-colors min-h-[56px] touch-manipulation ${
                categoryId === cat.id
                  ? 'bg-slate-600 ring-2 ring-emerald-500'
                  : 'bg-slate-700/50 active:bg-slate-600'
              }`}
            >
              <span className="text-xl leading-none" role="img">{getIcon(cat.icon)}</span>
              <span className="text-[11px] text-slate-300 truncate w-full text-center leading-tight font-medium">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-700 rounded-xl px-4 py-3.5 text-sm mb-5 outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!amount || !categoryId || saving}
          className="w-full py-4 rounded-xl font-bold text-base bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed active:bg-emerald-500 transition-colors min-h-[52px]"
        >
          {saving ? 'Guardando...' : 'Confirmar Transacción'}
        </button>
      </div>
    </div>
  );
}

function getIcon(icon: string | null): string {
  const map: Record<string, string> = {
    utensils: '🍔',
    car: '🚗',
    home: '🏠',
    'gamepad-2': '🎮',
    'heart-pulse': '💊',
    'book-open': '📚',
    zap: '💡',
    'more-horizontal': '📦',
    briefcase: '💼',
    laptop: '💻',
    'trending-up': '📈',
    plus: '💰',
  };
  return map[icon ?? ''] || '📌';
}
