/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from '../store';
import { ArrowLeft, Bell, User, Shield, Settings, HelpCircle, LogOut, CreditCard, Camera } from 'lucide-react';

export default function Profile() {
  const { user, logoutUser, setActiveTab, setSubView, updateUserAvatar } = useStore();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Elige una de menos de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateUserAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const menuItems: Array<{ label: string; icon: any; action?: () => void }> = [
    { label: 'Suscripciones y Deudas', icon: CreditCard, action: () => setSubView('subscriptions') },
    { label: 'Editar Perfil', icon: User },
    { label: 'Seguridad', icon: Shield },
    { label: 'Configuración', icon: Settings },
    { label: 'Ayuda', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-24 font-sans animate-fade-in text-[#1E293B]">
      
      {/* 1. Header Area with curved green background (Perfil.png) */}
      <div className="bg-[#00C795] rounded-b-[40px] px-6 pt-10 pb-20 text-white relative -mx-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar overlapping */}
        <div className="absolute left-1/2 bottom-[-50px] -translate-x-1/2 flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-[#F0FAF4] overflow-hidden shadow-md bg-white">
              <img
                src={user?.avatar || '/avatar.png'}
                alt="Avatar de usuario"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
                }}
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-1 right-1 bg-[#00C795] text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-[#00b083] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Spacer for avatar */}
      <div className="h-10" />

      {/* User Info */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{user?.name || 'John Smith'}</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: 25030024</p>
      </div>

      {/* Menu Options (Perfil.png) */}
      <div className="bg-white border border-[#E6F7F0] rounded-3xl p-4 shadow-sm space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => item.action ? item.action() : alert('Función en desarrollo')}
              className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-[#E6F7F0]/40 transition-colors text-left font-bold text-[#1E293B] text-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E0EFFF] flex items-center justify-center text-[#007AFF]">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-red-50 transition-colors text-left font-bold text-red-500 text-sm border-t border-slate-100 mt-2 pt-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
            <LogOut className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="flex-1">Cerrar sesión</span>
        </button>
      </div>

    </div>
  );
}
