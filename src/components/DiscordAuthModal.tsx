import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DiscordIcon } from './DiscordIcon';
import { X, Check, ShieldCheck, ShieldAlert, LogOut, ArrowRight, ArrowLeft, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { bmExactLogo } from '../data/initialData';

export const DiscordAuthModal: React.FC = () => {
  const {
    isDiscordAuthOpen,
    setIsDiscordAuthOpen,
    discordProfile,
    linkDiscord,
    unlinkDiscord,
    theme,
    staffSeats,
    setIsAdminOpen,
    loginFlowState,
    setLoginFlowState,
    deniedUsername,
    setDeniedUsername
  } = useStore();

  const [inputUsername, setInputUsername] = useState('');
  const [isSimulatingOAuth, setIsSimulatingOAuth] = useState(false);

  if (!isDiscordAuthOpen) return null;

  const isLight = theme === 'light';

  // If a profile exists and is unauthorized, or state is explicitly 'denied'
  const isDenied = loginFlowState === 'denied' || (discordProfile && !discordProfile.isAuthorizedAdmin);

  const handleLink = (username: string, customAvatar?: string) => {
    setIsSimulatingOAuth(true);
    setTimeout(() => {
      setIsSimulatingOAuth(false);
      const profile = linkDiscord(username, customAvatar);
      if (profile.isAuthorizedAdmin) {
        setLoginFlowState('authorized');
      } else {
        setLoginFlowState('denied');
        setDeniedUsername(username);
      }
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;
    handleLink(inputUsername.trim());
  };

  const handleResetToLogin = () => {
    unlinkDiscord();
    setLoginFlowState('login');
    setInputUsername('');
  };

  const handleOpenAdmin = () => {
    setIsDiscordAuthOpen(false);
    setIsAdminOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsDiscordAuthOpen(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-[#0f1015] border-neutral-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
              isDenied ? 'bg-rose-600' : 'bg-[#5865F2]'
            }`}>
              {isDenied ? (
                <ShieldAlert className="w-5 h-5 text-white" />
              ) : (
                <DiscordIcon className="w-5 h-5 fill-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                {isDenied ? 'Acceso Denegado' : 'Login con Discord'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {isDenied
                  ? 'Verificación de privilegios de administrador'
                  : 'Discord OAuth2 · Autorización de Administrador'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDiscordAuthOpen(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-neutral-400 hover:text-black hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Diagram Breadcrumb */}
        <div className={`mt-3 py-2 px-3 rounded-lg text-[10px] font-mono border flex items-center justify-between flex-wrap gap-1 ${
          isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-neutral-950/70 border-neutral-850 text-neutral-400'
        }`}>
          <span className="opacity-70">Página</span>
          <span>→</span>
          <span className="opacity-70">Administrador</span>
          <span>→</span>
          <span className="text-[#5865F2] font-semibold">Discord OAuth2</span>
          <span>→</span>
          {isDenied ? (
            <span className="text-rose-500 font-bold bg-rose-500/10 px-1 rounded border border-rose-500/20">
              NO: Denegado
            </span>
          ) : discordProfile?.isAuthorizedAdmin ? (
            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
              SÍ: /admin
            </span>
          ) : (
            <span className="text-amber-500 font-medium">¿Autorizado?</span>
          )}
        </div>

        {/* Loading simulation */}
        {isSimulatingOAuth && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#5865F2] animate-spin" />
            <p className="text-xs text-neutral-400 font-medium">
              Consultando Discord OAuth2 y verificando permisos en código...
            </p>
          </div>
        )}

        {/* STATE 1: DENIED (El usuario NO está autorizado) */}
        {!isSimulatingOAuth && isDenied && (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/25 text-left space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Error 403 · Acceso No Autorizado</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                El usuario de Discord <strong className="text-rose-400 font-mono">@{deniedUsername || discordProfile?.username || 'desconocido'}</strong> no tiene permisos de administrador.
              </p>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                El panel <span className="font-mono font-semibold">/admin</span> (Administrar muebles, Cambiar precio y Subir archivos) está reservado únicamente para las cuentas de Discord y direcciones IP autorizadas en el código de SBT Studios.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResetToLogin}
                className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Intentar con otra cuenta de Discord</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDiscordAuthOpen(false)}
                className={`w-full py-2 px-4 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isLight
                    ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                    : 'border-neutral-800 hover:bg-neutral-850 text-neutral-300'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la tienda (Visitante)</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: ALREADY AUTHORIZED (Usuario SÍ autorizado) */}
        {!isSimulatingOAuth && !isDenied && discordProfile?.isAuthorizedAdmin && (
          <div className="py-5 space-y-4">
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}>
              <div className="relative">
                <img
                  src={discordProfile.avatar}
                  alt={discordProfile.username}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500/50 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                  <span>{discordProfile.username}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ADMIN
                  </span>
                </div>
                <div className={`text-xs mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  ✓ Permisos concedidos para /admin
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenAdmin}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span>Acceder a /admin (Administrar muebles & archivos)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetToLogin}
                className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  isLight
                    ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                    : 'border-neutral-800 hover:bg-neutral-850 text-neutral-300'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desvincular / Cambiar de cuenta</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: LOGIN FORM / OAUTH2 SCREEN (Cuando no está logueado o quiere cambiar) */}
        {!isSimulatingOAuth && !isDenied && !discordProfile && (
          <div className="py-5 space-y-4">
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
            }`}>
              Inicia sesión con Discord OAuth2 para verificar si tu usuario está en la lista de administradores autorizados.
            </div>

            {/* Quick 1-Click for authorized staff seats */}
            <div className="space-y-2">
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Cuentas de Administrador Autorizadas en Código:
              </div>

              {/* Benjamin Owner */}
              <button
                type="button"
                onClick={() => handleLink('Benjamin (Owner)', bmExactLogo)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                    : 'bg-neutral-900/60 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={bmExactLogo} alt="BM" className="w-8 h-8 rounded-lg object-contain bg-black/40 border border-neutral-700 p-0.5" />
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <span>Benjamin (Owner)</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      benjamin#0001 · Acceso Maestro Autorizado
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#5865F2]">Conectar</span>
              </button>

              {/* Staff Juan & Mario */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLink('Juan', staffSeats[1]?.avatar)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                    isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                      : 'bg-neutral-900/60 hover:bg-neutral-850 border-neutral-800'
                  }`}
                >
                  <img src={staffSeats[1]?.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Juan (Staff 3D)</div>
                    <div className="text-[10px] text-emerald-500 truncate">Autorizado</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLink('Mario', staffSeats[2]?.avatar)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                    isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                      : 'bg-neutral-900/60 hover:bg-neutral-850 border-neutral-800'
                  }`}
                >
                  <img src={staffSeats[2]?.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Mario (Staff QA)</div>
                    <div className="text-[10px] text-emerald-500 truncate">Autorizado</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Discord input (e.g. to test unauthorized 'visitante' or other account) */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <label className={`block text-xs font-medium ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                O inicia sesión con cualquier cuenta de Discord:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Ej: tu_usuario#0000 o visitante"
                  className={`flex-1 rounded-lg px-3 py-2 text-xs transition-colors focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-neutral-600 focus:bg-white'
                      : 'bg-neutral-950 border border-neutral-800 text-white focus:border-neutral-600'
                  }`}
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <DiscordIcon className="w-3.5 h-3.5 fill-white" />
                  <span>Login</span>
                </button>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                Tip: Cuentas no autorizadas (como "visitante") mostrarán la pantalla de <strong>Denegado</strong> según el diagrama.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
