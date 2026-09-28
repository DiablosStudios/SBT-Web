import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, ProductMediaItem, UploadedMediaItem } from '../types';
import { heroImg, furnitureImg, rpImg, uiImg, bmExactLogo } from '../data/initialData';
import {
  X,
  ShieldCheck,
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  Activity,
  DollarSign,
  Image as ImageIcon,
  Video,
  Sparkles,
  Lock,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  UploadCloud,
  Check,
  FolderUp,
  Tag,
  Copy,
  Layers,
  FileImage,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Star,
  AlertCircle
} from 'lucide-react';
import { DiscordIcon } from './DiscordIcon';
import { api } from '../utils/api';

export const AdminPortal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    staffSeats,
    currentStaff,
    switchStaffSeat,
    orders,
    products,
    updateProduct,
    quickUpdatePrice,
    bulkAddProductsFromFiles,
    uploadedMedia,
    addUploadedMedia,
    bulkAddUploadedMedia,
    removeUploadedMedia,
    addProduct,
    deleteProduct,
    auditLogs,
    formatPrice,
    theme,
    toggleTheme,
    isAuthorizedAdmin,
    discordProfile,
    setIsDiscordAuthOpen,
    openDiscordLoginFlow,
    syncStatus
  } = useStore();

  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'furniture' | 'files' | 'orders' | 'analytics' | 'staff'>('furniture');

  // Quick Price Editor state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [priceSavedToast, setPriceSavedToast] = useState<{ id: string; price: number } | null>(null);

  // Search in furniture
  const [furnitureSearch, setFurnitureSearch] = useState('');

  // Bulk Uploader & Drag-Drop State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; currentName: string } | null>(null);
  const [autoCreateFurniture, setAutoCreateFurniture] = useState(true);
  const [bulkDefaultPrice, setBulkDefaultPrice] = useState<number>(350);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const [bulkErrorMsg, setBulkErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product creation / editing states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for Add / Edit Single Furniture
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    subcategory: string;
    description: string;
    longDescription: string;
    image: string;
    gifUrl: string;
    youtubeUrl: string;
    unturnedIds: string;
    features: string;
    downloadFileName: string;
    mediaGallery: ProductMediaItem[];
  }>({
    name: '',
    price: 350,
    subcategory: 'Mobiliario Nórdico Exclusivo',
    description: '',
    longDescription: '',
    image: '',
    gifUrl: '',
    youtubeUrl: '',
    unturnedIds: '',
    features: '',
    downloadFileName: '',
    mediaGallery: []
  });

  if (!isAdminOpen) return null;

  // Strict guard: Admin portal only renders if Discord ID has been verified as Admin
  if (!isAuthorizedAdmin) {
    return null;
  }

  // Handler for Inline Quick Price Change
  const handleStartQuickPrice = (prod: Product) => {
    setEditingPriceId(prod.id);
    setQuickPriceValue(prod.price.toString());
  };

  const handleSaveQuickPrice = (productId: string) => {
    const val = parseFloat(quickPriceValue);
    if (!isNaN(val) && val >= 0) {
      quickUpdatePrice(productId, val);
      setPriceSavedToast({ id: productId, price: val });
      setTimeout(() => setPriceSavedToast(null), 2500);
    }
    setEditingPriceId(null);
  };

  const handleQuickStepPrice = (productId: string, currentPrice: number, delta: number) => {
    const next = Math.max(0, currentPrice + delta);
    quickUpdatePrice(productId, next);
    setPriceSavedToast({ id: productId, price: next });
    setTimeout(() => setPriceSavedToast(null), 2500);
  };

  // Helper to optimize and compress images from user computer to keep app fast
  // Maximum dimension: 1000px, JPEG quality 0.8 as required
  const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB limit

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return reject(new Error(`El archivo "${file.name}" supera el límite máximo de 8MB.`));
      }

      // Keep animated GIFs intact to preserve all frames
      if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(new Error(`Error al leer el archivo GIF ${file.name}`));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => reject(new Error(`No se pudo decodificar la imagen ${file.name}`));
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => reject(new Error(`Error al leer el archivo ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  // Upload to server storage to get real persistent URL (not base64 in JSON)
  const processAndUploadFile = async (
    file: File
  ): Promise<{ url: string; name: string; isGif: boolean; sizeFormatted: string }> => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`El archivo "${file.name}" excede el límite de 8MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
    }

    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const sizeFormatted = `${Math.round(file.size / 1024)} KB`;

    // 1. Compress image client-side to save bandwidth & memory
    const dataUrl = await compressImageFile(file);

    // 2. Upload to server to get live persistent URL
    const uploadRes = await api.uploadFile({
      filename: file.name,
      dataUrl,
      type: isGif ? 'gif' : 'image',
      sizeFormatted
    });

    return {
      url: uploadRes.url,
      name: file.name,
      isGif,
      sizeFormatted
    };
  };

  // Handler for Computer Files selection (single or bulk) with independent try/catch per file
  const handleProcessComputerFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    setBulkSuccessMsg(null);
    setBulkErrorMsg(null);

    const fileList = Array.from(files);
    const loadedFiles: { name: string; url: string; isGif: boolean; size: string }[] = [];
    const failedFiles: { name: string; error: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProcessingProgress({ current: i + 1, total: fileList.length, currentName: file.name });

      try {
        const uploaded = await processAndUploadFile(file);
        loadedFiles.push({
          name: uploaded.name,
          url: uploaded.url,
          isGif: uploaded.isGif,
          size: uploaded.sizeFormatted
        });
      } catch (err: any) {
        console.error(`Error procesando archivo ${file.name}:`, err);
        failedFiles.push({
          name: file.name,
          error: err.message || 'Error desconocido'
        });
      }
    }

    // 1. Add all successful uploads to media library
    if (loadedFiles.length > 0) {
      for (const f of loadedFiles) {
        await addUploadedMedia({
          name: f.name,
          url: f.url,
          type: f.isGif ? 'gif' : 'image',
          sizeFormatted: f.size
        });
      }

      // 2. If bulk furniture creation is enabled: create them in shared server catalog!
      if (autoCreateFurniture) {
        const created = await bulkAddProductsFromFiles(loadedFiles, bulkDefaultPrice);
        setBulkSuccessMsg(`¡Éxito! Se crearon ${created.length} nuevos muebles en vivo en el servidor con URLs compartidas.`);
      } else {
        setBulkSuccessMsg(`¡Éxito! Se subieron ${loadedFiles.length} archivos a la biblioteca compartida del servidor.`);
      }
    }

    // 3. Inform user if any file failed
    if (failedFiles.length > 0) {
      const details = failedFiles.map(f => `"${f.name}" (${f.error})`).join(', ');
      setBulkErrorMsg(`Atención: ${failedFiles.length} archivo(s) no se pudieron procesar: ${details}`);
    }

    setProcessingProgress(null);
    setIsProcessingFiles(false);
  };

  // Modal Media Suite: Browse image from computer for a specific row
  const handleBrowseRowImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await processAndUploadFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

      setFormData(prev => {
        const next = [...prev.mediaGallery];
        next[index] = {
          ...next[index],
          url: uploaded.url,
          previewUrl: uploaded.url,
          type: uploaded.isGif ? 'gif' : 'image',
          label: next[index]?.label || cleanName
        };
        return { ...prev, mediaGallery: next };
      });
    } catch (err: any) {
      alert(err.message || 'Error al procesar archivo');
    }
  };

  // Modal Media Suite: Bulk add multiple views from computer at once
  const handleBulkAddModalViews = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    for (const file of fileList) {
      try {
        const uploaded = await processAndUploadFile(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

        setFormData(prev => ({
          ...prev,
          mediaGallery: [
            ...prev.mediaGallery,
            {
              id: `mg-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              type: uploaded.isGif ? 'gif' : 'image',
              label: cleanName || `Vista ${prev.mediaGallery.length + 1}`,
              url: uploaded.url,
              previewUrl: uploaded.url
            }
          ]
        }));
      } catch (err: any) {
        console.warn(`Error al subir vista modal:`, err);
      }
    }
  };

  // Open single product add modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      price: 350,
      subcategory: 'Mobiliario Nórdico Exclusivo',
      description: 'Nuevo set de muebles para servidores Unturned 3.0 con colisiones sin bugs y texturas PBR.',
      longDescription: 'Mobiliario modelado a medida con compatibilidad total para Unity 2021 LTS, colisiones optimizadas y licencia de servidor perpetua.',
      image: heroImg,
      gifUrl: '',
      youtubeUrl: '',
      unturnedIds: '60201, 60202',
      features: 'Animación interactiva, Colisiones optimizadas, Licencia de servidor incluida',
      downloadFileName: 'SBT_Nuevo_Mueble_v1.unitypackage',
      mediaGallery: [
        {
          id: `mg-${Date.now()}-1`,
          type: 'image',
          label: 'Vista Principal',
          url: heroImg,
          previewUrl: heroImg
        },
        {
          id: `mg-${Date.now()}-2`,
          type: 'image',
          label: 'Ángulo Isométrico',
          url: furnitureImg,
          previewUrl: furnitureImg
        }
      ]
    });
    setIsAddingProduct(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const initialGallery: ProductMediaItem[] = (prod.mediaGallery && prod.mediaGallery.length > 0)
      ? prod.mediaGallery.map(m => ({ ...m }))
      : [
          {
            id: `${prod.id}-mg-1`,
            type: 'image',
            label: 'Vista Principal',
            url: prod.image,
            previewUrl: prod.image
          },
          ...(prod.gifUrl ? [{
            id: `${prod.id}-mg-gif`,
            type: 'gif' as const,
            label: 'Animación GIF',
            url: prod.gifUrl,
            previewUrl: prod.gifUrl
          }] : [])
        ];

    setFormData({
      name: prod.name,
      price: prod.price,
      subcategory: prod.subcategory,
      description: prod.description,
      longDescription: prod.longDescription || prod.description,
      image: prod.image,
      gifUrl: prod.gifUrl || '',
      youtubeUrl: prod.youtubeUrl || '',
      unturnedIds: (prod.unturnedIds || []).join(', '),
      features: (prod.features || []).join(', '),
      downloadFileName: prod.downloadFileName || 'SBT_Asset.unitypackage',
      mediaGallery: initialGallery
    });
  };

  const handleAddMediaItem = () => {
    const nextIndex = formData.mediaGallery.length + 1;
    const newItem: ProductMediaItem = {
      id: `mg-custom-${Date.now()}`,
      type: 'image',
      label: `Vista de Muestra ${nextIndex}`,
      url: heroImg,
      previewUrl: heroImg
    };
    setFormData(prev => ({
      ...prev,
      mediaGallery: [...prev.mediaGallery, newItem]
    }));
  };

  const handleUpdateMediaItem = (index: number, updates: Partial<ProductMediaItem>) => {
    setFormData(prev => {
      const nextGallery = [...prev.mediaGallery];
      nextGallery[index] = { ...nextGallery[index], ...updates };
      return { ...prev, mediaGallery: nextGallery };
    });
  };

  const handleRemoveMediaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const idsArray = formData.unturnedIds
      ? formData.unturnedIds.split(',').map(s => s.trim()).filter(Boolean)
      : ['60101'];

    const featuresArray = formData.features
      ? formData.features.split(',').map(s => s.trim()).filter(Boolean)
      : ['Licencia para el servidor incluida'];

    const validMediaGallery: ProductMediaItem[] = formData.mediaGallery.length > 0
      ? formData.mediaGallery
      : [
          {
            id: `mg-default-1`,
            type: 'image',
            label: 'Vista Principal',
            url: formData.image || heroImg,
            previewUrl: formData.image || heroImg
          }
        ];

    const firstImage = validMediaGallery.find(m => m.type !== 'video')?.url || validMediaGallery[0]?.url || heroImg;
    const foundGif = validMediaGallery.find(m => m.type === 'gif')?.url || formData.gifUrl || undefined;
    const foundYt = validMediaGallery.find(m => m.type === 'video')?.url || formData.youtubeUrl || undefined;
    const galleryUrls = validMediaGallery.map(m => m.url);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        subcategory: formData.subcategory.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        image: firstImage,
        gifUrl: foundGif,
        youtubeUrl: foundYt,
        gallery: galleryUrls.length > 0 ? galleryUrls : [firstImage],
        mediaGallery: validMediaGallery,
        unturnedIds: idsArray,
        features: featuresArray,
        downloadFileName: formData.downloadFileName.trim() || `${formData.name.replace(/\s+/g, '_')}.unitypackage`
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name.trim(),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'furniture',
        subcategory: formData.subcategory.trim() || 'Mobiliario Nórdico Exclusivo',
        price: Number(formData.price) || 350,
        originalPrice: Number(formData.price) ? Number(formData.price) * 1.2 : 420,
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        image: firstImage,
        gifUrl: foundGif,
        youtubeUrl: foundYt,
        gallery: galleryUrls.length > 0 ? galleryUrls : [firstImage],
        mediaGallery: validMediaGallery,
        unturnedIds: idsArray,
        unityVersion: 'Unity 2021.3.29f1 (LTS)',
        modType: 'Barricade',
        stockType: 'unlimited',
        rating: 5.0,
        salesCount: 0,
        features: featuresArray,
        downloadFileName: formData.downloadFileName.trim() || `${formData.name.replace(/\s+/g, '_')}.unitypackage`,
        tags: ['Muebles', 'Unturned', 'SBT Studios'],
        featured: true
      });
      setIsAddingProduct(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Furniture
  const filteredFurniture = products.filter(p => {
    if (!furnitureSearch.trim()) return true;
    const q = furnitureSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      (p.unturnedIds || []).some(id => id.includes(q));
  });

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q);
    }
    return true;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'Reembolsado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-colors duration-200 select-text ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-[#0e0f14] border-neutral-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Ultra-Minimalist Top Bar */}
        <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between transition-colors ${
          isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-900' : 'bg-[#090a0d] border-neutral-800 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              SBT Studios
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
              isLight ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-850 text-neutral-300'
            }`}>
              /admin
            </span>

            {discordProfile && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium pl-1">
                <span className="opacity-40">•</span>
                <img src={discordProfile.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>{discordProfile.username}</span>
              </span>
            )}

            {/* Live Server Sync Status Indicator */}
            {syncStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Publicando...</span>
              </span>
            )}
            {syncStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Publicado en vivo</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>Error al guardar</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button inside Admin Panel */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                isLight
                  ? 'text-neutral-600 hover:text-black hover:bg-neutral-200/70'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              aria-label={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {isLight ? (
                <Moon className="w-3.5 h-3.5 text-neutral-800" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => setIsAdminOpen(false)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-neutral-400 hover:text-black hover:bg-neutral-200/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Gate: If not authorized admin */}
        {!isAuthorizedAdmin ? (
          <div className="p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
              isLight ? 'bg-neutral-100 border-neutral-200 text-neutral-700' : 'bg-neutral-900 border-neutral-800 text-neutral-300'
            }`}>
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Apartado Privado /admin</h3>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Para acceder a <strong>Administrar muebles</strong> y <strong>Subir archivos</strong> debes autenticarte con una cuenta autorizada de Discord.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={openDiscordLoginFlow}
                className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <DiscordIcon className="w-4 h-4 fill-white" />
                <span>Login con Discord (OAuth2)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Navigation Tabs as specified in user request diagram */}
            <div className={`px-4 sm:px-6 border-b flex items-center justify-between overflow-x-auto text-xs font-medium transition-colors ${
              isLight ? 'bg-neutral-100/60 border-neutral-200' : 'bg-[#0c0d12] border-neutral-800'
            }`}>
              {/* The Two Main Sections */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('furniture')}
                  className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'furniture'
                      ? (isLight ? 'border-neutral-900 text-neutral-900 font-bold' : 'border-white text-white font-bold')
                      : (isLight ? 'border-transparent text-neutral-500 hover:text-black' : 'border-transparent text-neutral-400 hover:text-neutral-200')
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Administrar muebles ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('files')}
                  className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'files'
                      ? (isLight ? 'border-neutral-900 text-neutral-900 font-bold' : 'border-white text-white font-bold')
                      : (isLight ? 'border-transparent text-neutral-500 hover:text-black' : 'border-transparent text-neutral-400 hover:text-neutral-200')
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                  <span>Subir archivos (GIFs / imágenes)</span>
                </button>
              </div>

              {/* Secondary Sections (Ventas, Métricas, Staff) */}
              <div className="flex items-center gap-1 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-[11px] ${
                    activeTab === 'orders'
                      ? (isLight ? 'border-neutral-900 text-neutral-900 font-semibold' : 'border-white text-white font-semibold')
                      : (isLight ? 'border-transparent text-neutral-500 hover:text-black' : 'border-transparent text-neutral-400 hover:text-neutral-200')
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Ventas ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-[11px] ${
                    activeTab === 'analytics'
                      ? (isLight ? 'border-neutral-900 text-neutral-900 font-semibold' : 'border-white text-white font-semibold')
                      : (isLight ? 'border-transparent text-neutral-500 hover:text-black' : 'border-transparent text-neutral-400 hover:text-neutral-200')
                  }`}
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Métricas</span>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`py-3 px-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-[11px] ${
                    activeTab === 'staff'
                      ? (isLight ? 'border-neutral-900 text-neutral-900 font-semibold' : 'border-white text-white font-semibold')
                      : (isLight ? 'border-transparent text-neutral-500 hover:text-black' : 'border-transparent text-neutral-400 hover:text-neutral-200')
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Equipo</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
              
              {/* ======================================================== */}
              {/* TAB 1: ADMINISTRAR MUEBLES (CON CAMBIAR PRECIO)          */}
              {/* ======================================================== */}
              {activeTab === 'furniture' && (
                <div className="space-y-4">
                  
                  {/* Top Bar with Search & Actions */}
                  <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0f1015] border-neutral-800'
                  }`}>
                    <div className="flex-1 max-w-sm relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={furnitureSearch}
                        onChange={(e) => setFurnitureSearch(e.target.value)}
                        placeholder="Buscar mueble por nombre, ID Unturned..."
                        className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-500'
                            : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('files')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                            : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-200'
                        }`}
                        title="Subir múltiples archivos desde PC para crear muebles al instante"
                      >
                        <FolderUp className="w-3.5 h-3.5 text-blue-500" />
                        <span>Subir varios desde PC</span>
                      </button>

                      <button
                        onClick={handleOpenAddModal}
                        className={`px-3 py-1.5 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                          isLight
                            ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                            : 'bg-white hover:bg-neutral-200 text-black'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nuevo Mueble</span>
                      </button>
                    </div>
                  </div>

                  {/* Toast for Quick Price Saved */}
                  {priceSavedToast && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Precio actualizado a <strong>${priceSavedToast.price.toFixed(2)} USD</strong> en el catálogo.</span>
                      </div>
                      <span className="text-[10px] text-emerald-500/70">Guardado</span>
                    </div>
                  )}

                  {/* Furniture Grid with Featured "Cambiar Precio" */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredFurniture.map(prod => {
                      const isEditingThisPrice = editingPriceId === prod.id;

                      return (
                        <div
                          key={prod.id}
                          className={`p-3.5 rounded-xl border flex gap-3.5 items-start justify-between transition-all ${
                            isLight
                              ? 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'
                              : 'bg-[#121319] border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="relative w-20 h-18 rounded-lg overflow-hidden bg-black shrink-0 border border-neutral-800 flex items-center justify-center">
                            <img
                              src={prod.gifUrl || prod.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {prod.gifUrl && (
                              <span className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] font-bold px-1 rounded">
                                GIF
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {prod.subcategory}
                              </span>
                              {prod.unturnedIds?.[0] && (
                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                  isLight ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                                }`}>
                                  ID: {prod.unturnedIds[0]}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-semibold truncate">
                              {prod.name}
                            </h4>

                            {/* DESTACADO: CAMBIAR PRECIO (Inline & Quick Actions) */}
                            <div className="pt-1">
                              {isEditingThisPrice ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="relative w-24">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      autoFocus
                                      value={quickPriceValue}
                                      onChange={(e) => setQuickPriceValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveQuickPrice(prod.id);
                                        if (e.key === 'Escape') setEditingPriceId(null);
                                      }}
                                      className={`w-full text-xs pl-5 pr-1 py-1 rounded border font-semibold focus:outline-none ${
                                        isLight
                                          ? 'bg-white border-neutral-400 text-neutral-900'
                                          : 'bg-black border-neutral-700 text-white'
                                      }`}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleSaveQuickPrice(prod.id)}
                                    className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                    title="Guardar precio"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingPriceId(null)}
                                    className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStartQuickPrice(prod)}
                                    className={`px-2 py-0.5 rounded border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                      isLight
                                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-900'
                                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-white'
                                    }`}
                                    title="Hacer clic para Cambiar Precio"
                                  >
                                    <DollarSign className="w-3 h-3 text-emerald-500" />
                                    <span>${prod.price.toFixed(2)} USD</span>
                                    <span className="text-[10px] text-neutral-400 font-normal ml-0.5">(Cambiar)</span>
                                  </button>

                                  {/* Quick +/- $25 step buttons */}
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() => handleQuickStepPrice(prod.id, prod.price, -25)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
                                        isLight ? 'hover:bg-neutral-200 border-neutral-300' : 'hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                                      }`}
                                      title="Bajar $25"
                                    >
                                      -$25
                                    </button>
                                    <button
                                      onClick={() => handleQuickStepPrice(prod.id, prod.price, 25)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
                                        isLight ? 'hover:bg-neutral-200 border-neutral-300' : 'hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                                      }`}
                                      title="Subir $25"
                                    >
                                      +$25
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-750 text-neutral-300 hover:text-white'
                              }`}
                              title="Editar mueble completo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {products.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar "${prod.name}" de la tienda?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-white hover:bg-red-50 border-neutral-300 text-neutral-500 hover:text-red-600'
                                    : 'bg-neutral-900 hover:bg-red-950/40 border-neutral-750 text-neutral-400 hover:text-red-400'
                                }`}
                                title="Eliminar mueble"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: SUBIR ARCHIVOS (GIFs / IMÁGENES & CREAR VARIOS)   */}
              {/* ======================================================== */}
              {activeTab === 'files' && (
                <div className="space-y-5">
                  
                  {/* Hero Uploader Box with Drag-and-Drop */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files) {
                        handleProcessComputerFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
                      isDraggingOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : isLight
                        ? 'border-neutral-300 bg-neutral-50/70 hover:border-neutral-400'
                        : 'border-neutral-800 bg-[#0e1017] hover:border-neutral-700'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleProcessComputerFiles(e.target.files);
                        }
                      }}
                    />

                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    <h3 className="text-sm font-semibold mb-1">
                      Examinar desde mi computadora o arrastrar archivos aquí
                    </h3>

                    <p className={`text-xs max-w-md mx-auto mb-4 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Selecciona una o varias imágenes / GIFs a la vez. Cada archivo se procesará instantáneamente.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingFiles}
                        className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                      >
                        {isProcessingFiles ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Procesando archivos...</span>
                          </>
                        ) : (
                          <>
                            <FolderUp className="w-4 h-4" />
                            <span>Examinar archivos de mi PC</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Option Checkbox: Bulk Furniture Auto-Creation */}
                    <div className={`mt-5 pt-4 border-t max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left ${
                      isLight ? 'border-neutral-200 text-neutral-800' : 'border-neutral-800 text-neutral-200'
                    }`}>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={autoCreateFurniture}
                          onChange={(e) => setAutoCreateFurniture(e.target.checked)}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span>Crear varios muebles instantáneamente (uno por cada imagen)</span>
                      </label>

                      {autoCreateFurniture && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Precio inicial:</span>
                          <span className="font-semibold">$</span>
                          <input
                            type="number"
                            value={bulkDefaultPrice}
                            onChange={(e) => setBulkDefaultPrice(Number(e.target.value) || 0)}
                            className={`w-16 px-1.5 py-0.5 text-xs rounded border focus:outline-none font-semibold ${
                              isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-750 text-white'
                            }`}
                          />
                          <span className="text-[10px] text-neutral-400">USD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bulk Success Alert */}
                  {bulkSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{bulkSuccessMsg}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('furniture')}
                        className="underline font-semibold cursor-pointer"
                      >
                        Ver en Administrar Muebles →
                      </button>
                    </div>
                  )}

                  {/* Uploaded Files Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider">
                          Biblioteca de GIFs e Imágenes ({uploadedMedia.length})
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          Archivos examinados y disponibles para usar en muebles o descargar.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {uploadedMedia.map(item => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            isLight
                              ? 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                              : 'bg-[#121319] border-neutral-800 hover:border-neutral-750'
                          }`}
                        >
                          <div>
                            <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black mb-2 relative border border-neutral-800 flex items-center justify-center">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              <span className={`absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded text-white ${
                                item.type === 'gif' ? 'bg-purple-600' : 'bg-blue-600'
                              }`}>
                                {item.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="text-xs font-semibold truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              {item.sizeFormatted || '120 KB'} · {item.createdAt}
                            </div>
                          </div>

                          <div className={`pt-2 mt-2 border-t flex items-center justify-between gap-1 text-[11px] ${
                            isLight ? 'border-neutral-200' : 'border-neutral-850'
                          }`}>
                            <button
                              onClick={() => {
                                bulkAddProductsFromFiles([{ name: item.name, url: item.url, isGif: item.type === 'gif' }], 350);
                                setActiveTab('furniture');
                              }}
                              className={`py-1 px-2 rounded font-medium transition-colors cursor-pointer text-xs ${
                                isLight ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-200'
                              }`}
                              title="Crear un mueble con esta imagen"
                            >
                              + Crear Mueble
                            </button>

                            <button
                              onClick={() => copyToClipboard(item.url, item.id)}
                              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                isLight ? 'hover:bg-neutral-200 border-neutral-300' : 'hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                              }`}
                              title="Copiar URL"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {uploadedMedia.length > 1 && (
                              <button
                                onClick={() => removeUploadedMedia(item.id)}
                                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                  isLight ? 'hover:bg-red-100 border-neutral-300 text-red-500' : 'hover:bg-red-950/40 border-neutral-800 text-red-400'
                                }`}
                                title="Eliminar archivo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ORDERS MANAGEMENT                                 */}
              {/* ======================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Buscar por ID, Cliente..."
                        className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:bg-white focus:border-neutral-500'
                            : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Estado:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-800'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="Completado">Completados</option>
                        <option value="Descargado">Descargados</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Reembolsado">Reembolsados</option>
                      </select>
                    </div>
                  </div>

                  <div className={`border rounded-xl overflow-hidden ${
                    isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-950'
                  }`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b uppercase text-[10px] font-semibold ${
                        isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-[#0b0c10] border-neutral-800 text-neutral-400'
                      }`}>
                        <tr>
                          <th className="py-2.5 px-3.5">Orden ID</th>
                          <th className="py-2.5 px-3.5">Cliente</th>
                          <th className="py-2.5 px-3.5">Mueble / Objeto</th>
                          <th className="py-2.5 px-3.5">Total</th>
                          <th className="py-2.5 px-3.5">Estado</th>
                          <th className="py-2.5 px-3.5">Licencia</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-neutral-100' : 'divide-neutral-850'}`}>
                        {filteredOrders.map(order => (
                          <tr key={order.id} className={isLight ? 'hover:bg-neutral-50' : 'hover:bg-neutral-900/40'}>
                            <td className="py-2.5 px-3.5 font-semibold">
                              #{order.id}
                              <div className={`text-[10px] font-normal ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>{order.date}</div>
                            </td>
                            <td className="py-2.5 px-3.5">
                              <div className="font-medium">{order.customerName}</div>
                              <div className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>{order.customerEmail}</div>
                            </td>
                            <td className="py-2.5 px-3.5">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="truncate max-w-[160px]">
                                  {it.quantity}x {it.product.name}
                                </div>
                              ))}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                {order.status}
                              </span>
                            </td>
                            <td className={`py-2.5 px-3.5 text-[11px] font-mono select-all ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              {order.licenseKey}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: METRICS                                           */}
              {/* ======================================================== */}
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-4 rounded-xl border ${
                      isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121319] border-neutral-800'
                    }`}>
                      <div className={`flex items-center justify-between text-xs mb-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        <span>Ingresos Totales:</span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-xl font-bold">
                        {formatPrice(totalRevenue)}
                      </div>
                      <span className="text-[11px] text-emerald-500 font-medium">Servidor Único</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${
                      isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121319] border-neutral-800'
                    }`}>
                      <div className={`flex items-center justify-between text-xs mb-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        <span>Ventas Realizadas:</span>
                        <ShoppingBag className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-xl font-bold">
                        {orders.length} pedidos
                      </div>
                      <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Licencias activas</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${
                      isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121319] border-neutral-800'
                    }`}>
                      <div className={`flex items-center justify-between text-xs mb-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        <span>Muebles Activos:</span>
                        <Package className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-xl font-bold">
                        {products.length} muebles
                      </div>
                      <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>En catálogo</span>
                    </div>
                  </div>

                  <div className={`border rounded-xl p-4 ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#121319] border-neutral-800'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Auditoría de Actividad</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {auditLogs.map(log => (
                        <div
                          key={log.id}
                          className={`p-2 rounded border flex items-center justify-between text-xs ${
                            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-medium">{log.staffName}:</span>
                            <span className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>{log.action}</span>
                            <span className={`text-[11px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>({log.target})</span>
                          </div>
                          <span className={`text-[10px] shrink-0 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: STAFF (BM SOLO TAL CUAL SIN MODIFICAR)            */}
              {/* ======================================================== */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {staffSeats.map((seat, index) => (
                      <div
                        key={seat.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isLight
                            ? 'bg-neutral-50 border-neutral-200'
                            : 'bg-[#121319] border-neutral-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              {index === 0 ? 'Director / Owner' : 'Desarrollador'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              seat.isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${seat.isOnline ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
                              {seat.isOnline ? 'En línea' : 'Pausado'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-2.5">
                            <img
                              src={seat.avatar}
                              alt={seat.name}
                              className={`w-11 h-11 rounded-lg object-cover border shadow-xs ${
                                isLight ? 'border-neutral-300' : 'border-neutral-700'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1">
                                <span>{seat.name}</span>
                              </div>
                              <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{seat.role}</div>
                            </div>
                          </div>

                          <p className={`text-[11px] font-light mb-3 line-clamp-2 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {seat.bio}
                          </p>
                        </div>

                        <div className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                          isLight ? 'border-neutral-200' : 'border-neutral-800'
                        }`}>
                          <button
                            onClick={() => switchStaffSeat(seat.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all w-full cursor-pointer ${
                              currentStaff.id === seat.id
                                ? (isLight ? 'bg-neutral-900 text-white' : 'bg-white text-black')
                                : (isLight ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800' : 'bg-neutral-800 hover:bg-neutral-700 text-white')
                            }`}
                          >
                            {currentStaff.id === seat.id ? 'Seleccionado' : 'Operar como este Admin'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD / EDIT FURNITURE (CON EXAMINAR DESDE PC)      */}
        {/* ======================================================== */}
        {(isAddingProduct || editingProduct) && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs select-none"
            onClick={() => {
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
          >
            <div
              className={`relative w-full max-w-2xl sm:max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors select-text ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-900'
                  : 'bg-[#101117] border-neutral-800 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* FIXED MODAL HEADER */}
              <div className={`shrink-0 px-5 sm:px-6 py-4 border-b flex items-center justify-between ${
                isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0b0f] border-neutral-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLight ? 'bg-neutral-200 text-neutral-800' : 'bg-neutral-850 text-neutral-200'
                  }`}>
                    {editingProduct ? <Edit3 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <span>{editingProduct ? `Editar Mueble: ${editingProduct.name}` : 'Crear Nuevo Mueble'}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                        isLight ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        Unturned 3.0
                      </span>
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Completa los 3 apartados para publicar o actualizar el asset en la tienda.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isLight ? 'text-neutral-400 hover:text-black hover:bg-neutral-200/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SCROLLABLE FORM BODY WITH COMFORTABLE & SMOOTH SLIDE BAR */}
              <form
                id="furniture-edit-form"
                onSubmit={handleSaveProduct}
                className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 custom-scrollbar overscroll-contain"
              >
                
                {/* -------------------------------------------------------- */}
                {/* SECCIÓN 1: DATOS PRINCIPALES                             */}
                {/* -------------------------------------------------------- */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isLight ? 'bg-neutral-50/60 border-neutral-200' : 'bg-[#0d0e13] border-neutral-850'
                }`}>
                  <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-bold flex items-center justify-center">1</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Información Principal
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        Nombre del Mueble / Objeto *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Sofá Curvo Nórdico v2"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                            : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        Precio en USD ($) *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            placeholder="350"
                            className={`w-full rounded-lg pl-6 pr-3 py-2 text-xs font-bold focus:outline-none transition-colors ${
                              isLight
                                ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                                : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, price: Math.max(0, formData.price - 25) })}
                          className={`px-2 py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                            isLight ? 'bg-white border-neutral-300 hover:bg-neutral-100' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                          }`}
                          title="Restar $25"
                        >
                          -$25
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, price: formData.price + 25 })}
                          className={`px-2 py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                            isLight ? 'bg-white border-neutral-300 hover:bg-neutral-100' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                          }`}
                          title="Sumar $25"
                        >
                          +$25
                        </button>
                      </div>
                      {/* Popular Price Presets */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>Sugeridos:</span>
                        {[150, 250, 350, 450].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setFormData({ ...formData, price: preset })}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                              formData.price === preset
                                ? (isLight ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-black border-white')
                                : (isLight ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white')
                            }`}
                          >
                            ${preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        Colección / Subcategoría
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        placeholder="Ej. Mobiliario Nórdico Exclusivo"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                            : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* SECCIÓN 2: GALERÍA DE FOTOS Y VISTAS (PC O URL)           */}
                {/* -------------------------------------------------------- */}
                <div className={`p-4 rounded-xl border space-y-4 ${
                  isLight ? 'bg-neutral-50/60 border-neutral-200' : 'bg-[#0d0e13] border-neutral-850'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold flex items-center justify-center">2</span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <span>Galería de Imágenes & Vistas</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500">
                            {formData.mediaGallery.length} {formData.mediaGallery.length === 1 ? 'vista' : 'vistas'}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Primary Action: Select one or multiple images from PC */}
                      <label className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                        isLight
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}>
                        <FolderUp className="w-3.5 h-3.5" />
                        <span>Examinar imágenes de mi PC</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,image/gif"
                          className="hidden"
                          onChange={handleBulkAddModalViews}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleAddMediaItem}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
                          isLight
                            ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                            : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                        }`}
                        title="Agregar un renglón para escribir una URL directa"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Vista por URL</span>
                      </button>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    💡 <strong>Importante:</strong> La <strong className="text-emerald-500">Vista #1</strong> es la <strong>Portada Principal</strong> que los clientes verán en el catálogo de la tienda. Puedes examinar fotos desde tu disco duro o colocar enlaces web directos.
                  </p>

                  {/* Visual Strip of all views with Cover indicator */}
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
                    {formData.mediaGallery.map((item, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`w-28 shrink-0 rounded-xl overflow-hidden border p-1.5 text-left transition-all relative ${
                            isCover
                              ? (isLight ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-emerald-950/20 border-emerald-500/50 ring-2 ring-emerald-500/20')
                              : (isLight ? 'bg-white border-neutral-200' : 'bg-[#0a0b0e] border-neutral-800')
                          }`}
                        >
                          <div className="aspect-[16/10] overflow-hidden rounded-lg bg-black mb-1.5 relative flex items-center justify-center border border-black/20">
                            {item.type === 'video' ? (
                              <Video className="w-4 h-4 text-red-400" />
                            ) : (
                              <img
                                src={item.url || heroImg}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            )}

                            {isCover && (
                              <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>PORTADA</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-semibold truncate px-0.5" title={item.label}>
                            {item.label || (isCover ? 'Foto Portada' : `Vista ${idx + 1}`)}
                          </div>
                          <div className={`text-[9px] px-0.5 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {item.url?.startsWith('data:') ? 'Archivo PC' : 'Enlace web'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clean List of Views (Zero base64 clutter!) */}
                  <div className="space-y-2.5 pt-1">
                    {formData.mediaGallery.map((item, index) => {
                      const isCover = index === 0;
                      const isLocalData = item.url?.startsWith('data:');

                      return (
                        <div
                          key={item.id || index}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center gap-3 ${
                            isCover
                              ? (isLight ? 'bg-white border-emerald-300 shadow-xs' : 'bg-[#0f1218] border-emerald-500/40 shadow-xs')
                              : (isLight ? 'bg-white border-neutral-200 hover:border-neutral-300' : 'bg-[#0e0f14] border-neutral-850 hover:border-neutral-750')
                          }`}
                        >
                          {/* Left: Thumbnail & Badge */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="relative w-14 h-11 rounded-lg bg-black overflow-hidden border border-neutral-800 flex items-center justify-center shrink-0">
                              {item.type === 'video' ? (
                                <Video className="w-4 h-4 text-red-400" />
                              ) : (
                                <img
                                  src={item.url || heroImg}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              )}
                              {isCover && (
                                <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                </div>
                              )}
                            </div>

                            <div className="w-20 shrink-0">
                              <span className={`text-[10px] font-bold block ${isCover ? 'text-emerald-500' : (isLight ? 'text-neutral-600' : 'text-neutral-400')}`}>
                                {isCover ? '★ PORTADA' : `Vista #${index + 1}`}
                              </span>
                              <span className={`text-[9px] block ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {isCover ? 'Principal' : 'Adicional'}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Subtitle and Clean Source */}
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 min-w-0">
                            {/* Subtitle */}
                            <div className="sm:col-span-5">
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => handleUpdateMediaItem(index, { label: e.target.value })}
                                placeholder={isCover ? 'Subtítulo (ej. Vista Frontal / Portada)' : 'Subtítulo (ej. Ángulo Lateral)'}
                                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-medium transition-colors ${
                                  isLight
                                    ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 focus:bg-white focus:border-blue-500'
                                    : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                                }`}
                              />
                            </div>

                            {/* Media File or URL (CLEAN, NO HUGE BASE64 TEXT!) */}
                            <div className="sm:col-span-7 flex items-center gap-1.5 min-w-0">
                              {isLocalData ? (
                                <div className={`flex-1 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs min-w-0 ${
                                  isLight ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                                }`}>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FolderUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span className="text-[11px] font-semibold truncate">
                                      Foto desde tu computadora
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <label className={`text-[10px] font-semibold px-2 py-0.5 rounded border cursor-pointer transition-colors ${
                                      isLight ? 'bg-white hover:bg-neutral-100 border-blue-300 text-blue-700' : 'bg-neutral-900 hover:bg-neutral-800 border-blue-700 text-blue-300'
                                    }`}>
                                      <span>Cambiar</span>
                                      <input
                                        type="file"
                                        accept="image/*,image/gif"
                                        className="hidden"
                                        onChange={(e) => handleBrowseRowImage(index, e)}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateMediaItem(index, { url: '' })}
                                      className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                                        isLight ? 'text-neutral-500 hover:text-black' : 'text-neutral-400 hover:text-white'
                                      }`}
                                      title="Usar un enlace URL web en su lugar"
                                    >
                                      Pegar URL
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                  <input
                                    type="text"
                                    value={item.url}
                                    onChange={(e) => handleUpdateMediaItem(index, {
                                      url: e.target.value,
                                      previewUrl: item.type === 'video' ? undefined : e.target.value
                                    })}
                                    placeholder="https://... enlace de imagen o GIF"
                                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition-colors truncate ${
                                      isLight
                                        ? 'bg-neutral-50 border border-neutral-300 text-neutral-800 focus:bg-white focus:border-blue-500'
                                        : 'bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-blue-500'
                                    }`}
                                  />

                                  <label
                                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                                      isLight
                                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-200'
                                    }`}
                                    title="Elegir foto desde tu computadora"
                                  >
                                    <FolderUp className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="hidden sm:inline text-[11px]">Examinar PC</span>
                                    <input
                                      type="file"
                                      accept="image/*,image/gif"
                                      className="hidden"
                                      onChange={(e) => handleBrowseRowImage(index, e)}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Type dropdown & Delete button */}
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            <select
                              value={item.type}
                              onChange={(e) => handleUpdateMediaItem(index, { type: e.target.value as any })}
                              className={`text-[11px] px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                                isLight ? 'bg-neutral-50 border-neutral-300 text-neutral-800' : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                              }`}
                            >
                              <option value="image">Imagen</option>
                              <option value="gif">GIF</option>
                              <option value="video">YouTube</option>
                            </select>

                            {formData.mediaGallery.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(index)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  isLight
                                    ? 'hover:bg-red-50 text-neutral-400 hover:text-red-600 border-neutral-300'
                                    : 'hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border-neutral-800'
                                }`}
                                title="Eliminar vista"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* SECCIÓN 3: CONFIGURACIÓN TÉCNICA (UNTURNED & DESCARGA)   */}
                {/* -------------------------------------------------------- */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isLight ? 'bg-neutral-50/60 border-neutral-200' : 'bg-[#0d0e13] border-neutral-850'
                }`}>
                  <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 text-[11px] font-bold flex items-center justify-center">3</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Datos de Servidor Unturned (Opcional)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        IDs de Unturned (separados por coma)
                      </label>
                      <input
                        type="text"
                        value={formData.unturnedIds}
                        onChange={(e) => setFormData({ ...formData, unturnedIds: e.target.value })}
                        placeholder="Ej. 60201, 60202"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                            : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        Nombre archivo (.unitypackage)
                      </label>
                      <input
                        type="text"
                        value={formData.downloadFileName}
                        onChange={(e) => setFormData({ ...formData, downloadFileName: e.target.value })}
                        placeholder="SBT_Mueble_v1.unitypackage"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                            : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        Descripción Breve del Mueble
                      </label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mobiliario de Unturned 3.0 con colisiones optimizadas y shaders calibrados..."
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors resize-none ${
                          isLight
                            ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-blue-600'
                            : 'bg-neutral-950 border border-neutral-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

              </form>

              {/* FIXED MODAL FOOTER - ALWAYS ACCESSIBLE */}
              <div className={`shrink-0 px-5 sm:px-6 py-3.5 border-t flex items-center justify-between gap-3 ${
                isLight ? 'bg-neutral-50/95 border-neutral-200' : 'bg-[#090a0d]/95 border-neutral-800'
              }`}>
                <div className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {formData.mediaGallery.length} {formData.mediaGallery.length === 1 ? 'foto configurada' : 'fotos configuradas'}
                  {formData.price > 0 && <span> · <strong className="text-emerald-500">${formData.price.toFixed(2)} USD</strong></span>}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      isLight ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-700' : 'border-neutral-800 hover:bg-neutral-850 text-neutral-300'
                    }`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    form="furniture-edit-form"
                    className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-md flex items-center gap-1.5 ${
                      isLight
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                        : 'bg-white hover:bg-neutral-200 text-black'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingProduct ? 'Guardar Cambios' : 'Crear Mueble'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
