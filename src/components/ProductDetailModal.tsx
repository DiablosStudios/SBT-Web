import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShoppingBag, Zap, Copy, Check, Terminal, ShieldCheck, Tag } from 'lucide-react';
import { DiscordIcon } from './DiscordIcon';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    formatPrice
  } = useStore();

  const [activeMedia, setActiveMedia] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!selectedProduct) return null;

  const currentMedia = activeMedia || selectedProduct.image;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#0f1015] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0a0b0e]">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="text-white font-bold uppercase tracking-wider">
              {selectedProduct.category === 'furniture'
                ? 'Objetos'
                : selectedProduct.category === 'ui'
                ? 'Diseño UI'
                : 'Objetos RP'}
            </span>
            <span>/</span>
            <span className="text-neutral-400">{selectedProduct.subcategory}</span>
          </div>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
          
          {/* Left Column: Gallery & Media Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative aspect-[16/10] bg-neutral-950 rounded border border-neutral-800 overflow-hidden">
              <img
                src={currentMedia}
                alt={selectedProduct.name}
                className="w-full h-full object-cover object-center filter brightness-95"
              />
            </div>

            {/* Media Thumbnails */}
            {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {selectedProduct.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(imgUrl)}
                    className={`relative w-20 h-14 rounded overflow-hidden border shrink-0 transition-all ${
                      currentMedia === imgUrl
                        ? 'border-white ring-1 ring-white'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Unturned In-Game Commands Generator */}
            <div className="p-4 bg-[#090a0d] border border-neutral-800 rounded font-mono">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  Comandos Unturned (Chat / Servidor):
                </span>
                <span className="text-[10px] text-neutral-500">Click para copiar</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {selectedProduct.unturnedIds.map((itemStr, idx) => {
                  const idOnly = itemStr.split(' ')[0].replace(/[^0-9]/g, '') || itemStr;
                  const giveCmd = `@give me/${idOnly}`;
                  const isCopied = copiedId === itemStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => copyToClipboard(giveCmd, itemStr)}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-[#121319] hover:bg-[#191a22] rounded border border-neutral-800 cursor-pointer text-xs group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{itemStr}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-white">
                        <code>{giveCmd}</code>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 ml-1 text-neutral-500 group-hover:text-neutral-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Purchasing */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white font-mono">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-neutral-500 line-through font-mono">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-emerald-400">
                  Entrega inmediata
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-3">
                {selectedProduct.name}
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
                {selectedProduct.longDescription || selectedProduct.description}
              </p>

              {/* Technical Spec List */}
              <div className="border-t border-b border-neutral-800 py-3 mb-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tipo de Mod:</span>
                  <span className="text-neutral-200">{selectedProduct.modType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Versión Unity:</span>
                  <span className="text-neutral-200">{selectedProduct.unityVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Archivo:</span>
                  <span className="text-neutral-200 truncate max-w-[200px]">
                    {selectedProduct.downloadFileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Compatibilidad:</span>
                  <span className="text-neutral-300">Unturned 3.0 / RocketMod / Vanilla</span>
                </div>
              </div>

              {/* Features List */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Características:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {selectedProduct.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Button linking to Discord */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-800">
              <a
                href="https://discord.gg/rJQae9XzrP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                title="Pedir a través del Discord oficial de SBT Studios"
              >
                <DiscordIcon className="w-4.5 h-4.5 fill-white" />
                <span>Pedir en Discord · {formatPrice(selectedProduct.price)}</span>
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
