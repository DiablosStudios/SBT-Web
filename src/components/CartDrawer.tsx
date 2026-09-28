import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Lock, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    formatPrice,
    setIsCheckoutOpen,
    theme
  } = useStore();

  const isLight = theme === 'light';

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md border-l shadow-2xl flex flex-col justify-between transition-colors ${
          isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#0f1015] border-neutral-800 text-neutral-200'
        }`}>
          
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0b0c10] border-neutral-800'
          }`}>
            <div className="flex items-center gap-2">
              <ShoppingBag className={`w-5 h-5 ${isLight ? 'text-neutral-900' : 'text-white'}`} />
              <h2 className={`text-sm uppercase font-bold tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Tu Carrito de Assets ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className={`p-1 rounded transition-colors ${
                isLight ? 'text-neutral-400 hover:text-black hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cart.length > 0 ? (
              <>
                <div className={`flex justify-between items-center text-xs pb-2 border-b ${
                  isLight ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800/80 text-neutral-400'
                }`}>
                  <span>Productos seleccionados</span>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Vaciar todo
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className={`p-3 border rounded-lg flex gap-3 items-center text-xs ${
                        isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/80 border-neutral-800'
                      }`}
                    >
                      <img
                        src={item.product.gifUrl || item.product.image}
                        alt={item.product.name}
                        className={`w-16 h-14 object-cover rounded border shrink-0 ${
                          isLight ? 'border-neutral-200' : 'border-neutral-800'
                        }`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-semibold truncate ${
                          isLight ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {item.product.name}
                        </h4>
                        <div className={`text-[11px] mb-1 ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>
                          {item.product.subcategory}
                        </div>
                        <div className={`text-xs font-semibold ${
                          isLight ? 'text-neutral-900' : 'text-white'
                        }`}>
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={`flex items-center border rounded ${
                          isLight ? 'border-neutral-300 bg-white' : 'border-neutral-800 bg-neutral-900'
                        }`}>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className={`p-1 transition-colors ${
                              isLight ? 'hover:bg-neutral-100 text-neutral-700' : 'hover:bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`px-2 text-xs font-medium ${
                            isLight ? 'text-neutral-900' : 'text-white'
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className={`p-1 transition-colors ${
                              isLight ? 'hover:bg-neutral-100 text-neutral-700' : 'hover:bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <ShoppingBag className={`w-12 h-12 mb-3 ${isLight ? 'text-neutral-300' : 'text-neutral-700'}`} />
                <h3 className={`text-base font-medium mb-1 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Tu carrito está vacío
                </h3>
                <p className={`text-xs mb-6 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Explora las colecciones de Furniture, Diseño UI u Objetos RP para Unturned.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className={`px-4 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                    isLight ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  Ver Catálogos
                </button>
              </div>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className={`p-6 border-t space-y-4 text-xs ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0b0c10] border-neutral-800'
            }`}>
              <div className="space-y-2">
                <div className={`flex justify-between ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  <span>Entrega Digital Inmediata:</span>
                  <span className="text-emerald-500">Gratis ($0.00)</span>
                </div>
                <div className={`flex justify-between text-base font-bold pt-2 border-t ${
                  isLight ? 'border-neutral-200 text-neutral-900' : 'border-neutral-800 text-white'
                }`}>
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className={`w-full py-3.5 text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isLight ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : 'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Pagar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className={`flex items-center justify-center gap-2 text-[10px] text-center ${
                isLight ? 'text-neutral-500' : 'text-neutral-500'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Descarga automática de .unitypackage y clave digital</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
