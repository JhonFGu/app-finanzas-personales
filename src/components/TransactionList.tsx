import { formatCents } from '../lib/format';
import type { Transaction } from '../store';

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No hay transacciones aún
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3"
        >
          <span className="text-xl">{getIcon(tx.categoryIcon)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{tx.categoryName || 'Sin categoría'}</p>
            {tx.note && (
              <p className="text-xs text-slate-500 truncate">{tx.note}</p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${
              tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {tx.type === 'income' ? '+' : '-'}{formatCents(tx.amount)}
            </p>
            <p className="text-xs text-slate-500">{tx.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getIcon(icon: string | null): string {
  const map: Record<string, string> = {
    utensils: '🍔', car: '🚗', home: '🏠', 'gamepad-2': '🎮',
    'heart-pulse': '💊', 'book-open': '📚', zap: '💡',
    'more-horizontal': '📦', briefcase: '💼', laptop: '💻',
    'trending-up': '📈', plus: '💰',
  };
  return map[icon ?? ''] || '📌';
}
