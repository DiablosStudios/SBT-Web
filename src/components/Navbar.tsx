import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronDown, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { Currency } from '../types';
import { DiscordIcon } from './DiscordIcon';
import { DiscordModal } from './DiscordModal';
import { ownerAvatarImg } from '../data/initialData';

export const Navbar: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    setSelectedProduct,
    setCurrentView,
    setIsAdminOpen,
    currentStaff,
    isAuthorizedAdmin,
    discordProfile,
    setIsDiscordAuthOpen,
    openDiscordLoginFlow
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);

  const handleNavToFurniture = () => {
    setSelectedProduct(null);
    setCurrentView('store');
    setActiveCategory('furniture');
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const catalogElem = document.getElementById('catalog-section');
      if (catalogElem) {
        catalogElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToTeam = () => {
    setSelectedProduct(null);
    setCurrentView('store');
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const teamElem = document.getElementById('team-section');
      if (teamElem) {
        teamElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(null);
    setCurrentView('store');
    setActiveCategory('furniture');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currencies: Currency[] = ['USD', 'EUR', 'ARS', 'MXN'];
  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isLight
          ? 'bg-white/95 border-neutral-200 text-neutral-900 shadow-xs'
          : 'bg-[#07080b]/95 border-neutral-800 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            onClick={handleBrandClick}
            className={`flex items-baseline gap-2 transition-colors ${
              isLight ? 'text-black hover:text-neutral-700' : 'text-white hover:text-neutral-300'
            }`}
          >
            <span className="text-xl font-bold tracking-[0.15em]">SBT</span>
            <span className={`text-xs uppercase font-light tracking-[0.25em] ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              STUDIOS
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-wider font-medium">
            <button
              onClick={handleNavToFurniture}
              className={`transition-colors py-1 cursor-pointer ${
                activeCategory === 'furniture'
                  ? (isLight ? 'text-black border-b-2 border-black font-semibold' : 'text-white border-b-2 border-white font-semibold')
                  : (isLight ? 'text-neutral-500 hover:text-black' : 'text-neutral-400 hover:text-white')
              }`}
            >
              Objetos
            </button>

            <button
              onClick={scrollToTeam}
              className={`transition-colors py-1 cursor-pointer ${
                isLight ? 'text-neutral-500 hover:text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Equipo (3)
            </button>
          </nav>
        </div>

        {/* Right Tools (Admin if authorized, Theme Toggle, Currency, Cart, Discord Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* ADMIN BUTTON (Solo visible si la ID de Discord fue verificada como admin) */}
          {isAuthorizedAdmin && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                  : 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border-emerald-800/60'
              }`}
              title="Panel de Administración Privado (/admin)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin</span>
            </button>
          )}

          {/* THEME TOGGLE (Dark / Light Mode) */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              isLight
                ? 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
            title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            aria-label={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-neutral-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Currency */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className={`flex items-center gap-0.5 text-xs px-1.5 py-1 transition-colors cursor-pointer rounded font-medium ${
                isLight ? 'text-neutral-600 hover:text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isCurrencyDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-24 border rounded shadow-2xl py-1 z-50 transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-[#111216] border-neutral-800'
              }`}>
                {currencies.map(curr => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      currency === curr
                        ? (isLight ? 'text-black font-semibold bg-neutral-100' : 'text-white font-semibold bg-neutral-800')
                        : (isLight ? 'text-neutral-600 hover:text-black' : 'text-neutral-400 hover:text-white')
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DISCORD PROFILE LINKED OR LOGIN BUTTON */}
          {discordProfile ? (
            <button
              onClick={() => setIsDiscordAuthOpen(true)}
              className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
              }`}
              title={`Discord: ${discordProfile.username} (${discordProfile.isAuthorizedAdmin ? 'Admin' : 'Usuario'}) - Clic para ver opciones o cerrar sesión`}
            >
              <div className="relative">
                <img
                  src={discordProfile.avatar || ownerAvatarImg}
                  alt={discordProfile.username}
                  className="w-5 h-5 rounded-md object-contain bg-black/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-black" />
              </div>
              <span className="text-[11px] font-medium max-w-[85px] truncate hidden sm:inline">
                {discordProfile.globalName || discordProfile.username}
              </span>
              {discordProfile.isAuthorizedAdmin && (
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsDiscordAuthOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs bg-[#5865F2] hover:bg-[#4752c4] border-[#5865F2] text-white active:scale-95"
              title="Iniciar sesión oficial con Discord OAuth2"
            >
              <DiscordIcon className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="hidden sm:inline">Iniciar sesión con Discord</span>
              <span className="sm:hidden">Discord</span>
            </button>
          )}

          {/* Discord Server Invitation Icon */}
          <button
            onClick={() => setIsDiscordModalOpen(true)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center opacity-70 hover:opacity-100 ${
              isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-850'
            }`}
            title="Servidor de Discord Oficial"
            aria-label="Servidor de Discord Oficial"
          >
            <DiscordIcon className="w-3.5 h-3.5 fill-[#5865F2]" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-1 transition-colors cursor-pointer ${
              isLight ? 'text-neutral-600 hover:text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-b px-6 py-4 space-y-3 text-xs uppercase tracking-wider font-medium ${
          isLight ? 'bg-white border-neutral-200' : 'bg-[#0d0e12] border-neutral-800'
        }`}>
          <button
            onClick={handleNavToFurniture}
            className={`block w-full text-left py-1.5 ${
              activeCategory === 'furniture'
                ? (isLight ? 'text-black font-bold' : 'text-white font-bold')
                : (isLight ? 'text-neutral-600' : 'text-neutral-400')
            }`}
          >
            Objetos
          </button>
          <button
            onClick={scrollToTeam}
            className={`block w-full text-left py-1.5 ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            Integrantes (3)
          </button>
        </div>
      )}

      {/* Official Discord Community Modal */}
      <DiscordModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />
    </header>
  );
};
