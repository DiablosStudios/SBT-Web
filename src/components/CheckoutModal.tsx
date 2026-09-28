import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Tag,
  Zap,
  Terminal
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutProduct,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setCheckoutProduct,
    cart,
    cartTotal,
    clearCart,
    formatPrice,
    processOrder,
    theme
  } = useStore();

  const isLight = theme === 'light';

  // Buyer form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [steamId, setSteamId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Flow states: 'form' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isCheckoutOpen) return null;

  // Items to checkout: either single direct buy OR entire cart
  const checkoutItems = checkoutProduct
    ? [{ product: checkoutProduct, quantity: 1 }]
    : cart;

  const baseTotal = checkoutProduct ? checkoutProduct.price : cartTotal;
  const discountAmount = (baseTotal * discountPercent) / 100;
  const totalToPay = Math.max(0, baseTotal - discountAmount);
  const itemsCount = checkoutItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'SBT2026' || clean === 'BLUEPORTAL' || clean === 'UNTURNED') {
      setDiscountPercent(15);
      setCouponMsg({ text: 'Cupón aplicado: 15% de descuento', isError: false });
    } else {
      setCouponMsg({ text: 'Código inválido o caducado', isError: true });
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Por favor introduce tu nombre o nickname.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMsg('Por favor introduce un correo electrónico válido para recibir los archivos.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        setErrorMsg('Por favor completa todos los campos de la tarjeta.');
        return;
      }
    }

    setStep('processing');

    setTimeout(async () => {
      try {
        const order = await processOrder({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          steamIdOrDiscord: steamId.trim() || 'No especificado',
          paymentMethod,
          directProduct: checkoutProduct
        });

        setCompletedOrder(order);
        setStep('success');

        if (!checkoutProduct) {
          clearCart();
        }
      } catch {
        setErrorMsg('Error al procesar el pago.');
        setStep('form');
      }
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCheckoutProduct(null);
    setStep('form');
    setErrorMsg(null);
    setCouponMsg(null);
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadAssetPackage = () => {
    const fileName = checkoutProduct?.downloadFileName || 'SBT_Furnture_Minimalista_v3.unitypackage';
    const fakeContent = `SBT Studios - Paquete de Assets Unturned\nLicencia: ${completedOrder?.licenseKey}\nCliente: ${completedOrder?.customerName}\nEstado: Verificado para Servidor`;
    const blob = new Blob([fakeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#0f1015] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0a0b0e]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs uppercase tracking-wider text-white font-semibold">
              Sistema de Pagos Automatizado · SBT Studios
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHECKOUT FORM */}
        {step === 'form' && (
          <form onSubmit={handleStartPayment} className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Customer details & payment method */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Buyer Information */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2 font-medium">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Información de Entrega Digital</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1">
                        Nombre o Nickname de Administrador *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej. Benjamin (Owner)"
                        className="w-full bg-[#090a0d] border border-neutral-800 px-3 py-2 text-white rounded focus:border-neutral-500 focus:outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">
                        Correo Electrónico (para recibir la descarga y clave) *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="tu-correo@servidor.com"
                        className="w-full bg-[#090a0d] border border-neutral-800 px-3 py-2 text-white rounded focus:border-neutral-500 focus:outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">
                        Steam ID o Discord (Opcional - para whitelist de servidor)
                      </label>
                      <input
                        type="text"
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        placeholder="Ej. 76561198083921094 o TuUsuario#0001"
                        className="w-full bg-[#090a0d] border border-neutral-800 px-3 py-2 text-white rounded focus:border-neutral-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Selector */}
                <div className="pt-2">
                  <div className="text-xs uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2 font-medium">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Método de Pago Automatizado</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'card', name: 'Tarjeta', icon: CreditCard, subtitle: 'Stripe' },
                      { id: 'paypal', name: 'PayPal', icon: ShieldCheck, subtitle: 'Express' },
                      { id: 'crypto', name: 'Cripto', icon: Lock, subtitle: 'USDT/BTC' },
                      { id: 'steam_wallet', name: 'Steam Pay', icon: Terminal, subtitle: 'Wallet' },
                    ].map(method => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`p-3 rounded border text-left transition-all cursor-pointer ${
                          paymentMethod === method.id
                            ? 'bg-neutral-800 border-white text-white'
                            : 'bg-[#090a0d] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <method.icon className="w-4 h-4 mb-1.5 text-neutral-200" />
                        <div className="text-xs font-semibold">{method.name}</div>
                        <div className="text-[10px] text-neutral-500">{method.subtitle}</div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-3 p-3.5 bg-[#090a0d] border border-neutral-800 rounded space-y-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Número de Tarjeta</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 •••• •••• 4242"
                          className="w-full bg-[#121318] border border-neutral-800 px-3 py-1.5 text-white rounded text-xs focus:outline-none focus:border-neutral-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Vencimiento</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / AA"
                            className="w-full bg-[#121318] border border-neutral-800 px-3 py-1.5 text-white rounded text-xs focus:outline-none focus:border-neutral-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">CVC / CWW</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="w-full bg-[#121318] border border-neutral-800 px-3 py-1.5 text-white rounded text-xs focus:outline-none focus:border-neutral-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="mt-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded text-xs text-neutral-300 flex items-center justify-between">
                      <span>Conexión express PayPal autorizada.</span>
                      <span className="text-emerald-400 text-[10px]">Instantáneo</span>
                    </div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <div className="mt-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded text-xs text-neutral-300 space-y-1">
                      <div className="text-[10px] text-neutral-500 uppercase">Red USDT (TRC-20 / ERC-20)</div>
                      <div className="text-neutral-200 select-all text-xs truncate">
                        TX9w8sLqZp3M... (Confirmación en 1 bloque)
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'steam_wallet' && (
                    <div className="mt-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded text-xs text-neutral-300 flex items-center justify-between">
                      <span>Steam OpenID Web Session activa.</span>
                      <span className="text-emerald-400 text-[10px]">Vinculado</span>
                    </div>
                  )}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Código de descuento (Ej. SBT2026)"
                        className="w-full bg-[#090a0d] border border-neutral-800 pl-8 pr-3 py-2 text-xs text-white rounded focus:border-neutral-500 focus:outline-none uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponMsg && (
                    <div className={`mt-1.5 text-xs ${couponMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                      {couponMsg.text}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary Box */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#08090c] border border-neutral-800/90 p-5 rounded-lg">
                <div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 pb-3 border-b border-neutral-800 flex justify-between items-center font-medium">
                    <span>Resumen del Pedido</span>
                    <span className="text-neutral-500 text-[11px]">{itemsCount} item(s)</span>
                  </div>

                  {/* Items List */}
                  <div className="py-4 space-y-3">
                    {checkoutProduct ? (
                      <div className="flex gap-3 items-center">
                        <img
                          src={checkoutProduct.image}
                          alt={checkoutProduct.name}
                          className="w-16 h-12 object-cover rounded border border-neutral-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-white text-xs font-medium truncate">
                            {checkoutProduct.name}
                          </h5>
                          <div className="text-[10px] text-neutral-500 truncate">
                            {checkoutProduct.subcategory}
                          </div>
                          <div className="text-white text-xs font-semibold mt-0.5">
                            {formatPrice(checkoutProduct.price)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product.id} className="flex gap-3 items-center">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-11 object-cover rounded border border-neutral-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white text-xs font-medium truncate">
                              {item.product.name}
                            </h5>
                            <div className="text-[10px] text-neutral-500">
                              Cant: {item.quantity} · {formatPrice(item.product.price)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal:</span>
                      <span>{formatPrice(baseTotal)}</span>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Descuento ({discountPercent}%):</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-400">
                      <span>Entrega Digital Inmediata:</span>
                      <span className="text-emerald-400">Gratis (3 seg)</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-neutral-800 text-white">
                      <span className="font-semibold">Total a Pagar:</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {formatPrice(totalToPay)}
                      </span>
                    </div>
                  </div>

                  {/* Trust list */}
                  <div className="mt-4 p-3 bg-neutral-900/60 border border-neutral-800 rounded text-xs text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Licencia para tu servidor de Unturned incluida</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Descarga automática al confirmar el pago</span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-5 mt-4 border-t border-neutral-800">
                  <button
                    type="submit"
                    className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirmar y Pagar {formatPrice(totalToPay)}</span>
                  </button>
                  <p className="text-[10px] text-neutral-500 text-center mt-2">
                    Procesamiento encriptado de 256 bits. Licencia de por vida para tu servidor.
                  </p>
                </div>

              </div>

            </div>
          </form>
        )}

        {/* STEP 2: PROCESSING SIMULATION */}
        {step === 'processing' && (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
            <h4 className="text-sm font-semibold text-white">
              Verificando pasarela de pago...
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              Estamos validando la transacción y generando tu clave de licencia de servidor única.
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS & DOWNLOAD SCREEN */}
        {step === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">
                  ¡Pago confirmado con éxito!
                </h3>
                <p className="text-xs text-neutral-300">
                  Orden #{completedOrder.id} registrada a nombre de {completedOrder.customerName}.
                </p>
              </div>
            </div>

            {/* License Key Box */}
            <div className="p-4 bg-[#090a0d] border border-neutral-800 rounded-lg space-y-2">
              <div className="text-xs text-neutral-400 flex justify-between items-center">
                <span>Clave de licencia para tu servidor:</span>
                <span className="text-emerald-400 font-medium">Activa</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white">
                <span className="text-neutral-200 font-medium select-all">
                  {completedOrder.licenseKey}
                </span>
                <button
                  onClick={() => copyLicenseKey(completedOrder.licenseKey)}
                  className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instant Download Button */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadAssetPackage}
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar paquete de assets (.unitypackage)</span>
              </button>

              <p className="text-xs text-neutral-400 text-center">
                Los datos y enlaces de la orden fueron enviados a <strong>{completedOrder.customerEmail}</strong>.
              </p>
            </div>

            {/* Items summary */}
            <div className="p-3.5 bg-[#090a0d] border border-neutral-800/80 rounded-lg text-xs text-neutral-400 space-y-1.5">
              <div className="text-white font-medium mb-1">Archivos incluidos:</div>
              {completedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>• {item.product.name}</span>
                  <span className="text-neutral-400">{item.product.downloadFileName}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
