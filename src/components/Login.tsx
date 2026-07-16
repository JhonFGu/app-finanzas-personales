import { useState } from 'react';
import { useStore } from '../store';
import { PiggyBank } from 'lucide-react';

export default function Login() {
  const { loginUser, setSubView } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor introduce tu correo');
      return;
    }
    const success = await loginUser(email);
    if (!success) {
      setErrorMsg('Usuario no encontrado');
    }
  };

  return (
    <div className="min-h-dvh bg-[#F0FAF4] flex flex-col justify-between px-6 py-12 text-[#1E293B] font-sans animate-fade-in">
      {/* Top spacer or back button */}
      <div>
        {showForm && (
          <button
            onClick={() => {
              setShowForm(false);
              setErrorMsg('');
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 text-[#00C795]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
        {!showForm ? (
          /* Welcome Screen (Matching Loggin.png exactly) */
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-[32px] bg-white border border-[#E6F7F0] flex items-center justify-center text-[#00C795] shadow-lg shadow-[#00C795]/10 mb-4 animate-bounce-slow">
                <PiggyBank className="w-12 h-12 stroke-[1.8]" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#00C795] mt-1 font-sans">
                Registro de Gastos
              </h1>
              <p className="text-sm text-slate-500 max-w-[260px] mx-auto mt-3 leading-relaxed">
                Controla tus finanzas personales de forma simple e inteligente.
              </p>
            </div>

            {/* Welcome Buttons */}
            <div className="flex flex-col space-y-4 pt-6">
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 rounded-full bg-[#E6F7F0] text-[#103E2E] font-semibold text-base shadow-sm hover:opacity-90 active:scale-98 transition-all"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setSubView('register')}
                className="w-full py-4 rounded-full bg-[#00C795] text-white font-semibold text-base shadow-sm hover:opacity-90 active:scale-98 transition-all"
              >
                Registrarse
              </button>
            </div>
            
            <button className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold pt-2">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#00C795]">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-500 mt-2">Introduce tus credenciales para acceder a tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@ejemplo.com"
                  className="w-full px-5 py-4 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#00C795] text-white font-semibold text-base shadow-md hover:opacity-90 active:scale-98 transition-all pt-4"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={() => setSubView('register')}
                className="text-[#00C795] font-bold hover:underline"
              >
                Regístrate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Decorator */}
      <div className="text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
        <a 
          href="https://guacheta.digital" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#00C795] transition-colors"
        >
          GUACHETA 2026
        </a>
      </div>
    </div>
  );
}
