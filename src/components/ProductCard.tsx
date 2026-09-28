import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { DiscordIcon } from './DiscordIcon';

interface ProductCardProps {
  product: Product;
  isShowcaseVariant?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isShowcaseVariant = false }) => {
  const {
    setSelectedProduct,
    setCurrentView,
    formatPrice,
    theme
  } = useStore();

  const isLight = theme === 'light';

  const handleOpenProduct = () => {
    setSelectedProduct(product);
    setCurrentView('product');
  };

  if (isShowcaseVariant) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="https://discord.gg/rJQae9XzrP"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 py-3 px-6 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md bg-[#5865F2] hover:bg-[#4752c4] text-white"
        >
          <DiscordIcon className="w-4 h-4 fill-white" />
          <span>Pedir en Discord</span>
        </a>
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
          <a
            href="https://discord.gg/rJQae9XzrP"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer bg-[#5865F2] hover:bg-[#4752c4] text-white flex items-center gap-1.5 shadow-sm"
          >
            <DiscordIcon className="w-3.5 h-3.5 fill-white" />
            <span>Discord</span>
          </a>
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
