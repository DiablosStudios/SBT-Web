import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ChevronDown, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { Currency } from '../types';
import { DiscordIcon } from './DiscordIcon';
import { DiscordModal } from './DiscordModal';

export const Navbar: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    cartCount,
    setIsCartOpen,
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
          
          {/* MINIMALIST ADMIN / ADMINISTRADOR BUTTON */}
          {isAuthorizedAdmin ? (
            <button
              onClick={() => setIsAdminOpen(true)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
              title="Panel de Administración Privado (/admin)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={openDiscordLoginFlow}
              className={`px-2 py-1 rounded-md text-[11px] font-medium tracking-wide uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Acceso Administrador (Login con Discord)"
            >
              <Shield className="w-3 h-3 text-neutral-400" />
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

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative p-1.5 transition-colors cursor-pointer rounded ${
              isLight ? 'text-neutral-800 hover:text-black hover:bg-neutral-100' : 'text-white hover:text-neutral-300 hover:bg-neutral-850'
            }`}
            aria-label="Carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                isLight ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* DISCORD PROFILE LINKED RIGHT NEXT TO CART (Image 3) */}
          {discordProfile ? (
            <button
              onClick={() => setIsDiscordAuthOpen(true)}
              className={`flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-750 text-neutral-200'
              }`}
              title={`Discord: ${discordProfile.username} (${discordProfile.isAuthorizedAdmin ? 'Admin' : 'Usuario'}) - Clic para ver opciones`}
            >
              <div className="relative">
                <img
                  src={discordProfile.avatar}
                  alt={discordProfile.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-black" />
              </div>
              <span className="text-[11px] font-medium max-w-[75px] truncate hidden sm:inline">
                {discordProfile.username.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsDiscordAuthOpen(true)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-250 text-neutral-700'
                  : 'bg-[#121319] hover:bg-[#1a1c24] border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Vincular tu cuenta de Discord"
            >
              <DiscordIcon className="w-3.5 h-3.5 fill-[#5865F2]" />
              <span className="hidden sm:inline text-[11px]">Vincular</span>
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
