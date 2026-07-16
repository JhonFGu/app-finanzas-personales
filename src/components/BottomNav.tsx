import { Home, BarChart3, ArrowLeftRight, Layers, User } from 'lucide-react';
import { useStore } from '../store';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'analysis', icon: BarChart3, label: 'Análisis' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Historial' },
    { id: 'categories', icon: Layers, label: 'Categorías' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F0FAF4] px-4 py-3 border-t border-[#E6F7F0]/80 rounded-t-[30px] shadow-[0_-10px_30px_rgba(0,199,149,0.06)] max-w-lg mx-auto">
      <div className="flex items-center justify-between px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300"
            >
              {isSelected ? (
                /* Selected Indicator (Mint Green Circle) */
                <div className="w-12 h-12 rounded-full bg-[#00C795] flex items-center justify-center text-white shadow-lg shadow-[#00C795]/30 animate-fade-in transition-all">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
              ) : (
                /* Unselected Icon */
                <div className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
