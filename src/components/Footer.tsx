import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveCategory, setIsAdminOpen, setSelectedProduct, setCurrentView, theme, isAuthorizedAdmin, openDiscordLoginFlow } = useStore();
  const isLight = theme === 'light';

  const handleNavToFurniture = () => {
    setSelectedProduct(null);
    setCurrentView('store');
    setActiveCategory('furniture');
    const elem = document.getElementById('catalog-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`border-t text-xs transition-colors ${
      isLight ? 'bg-white border-neutral-200 text-neutral-500' : 'bg-[#07080a] border-neutral-900 text-neutral-400'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold tracking-[0.2em] ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                SBT
              </span>
              <span className={`text-xs uppercase font-light tracking-[0.3em] pl-1 border-l ${
                isLight ? 'border-neutral-300 text-neutral-500' : 'border-neutral-700 text-neutral-400'
              }`}>
                STUDIOS
              </span>
            </div>
            <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Estudio independiente especializado en modelado 3D de alta gama y mobiliario contemporáneo para servidores de Unturned 3.0.
            </p>
            <div className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Entrega digital automatizada · Licencia para servidor.
            </div>
          </div>

          {/* Section: Objetos */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              Objetos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={handleNavToFurniture}
                  className={`transition-colors cursor-pointer ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  SBT Furnture minimalista ($350 USD)
                </button>
              </li>
              <li>
                <button
                  onClick={handleNavToFurniture}
                  className={`transition-colors cursor-pointer ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
                >
                  Living y Muebles Nórdicos
                </button>
              </li>
            </ul>
          </div>

          {/* Staff Access */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              Administración
            </h4>
            <ul className="space-y-2 text-xs">
              {isAuthorizedAdmin ? (
                <li>
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isLight ? 'hover:text-black' : 'hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Panel /admin (Staff)</span>
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={openDiscordLoginFlow}
                    className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isLight ? 'hover:text-black text-neutral-500' : 'hover:text-white text-neutral-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]"></span>
                    <span>Iniciar sesión con Discord</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={scrollToTop}
                  className={`transition-colors flex items-center gap-1 cursor-pointer ${
                    isLight ? 'hover:text-black' : 'hover:text-white'
                  }`}
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Volver al inicio</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Legal */}
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] ${
          isLight ? 'border-neutral-200 text-neutral-400' : 'border-neutral-800/80 text-neutral-500'
        }`}>
          <p>
            © {new Date().getFullYear()} SBT Studios. Todos los derechos reservados.
            Unturned es una marca registrada de Smartly Dressed Games.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <span>Unity 2021 LTS</span>
            <span>·</span>
            <span>Steam Workshop</span>
            <span>·</span>
            <span>SSL 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
