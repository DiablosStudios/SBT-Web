import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isShowcaseVariant?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isShowcaseVariant = false }) => {
  const {
    setSelectedProduct,
    setCurrentView,
    addToCart,
    setCheckoutProduct,
    setIsCheckoutOpen,
    formatPrice,
    theme
  } = useStore();

  const isLight = theme === 'light';

  const handleInstantBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleOpenProduct = () => {
    setSelectedProduct(product);
    setCurrentView('product');
  };

  if (isShowcaseVariant) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleInstantBuy}
          className={`flex-1 py-3 px-6 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            isLight
              ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
              : 'bg-white hover:bg-neutral-200 text-black'
          }`}
        >
          <span>Comprar ahora</span>
        </button>
        <button
          onClick={handleAddToCart}
          className={`p-3 rounded border transition-colors cursor-pointer ${
            isLight
              ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white'
          }`}
          title="Añadir al carrito"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleOpenProduct}
      className={`group border rounded-xl flex flex-col justify-between cursor-pointer overflow-hidden transition-all shadow-md hover:shadow-xl ${
        isLight
          ? 'bg-white border-neutral-200 hover:border-neutral-400'
          : 'bg-[#0e0f14] border-neutral-800 hover:border-neutral-600'
      }`}
    >
      {/* Clean image container WITHOUT any badge overlays */}
      <div className="relative aspect-[16/10] bg-black overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className={`text-[11px] uppercase mb-1 tracking-wider font-medium ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}>
            {product.subcategory}
          </div>
          <h3 className={`text-base font-medium transition-colors line-clamp-1 mb-2 ${
            isLight ? 'text-neutral-900 group-hover:text-blue-600' : 'text-white group-hover:text-neutral-200'
          }`}>
            {product.name}
          </h3>
          <p className={`text-xs line-clamp-2 leading-relaxed mb-4 font-light ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}>
            {product.description}
          </p>
        </div>

        <div className={`pt-3 border-t flex items-center justify-between ${
          isLight ? 'border-neutral-200' : 'border-neutral-800'
        }`}>
          <div className={`text-base font-bold ${
            isLight ? 'text-neutral-900' : 'text-white'
          }`}>
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Añadir al carrito"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleInstantBuy}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                isLight
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              Comprar
            </button>
          </div>
        </div>

        <div className={`mt-3 pt-2 border-t text-[11px] flex items-center justify-between transition-colors ${
          isLight
            ? 'border-neutral-100 text-neutral-500 group-hover:text-blue-600'
            : 'border-neutral-850 text-neutral-500 group-hover:text-white'
        }`}>
          <span>Ver página del producto</span>
          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
