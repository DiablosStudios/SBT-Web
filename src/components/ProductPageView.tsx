import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ScrollReveal } from './ScrollReveal';
import {
  ArrowLeft,
  ShoppingBag,
  Tag,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface ProductPageViewProps {
  product: Product;
  onBack: () => void;
}

export const ProductPageView: React.FC<ProductPageViewProps> = ({ product, onBack }) => {
  const {
    formatPrice,
    addToCart,
    setCheckoutProduct,
    setIsCheckoutOpen,
    theme,
    staffSeats
  } = useStore();

  const [activeTab, setActiveTab] = useState<'content' | 'install' | 'license' | 'team'>('content');
  const [selectedAngle, setSelectedAngle] = useState<number>(0);
  const [isCouponOpen, setIsCouponOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponStatus, setCouponStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  // Scroll to top when loading product page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id]);

  // Configurable media items (Images, GIFs, YouTube videos with custom subtitles/labels)
  const mediaItems: Array<{ type: 'image' | 'video'; label: string; url: string; preview: string }> = useMemo(() => {
    if (product.mediaGallery && product.mediaGallery.length > 0) {
      return product.mediaGallery.map(item => ({
        type: item.type === 'video' ? ('video' as const) : ('image' as const),
        label: item.label,
        url: item.url,
        preview: item.previewUrl || (item.type === 'video' ? (product.image || item.url) : item.url)
      }));
    }

    return [
      { type: 'image' as const, label: 'Vista Principal', url: product.image, preview: product.image },
      ...(product.gifUrl ? [{ type: 'image' as const, label: 'Animación GIF', url: product.gifUrl, preview: product.gifUrl }] : []),
      ...(product.youtubeUrl ? [{ type: 'video' as const, label: 'Video YouTube', url: product.youtubeUrl, preview: product.image }] : []),
      { type: 'image' as const, label: 'Ángulo Isométrico', url: product.gallery?.[1] || product.image, preview: product.gallery?.[1] || product.image },
      { type: 'image' as const, label: 'Detalle de Texturas', url: product.gallery?.[2] || product.image, preview: product.gallery?.[2] || product.image }
    ];
  }, [product]);

  const currentMedia = mediaItems[selectedAngle] || mediaItems[0] || {
    type: 'image' as const,
    label: 'Vista Principal',
    url: product.image,
    preview: product.image
  };

  const getYoutubeEmbed = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  // Price math - standard server license is the only license
  const basePrice = product.price || 350;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'SBT2026' || clean === 'BLUEPORTAL' || clean === 'UNTURNED') {
      setDiscountPercent(15);
      setCouponStatus({ msg: 'Cupón aplicado: 15% de descuento', isError: false });
    } else {
      setCouponStatus({ msg: 'Código de cupón inválido o caducado', isError: true });
    }
  };

  const handleBuyNow = () => {
    setCheckoutProduct({
      ...product,
      price: finalPrice
    });
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: finalPrice
    }, 1);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isLight ? 'bg-[#f6f8fb] text-[#0f172a]' : 'bg-[#08090d] text-[#f8fafc]'
    }`}>

      {/* Top Standalone Header Bar */}
      <div className={`border-b sticky top-16 z-30 backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/90 border-neutral-200 shadow-xs'
          : 'bg-[#0b0c10]/90 border-neutral-800 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Breadcrumb Navigation - Clean normal font */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer px-2.5 py-1.5 rounded ${
                isLight
                  ? 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la tienda</span>
            </button>

            <span className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>/</span>
            
            <button
              onClick={onBack}
              className={`hidden sm:inline transition-colors hover:underline cursor-pointer ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              SBT Studios
            </button>

            <span className={`hidden sm:inline ${isLight ? 'text-neutral-300' : 'text-neutral-700'}`}>/</span>

            <span className={`truncate max-w-[200px] sm:max-w-none font-medium ${
              isLight ? 'text-neutral-900 font-semibold' : 'text-white'
            }`}>
              {product.name}
            </span>
          </div>

          {/* Quick Header Action */}
          <div className="flex items-center gap-3">
            <span className={`hidden md:inline text-xs font-semibold ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              {formatPrice(finalPrice)}
            </span>

            <button
              onClick={handleBuyNow}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                isLight
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'bg-white hover:bg-neutral-200 text-black'
              }`}
            >
              Comprar ahora
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN: Media Gallery and Tabs */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Main Showcase Viewer - CLEAN, NO OVERLAY BADGES */}
            <ScrollReveal>
              <div className={`border rounded-xl overflow-hidden shadow-lg transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-[#0e0f15] border-neutral-800'
              }`}>
                {/* Media Container - supports YouTube video, GIF or Image */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden group flex items-center justify-center">
                  {currentMedia.type === 'video' ? (
                    <iframe
                      src={getYoutubeEmbed(currentMedia.url)}
                      title={product.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={currentMedia.url}
                      alt={product.name}
                      decoding="async"
                      className="w-full h-full object-cover object-center filter brightness-95 transition-transform duration-500 group-hover:scale-102"
                    />
                  )}
                  <div className="absolute bottom-4 right-4 text-[11px] bg-black/60 px-2 py-1 rounded text-neutral-300 flex items-center gap-1.5 pointer-events-none">
                    {currentMedia.type === 'video' ? <Video className="w-3.5 h-3.5 text-red-400" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    <span>{currentMedia.label}</span>
                  </div>
                </div>

                {/* Media Switcher Thumbnails */}
                <div className={`p-4 border-t flex gap-3 overflow-x-auto custom-scrollbar ${
                  isLight ? 'border-neutral-200 bg-neutral-50/70' : 'border-neutral-800 bg-[#0a0b0e]'
                }`}>
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAngle(idx)}
                      className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all cursor-pointer shrink-0 w-28 ${
                        selectedAngle === idx
                          ? (isLight ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white' : 'border-white ring-2 ring-white/20 bg-neutral-800')
                          : (isLight ? 'border-neutral-200 hover:border-neutral-300 bg-white/50' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40')
                      }`}
                    >
                      <div className="aspect-[16/10] overflow-hidden rounded bg-black mb-1.5 relative flex items-center justify-center">
                        <img
                          src={item.preview}
                          alt={item.label}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover filter brightness-90"
                        />
                        {item.type === 'video' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className={`text-[10px] truncate font-medium ${
                        selectedAngle === idx
                          ? (isLight ? 'text-blue-600' : 'text-white')
                          : (isLight ? 'text-neutral-600' : 'text-neutral-400')
                      }`}>
                        {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Detailed Tabs System */}
            <ScrollReveal delay={100}>
              <div className={`border rounded-xl overflow-hidden transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-[#0e0f15] border-neutral-800'
              }`}>
                {/* Tab Navigation */}
                <div className={`flex border-b overflow-x-auto text-xs font-medium ${
                  isLight ? 'border-neutral-200 bg-neutral-50/70' : 'border-neutral-800 bg-[#0a0b0e]'
                }`}>
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'content'
                        ? (isLight ? 'border-neutral-900 text-neutral-900 bg-white font-semibold' : 'border-white text-white bg-[#0e0f15] font-semibold')
                        : (isLight ? 'border-transparent text-neutral-500 hover:text-neutral-900' : 'border-transparent text-neutral-400 hover:text-white')
                    }`}
                  >
                    Contenido del Pack
                  </button>
                  <button
                    onClick={() => setActiveTab('install')}
                    className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'install'
                        ? (isLight ? 'border-neutral-900 text-neutral-900 bg-white font-semibold' : 'border-white text-white bg-[#0e0f15] font-semibold')
                        : (isLight ? 'border-transparent text-neutral-500 hover:text-neutral-900' : 'border-transparent text-neutral-400 hover:text-white')
                    }`}
                  >
                    Guía de Instalación
                  </button>
                  <button
                    onClick={() => setActiveTab('license')}
                    className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'license'
                        ? (isLight ? 'border-neutral-900 text-neutral-900 bg-white font-semibold' : 'border-white text-white bg-[#0e0f15] font-semibold')
                        : (isLight ? 'border-transparent text-neutral-500 hover:text-neutral-900' : 'border-transparent text-neutral-400 hover:text-white')
                    }`}
                  >
                    Licencia del Servidor
                  </button>
                  <button
                    onClick={() => setActiveTab('team')}
                    className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'team'
                        ? (isLight ? 'border-neutral-900 text-neutral-900 bg-white font-semibold' : 'border-white text-white bg-[#0e0f15] font-semibold')
                        : (isLight ? 'border-transparent text-neutral-500 hover:text-neutral-900' : 'border-transparent text-neutral-400 hover:text-white')
                    }`}
                  >
                    Equipo Creador
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6">
                  {activeTab === 'content' && (
                    <div className="space-y-5">
                      <p className={`text-sm leading-relaxed font-light ${
                        isLight ? 'text-neutral-700' : 'text-neutral-300'
                      }`}>
                        {product.longDescription || product.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className={`p-4 rounded-lg border ${
                          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#13141a] border-neutral-800'
                        }`}>
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                            isLight ? 'text-neutral-900' : 'text-white'
                          }`}>
                            Especificaciones 3D
                          </div>
                          <ul className={`text-xs space-y-1.5 font-light ${
                            isLight ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            <li>• Modelado en Blender con topología limpia sin N-gons</li>
                            <li>• Configuración de 2 niveles LOD para optimización</li>
                            <li>• Colisionadores precisos que evitan glitches</li>
                            <li>• Shaders estándar compatibles con Unity 2021 LTS</li>
                          </ul>
                        </div>

                        <div className={`p-4 rounded-lg border ${
                          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#13141a] border-neutral-800'
                        }`}>
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                            isLight ? 'text-neutral-900' : 'text-white'
                          }`}>
                            Archivos Incluidos
                          </div>
                          <ul className={`text-xs space-y-1.5 ${
                            isLight ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            <li>• Carpeta de items de Unturned lista para servidor</li>
                            <li>• SBT_Furniture.unitypackage completo</li>
                            <li>• Archivos de traducción English.dat y Spanish.dat</li>
                            <li>• Archivo de configuración master_ids_config.json</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'install' && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border text-xs leading-relaxed space-y-3 ${
                        isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-[#13141a] border-neutral-800 text-neutral-300'
                      }`}>
                        <div className="font-semibold text-sm">Instalación en servidor Unturned:</div>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>
                            <strong>Descarga el paquete:</strong> Descarga el archivo comprimido tras completar tu orden.
                          </li>
                          <li>
                            <strong>Coloca la carpeta en el servidor:</strong> Pega los archivos dentro de la ruta:
                            <div className={`mt-1.5 p-2 rounded text-xs overflow-x-auto ${
                              isLight ? 'bg-white border border-neutral-200 text-neutral-800' : 'bg-black/60 border border-neutral-800 text-emerald-400'
                            }`}>
                              Unturned/Servers/Default/Workshop/Content/
                            </div>
                          </li>
                          <li>
                            <strong>Inicia el servidor:</strong> Los objetos quedarán listos para uso inmediato.
                          </li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {activeTab === 'license' && (
                    <div className={`space-y-4 text-xs font-light leading-relaxed ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}>
                      <p>
                        <strong>Licencia para el servidor:</strong> Esta compra incluye la licencia perpetua para alojar y utilizar este pack en tu servidor de Unturned de forma permanente, sin cobros recurrentes ni restricciones de jugadores.
                      </p>
                      <p>
                        <strong>Soporte continuo:</strong> Ante cualquier actualización de Unturned que requiera ajustes en los prefabs, recibirás los archivos actualizados sin costo extra.
                      </p>
                    </div>
                  )}

                  {activeTab === 'team' && (
                    <div className="space-y-4">
                      <p className={`text-xs font-light ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Desarrollado y optimizado por los integrantes de SBT Studios:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {staffSeats.map((member) => (
                          <div
                            key={member.id}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#13141a] border-neutral-800'
                            }`}
                          >
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className={`w-10 h-10 ${
                                member.id === 'seat_1'
                                  ? 'object-contain'
                                  : 'rounded-xl object-cover'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className={`text-xs font-semibold truncate ${
                                isLight ? 'text-neutral-900' : 'text-white'
                              }`}>
                                {member.name}
                              </div>
                              <div className={`text-[11px] truncate ${
                                isLight ? 'text-neutral-500' : 'text-neutral-400'
                              }`}>
                                {member.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* RIGHT COLUMN: Ultra-Minimalist Buy Box */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ScrollReveal delay={150}>
              <div className={`sticky top-32 border rounded-xl p-6 shadow-xl space-y-6 transition-colors ${
                isLight ? 'bg-white border-neutral-200' : 'bg-[#0e0f15] border-neutral-800'
              }`}>
                
                {/* Title & Category - Minimal clean text */}
                <div>
                  <div className={`text-xs uppercase tracking-wider font-medium mb-1.5 ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    {product.subcategory} · Unturned 3.0
                  </div>

                  <h1 className={`text-2xl font-semibold tracking-tight ${
                    isLight ? 'text-neutral-900' : 'text-white'
                  }`}>
                    {product.name}
                  </h1>
                  
                  <p className={`text-xs font-light mt-2 line-clamp-2 ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    {product.description}
                  </p>
                </div>

                {/* Minimal Price Display */}
                <div className="border-t border-b py-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xs uppercase tracking-wider font-medium ${
                      isLight ? 'text-neutral-500' : 'text-neutral-400'
                    }`}>
                      Precio
                    </span>
                    <div className="text-right">
                      <span className={`text-3xl font-semibold tracking-tight ${
                        isLight ? 'text-neutral-900' : 'text-white'
                      }`}>
                        {formatPrice(finalPrice)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="block text-xs text-emerald-500 font-medium">
                          15% de descuento aplicado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Server License Note (No multi-choice toggles) */}
                <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
                  isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : 'bg-[#121319] border-neutral-800 text-neutral-300'
                }`}>
                  <div>
                    <div className="font-semibold text-xs">Licencia para el servidor</div>
                    <div className={`text-[11px] font-light ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Uso perpetuo para tu servidor de Unturned
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  }`}>
                    Incluida
                  </span>
                </div>

                {/* Minimal Coupon Link */}
                <div className="space-y-2 pt-1">
                  {!isCouponOpen ? (
                    <button
                      onClick={() => setIsCouponOpen(true)}
                      className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLight ? 'text-neutral-600 hover:text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>¿Tienes un código de descuento?</span>
                    </button>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Código (ej: SBT2026)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={`flex-1 px-3 py-1.5 text-xs rounded-md border uppercase transition-colors outline-hidden ${
                            isLight
                              ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900'
                              : 'bg-[#13141a] border-neutral-800 text-white focus:border-neutral-600'
                          }`}
                        />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                          }`}
                        >
                          Aplicar
                        </button>
                      </div>

                      {couponStatus && (
                        <p className={`text-xs ${
                          couponStatus.isError ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          {couponStatus.msg}
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Clean Actions: Buy Now & Add to Cart */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleBuyNow}
                    className={`w-full py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isLight
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                        : 'bg-white hover:bg-neutral-200 text-black'
                    }`}
                  >
                    <span>Comprar ahora</span>
                    <span className="opacity-80">· {formatPrice(finalPrice)}</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-2.5 px-4 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                        : 'bg-[#14151b] hover:bg-[#1a1b24] border-neutral-800 text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Añadir al carrito</span>
                  </button>
                </div>

                {/* Discreet Delivery Note */}
                <div className={`pt-3 border-t text-xs font-light text-center ${
                  isLight ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800 text-neutral-400'
                }`}>
                  Entrega digital inmediata tras el pago · Compatible con Unturned 3.24+
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </main>

    </div>
  );
};
