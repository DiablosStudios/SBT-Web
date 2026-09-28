import React from 'react';
import { useStore } from '../context/StoreContext';
import { heroImg } from '../data/initialData';
import { ScrollReveal } from './ScrollReveal';

export const Hero: React.FC = () => {
  const { setActiveCategory, theme } = useStore();

  const isLight = theme === 'light';

  const scrollToCatalog = () => {
    setActiveCategory('furniture');
    const elem = document.getElementById('catalog-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`border-b transition-colors ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
      <section className="relative min-h-[52vh] flex items-center bg-[#07080b] overflow-hidden">
        {/* Background Image - Clean cinematic photography */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="SBT Studios - Modern furniture Unturned"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-[#07080b]/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 w-full">
          <ScrollReveal>
            <div className="max-w-xl">
              
              {/* Studio Label - Clean normal font */}
              <div className="text-xs uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2 font-medium">
                <span className="text-white">SBT Studios</span>
                <span className="text-neutral-600">·</span>
                <span>Unturned Assets</span>
              </div>

              {/* Clean Main Headline with Fluid Adaptive Typography */}
              <h1 className="text-adaptive-display font-light text-white tracking-tight leading-[1.05] mb-5">
                Modern furniture <br />
                <span className="font-normal text-neutral-300">for your office</span>
              </h1>

              <p className="text-adaptive-lead text-neutral-300 font-light leading-relaxed mb-8 max-w-md">
                Colección exclusiva de mobiliario minimalista nórdico para servidores de Unturned 3.0. Modelado limpio de bajo poligonaje, optimización de colisiones y entrega digital inmediata con licencia para tu servidor.
              </p>

              {/* Clean, authentic action button */}
              <div>
                <button
                  onClick={scrollToCatalog}
                  className="px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-md"
                >
                  Ver colección
                </button>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
