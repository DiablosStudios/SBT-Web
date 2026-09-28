import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ScrollReveal } from './ScrollReveal';
import {
  ArrowLeft,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { DiscordIcon } from './DiscordIcon';

interface ProductPageViewProps {
  product: Product;
  onBack: () => void;
}

export const ProductPageView: React.FC<ProductPageViewProps> = ({ product, onBack }) => {
  const {
    formatPrice,
    theme,
    staffSeats
  } = useStore();

  const [activeTab, setActiveTab] = useState<'content' | 'install' | 'license' | 'team'>('content');
  const [selectedAngle, setSelectedAngle] = useState<number>(0);

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
  const finalPrice = product.price || 350;

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

            <a
              href="https://discord.gg/rJQae9XzrP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer bg-[#5865F2] hover:bg-[#4752c4] text-white flex items-center gap-1.5 shadow-sm"
            >
              <DiscordIcon className="w-3.5 h-3.5 fill-white" />
              <span>Pedir en Discord</span>
            </a>
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
                              className="w-10 h-10 rounded-xl object-cover"
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
                    </div>
                  </div>
                </div>

                {/* Server License Note */}
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

                {/* Discord Order Action */}
                <div className="space-y-3 pt-2">
                  <a
                    href="https://discord.gg/rJQae9XzrP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-[#5865F2] hover:bg-[#4752c4] text-white"
                  >
                    <DiscordIcon className="w-4 h-4 fill-white" />
                    <span>Adquirir en Discord · {formatPrice(finalPrice)}</span>
                  </a>

                  <div className={`p-3.5 rounded-lg border text-xs leading-relaxed text-center ${
                    isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#121319] border-neutral-800 text-neutral-400'
                  }`}>
                    Para adquirir este paquete, haz clic en el botón superior para ingresar a nuestro Discord oficial. Un desarrollador te entregará los archivos y la activación de forma inmediata.
                  </div>
                </div>

                {/* Delivery Note */}
                <div className={`pt-3 border-t text-xs font-light text-center ${
                  isLight ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800 text-neutral-400'
                }`}>
                  Entrega de archivos y soporte técnico directamente en Discord · Compatible con Unturned 3.24+
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </main>

    </div>
  );
};
