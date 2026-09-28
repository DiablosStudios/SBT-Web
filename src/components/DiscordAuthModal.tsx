import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DiscordIcon } from './DiscordIcon';
import {
  X,
  Check,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ownerAvatarImg } from '../data/initialData';

export const DiscordAuthModal: React.FC = () => {
  const {
    isDiscordAuthOpen,
    setIsDiscordAuthOpen,
    discordProfile,
    loginWithDiscord,
    unlinkDiscord,
    theme,
    setIsAdminOpen,
    loginFlowState,
    setLoginFlowState,
    deniedUsername
  } = useStore();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isDiscordAuthOpen) return null;

  const isLight = theme === 'light';
  const isDenied = loginFlowState === 'denied' || (discordProfile && !discordProfile.isAuthorizedAdmin);

  const handleStartDiscordOAuth = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await loginWithDiscord();
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Error al iniciar la autorización de Discord.');
    }
  };

  const handleResetToLogin = async () => {
    await unlinkDiscord();
    setLoginFlowState('login');
    setAuthError(null);
  };

  const handleOpenAdmin = () => {
    setIsDiscordAuthOpen(false);
    setIsAdminOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => setIsDiscordAuthOpen(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all my-6 ${
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
                {isDenied
                  ? 'Acceso Denegado'
                  : discordProfile?.isAuthorizedAdmin
                  ? 'Sesión de Administrador Activa'
                  : 'Iniciar sesión con Discord'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {discordProfile?.isAuthorizedAdmin
                  ? 'ID verificada con privilegios de administrador'
                  : 'Acceso seguro mediante Discord'}
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#5865F2] animate-spin" />
            <p className="text-xs text-neutral-400 font-medium">
              Conectando con Discord...
            </p>
          </div>
        )}

        {/* Access Denied */}
        {!isLoading && isDenied && (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/25 text-left space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Acceso Restringido</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                La cuenta de Discord <strong className="text-rose-400 font-mono">@{deniedUsername || discordProfile?.username || 'desconocido'}</strong> no tiene asignado el rol de Administrador.
              </p>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Solo los usuarios con permisos autorizados pueden acceder al panel administrativo.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResetToLogin}
                className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Iniciar sesión con otra cuenta</span>
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
                <span>Continuar explorando</span>
              </button>
            </div>
          </div>
        )}

        {/* Authorized Session */}
        {!isLoading && !isDenied && discordProfile?.isAuthorizedAdmin && (
          <div className="py-5 space-y-4">
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}>
              <div className="relative shrink-0">
                <img
                  src={discordProfile.avatar || ownerAvatarImg}
                  alt={discordProfile.username}
                  className="w-12 h-12 rounded-xl object-contain bg-black/40 border border-emerald-500/50 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                  <span>{discordProfile.globalName || discordProfile.username}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ADMIN
                  </span>
                </div>
                <div className={`text-xs mt-0.5 truncate font-mono ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Discord ID: {discordProfile.id}
                </div>
                <div className="text-[11px] text-emerald-500 mt-1 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>El botón «Admin» está activo en la navegación</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenAdmin}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Abrir Panel de Administración (/admin)</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
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
                <span>Cerrar Sesión de Discord</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Button */}
        {!isLoading && !isDenied && !discordProfile && (
          <div className="py-5 space-y-4">
            <button
              type="button"
              onClick={handleStartDiscordOAuth}
              className="w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              <DiscordIcon className="w-5 h-5 fill-white shrink-0" />
              <span>Iniciar sesión con Discord</span>
            </button>

            {authError && (
              <div className="p-3 rounded-lg border bg-rose-500/10 border-rose-500/25 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{authError}</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
