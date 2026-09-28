import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ScrollReveal } from './ScrollReveal';
import {
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const {
    products,
    formatPrice,
    addToCart,
    setCheckoutProduct,
    setIsCheckoutOpen,
    setSelectedProduct,
    setCurrentView,
    theme
  } = useStore();

  const isLight = theme === 'light';

  const furnitureProducts = products.filter(p => p.category === 'furniture');
  const catalogList = furnitureProducts.length > 0 ? furnitureProducts : products;

  const handleOpenProductPage = (prod: Product) => {
    setSelectedProduct(prod);
    setCurrentView('product');
  };

  const handleInstantBuy = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckoutProduct(prod);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(prod, 1);
  };

  return (
    <section
      id="catalog-section"
      className={`py-12 border-b transition-colors ${
        isLight ? 'bg-[#f6f8fb] border-neutral-200' : 'bg-[#08090d] border-neutral-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        
        {/* DEVELOPER PROFILE BANNER */}
        <ScrollReveal>
          <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-[#0e0f14] border-neutral-800'
          }`}>
            {/* Subtle Studio Cover Banner */}
            <div className={`h-36 sm:h-44 relative overflow-hidden ${
              isLight
                ? 'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200'
                : 'bg-gradient-to-r from-[#12131a] via-[#1a1b24] to-[#0f1015]'
            }`}>
              <div className={`absolute inset-0 opacity-20 [background-size:16px_16px] ${
                isLight
                  ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)]'
                  : 'bg-[radial-gradient(#404040_1px,transparent_1px)]'
              }`}></div>
            </div>

            {/* Profile Details Bar */}
            <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-14">
              
              {/* Avatar & Info */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 p-1 shadow-2xl shrink-0 flex items-center justify-center overflow-hidden transition-colors ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-[#090a0d] border-neutral-700'
                }`}>
                  <div className="w-full h-full rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl tracking-wider bg-neutral-900 text-white">
                    SBT
                  </div>
                </div>

                <div className="space-y-1 sm:pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                      isLight ? 'text-neutral-900' : 'text-white'
                    }`}>
                      SBT Studios
                    </h1>
                  </div>
                  <p className={`text-xs max-w-xl leading-relaxed font-light ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    Estudio independiente de desarrollo y creación de assets para Unturned 3.0. Especialistas en modelado 3D de alta gama y mobiliario minimalista con licencia de servidor.
                  </p>
                  <div className={`flex items-center gap-4 text-xs pt-1 flex-wrap font-normal ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    <span>{catalogList.length} {catalogList.length === 1 ? 'Producto de mobiliario' : 'Productos de mobiliario'}</span>
                    <span className={isLight ? 'text-neutral-300' : 'text-neutral-600'}>·</span>
                    <span>3 Desarrolladores</span>
                    <span className={isLight ? 'text-neutral-300' : 'text-neutral-600'}>·</span>
                    <span>Unturned 3.0 / Unity 2021 LTS</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="sm:pb-1 shrink-0 flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 font-normal ${
                  isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-700' : 'bg-[#14151b] border-neutral-800 text-neutral-300'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>3 Integrantes activos</span>
                </div>
              </div>

            </div>

            {/* Navigation Bar inside Storefront */}
            <div className={`border-t px-6 py-3 flex items-center justify-between gap-4 flex-wrap transition-colors ${
              isLight ? 'border-neutral-200 bg-neutral-50/80' : 'border-neutral-800 bg-[#0b0c10]'
            }`}>
              <div className="flex items-center gap-6 text-xs uppercase tracking-wider font-medium">
                <div className={`py-1 ${
                  isLight ? 'text-black border-b-2 border-black font-semibold' : 'text-white border-b-2 border-white font-semibold'
                }`}>
                  Objetos ({catalogList.length})
                </div>
              </div>

              <div className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Licencia para el servidor incluida
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* OBJETOS (Furniture) CATALOG */}
        {catalogList.length > 0 && (
          <div className="space-y-6">
            <ScrollReveal delay={100}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-medium tracking-tight ${
                    isLight ? 'text-neutral-900' : 'text-white'
                  }`}>
                    Productos de Mobiliario (Objetos)
                  </h2>
                  <p className={`text-xs mt-0.5 ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    Haz clic en el producto para abrir su página completa con visor 4K, especificaciones y pasarela de compra.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Product Card Grid */}
            <ScrollReveal delay={150}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogList.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleOpenProductPage(prod)}
                    className={`group border rounded-xl overflow-hidden cursor-pointer transition-all shadow-xl flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-2xl'
                        : 'bg-[#0e0f14] border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {/* Clean image container WITHOUT any badge overlays */}
                    <div className="relative aspect-[16/10] bg-black overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className={`text-xs mb-1 uppercase tracking-wider font-medium ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>
                          {prod.subcategory}
                        </div>
                        <h3 className={`text-lg font-medium transition-colors mb-2 ${
                          isLight ? 'text-neutral-900 group-hover:text-blue-600' : 'text-white group-hover:text-neutral-200'
                        }`}>
                          {prod.name}
                        </h3>
                        <p className={`text-xs line-clamp-2 leading-relaxed mb-5 font-light ${
                          isLight ? 'text-neutral-600' : 'text-neutral-400'
                        }`}>
                          {prod.description}
                        </p>
                      </div>

                      <div className={`pt-4 border-t flex items-center justify-between ${
                        isLight ? 'border-neutral-200' : 'border-neutral-800'
                      }`}>
                        <div>
                          <div className={`text-xs ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>Precio</div>
                          <div className={`text-lg font-semibold ${
                            isLight ? 'text-neutral-900' : 'text-white'
                          }`}>
                            {formatPrice(prod.price)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleInstantBuy(prod, e)}
                            className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                              isLight
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                                : 'bg-white hover:bg-neutral-200 text-black'
                            }`}
                          >
                            <span>Comprar</span>
                          </button>

                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className={`p-2 rounded border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white'
                            }`}
                            title="Añadir al carrito"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={`px-5 py-3 border-t text-xs flex items-center justify-between transition-colors ${
                      isLight
                        ? 'border-neutral-100 bg-neutral-50 text-blue-600 font-medium group-hover:bg-neutral-100'
                        : 'border-neutral-850 bg-[#0b0c10] text-neutral-400 group-hover:text-white'
                    }`}>
                      <span>Abrir página del producto</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        )}

      </div>
    </section>
  );
};
