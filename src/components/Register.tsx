import { useState } from 'react';
import { useStore } from '../store';

export default function Register() {
  const { registerUser, setSubView } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [phoneRest, setPhoneRest] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/[^\d]/g, '');
    let formatted = '';
    if (clean.length > 0) {
      formatted += clean.substring(0, 2);
    }
    if (clean.length > 2) {
      formatted += ' / ' + clean.substring(2, 4);
    }
    if (clean.length > 4) {
      formatted += ' / ' + clean.substring(4, 8);
    }
    setDob(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Por favor completa los campos requeridos');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    await registerUser(name, email, `${countryCode} ${phoneRest}`, dob);
  };

  return (
    <div className="min-h-dvh bg-[#00C795] flex flex-col justify-between text-[#1E293B] font-sans animate-fade-in">
      {/* Header (Solid Green Top Layout matching Crear_Cuenta.png) */}
      <div className="px-6 pt-12 pb-6 text-white flex items-center justify-between">
        <button
          onClick={() => setSubView('login')}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-center flex-1 pr-8">Crear Cuenta</h1>
      </div>

      {/* Rounded bottom sheet (White card with rounded top corners) */}
      <div className="flex-1 bg-[#F0FAF4] rounded-t-[40px] px-6 pt-8 pb-10 flex flex-col justify-between shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@ejemplo.com"
              className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Número de Teléfono</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+57"
                className="w-20 px-3 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium text-center"
              />
              <input
                type="text"
                value={phoneRest}
                onChange={(e) => setPhoneRest(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="300 123 4567"
                className="flex-1 px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Fecha de Nacimiento</label>
            <input
              type="text"
              value={dob}
              onChange={handleDobChange}
              placeholder="DD / MM / AAAA"
              className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-2xl bg-[#E6F7F0] border-none text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C795]/50 transition-all text-sm font-medium pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-tight pt-2">
            Al continuar, aceptas nuestros <span className="font-bold text-[#00C795]">Términos de Uso</span> y nuestra <span className="font-bold text-[#00C795]">Política de Privacidad</span>.
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#E6F7F0] text-[#103E2E] font-bold text-base shadow-sm hover:opacity-90 active:scale-98 transition-all"
            >
              Registrarse
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => setSubView('login')}
              className="text-[#00C795] font-bold hover:underline"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
