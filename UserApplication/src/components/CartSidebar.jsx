import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, ChevronDown, ChevronUp, Mail, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const CartSidebar = () => {
  const { cart, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { isAuthenticated, token, email: authEmail } = useAuth();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState({});
  const [email, setEmail] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated && authEmail) {
      setEmail(authEmail);
    }
  }, [isAuthenticated, authEmail]);

  const toggleExpand = (cartId) => {
    setExpandedItems(prev => ({
      ...prev,
      [cartId]: !prev[cartId]
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price || 0), 0);

  const handlePurchase = async () => {
    if (!email && !isAuthenticated) {
      setError("Please enter your email address.");
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      // 1. Backend Purchase (for database record and order ID)
      const response = await fetch('http://127.0.0.1:8000/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: email || "authenticated_user@example.com",
          items: cart.map(item => ({
            title: item.title,
            price: item.price || 0,
            description: item.description
          })),
          total: total
        })
      });

      const purchaseData = await response.json();

      if (response.ok) {
        setPurchaseSuccess(true);
        clearCart();
        setTimeout(() => {
          setIsCartOpen(false);
          setPurchaseSuccess(false);
          setEmail('');
        }, 3000);
      } else {
        setError(purchaseData.detail || "Failed to complete purchase.");
      }
    } catch (err) {
      console.error("Purchase Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col border-l-4 border-black"
          >
            {/* Header */}
            <div className="p-6 border-b-4 border-black flex items-center justify-between bg-black text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} />
                <h2 className="unna-bold text-2xl uppercase tracking-widest">{t('cart.title', 'Your Cart')}</h2>
                <span className="bg-white text-black px-2 py-0.5 text-xs font-black rounded-full">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {purchaseSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-black text-white flex items-center justify-center rounded-none animate-bounce">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="unna-bold text-3xl">{t('cart.thank_you', 'Thank You!')}</h3>
                  <p className="unna text-2xl text-black font-bold uppercase tracking-tight">
                    Email has been sent successfully!
                  </p>
                  <p className="unna text-lg text-slate-600 leading-relaxed">
                    {t('cart.success_msg', 'Your purchase is confirmed. A receipt has been sent to your email.')}
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingCart size={64} className="mb-4" />
                  <p className="unna text-xl italic">{t('cart.empty', 'Your cart is empty.')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="border-2 border-black overflow-hidden bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
                      onClick={() => toggleExpand(item.cartId)}
                    >
                      <div className="flex-1">
                        <h4 className="font-black uppercase tracking-tight text-sm line-clamp-1">{item.title}</h4>
                        <p className="unna text-lg font-bold">${(item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.cartId);
                          }}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedItems[item.cartId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedItems[item.cartId] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-black bg-white"
                        >
                          <div className="p-4 text-sm unna text-slate-600 leading-relaxed">
                            {item.description || t('cart.no_description', 'No description available for this event.')}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {!purchaseSuccess && cart.length > 0 && (
              <div className="p-6 border-t-4 border-black bg-white space-y-6">
                <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t('cart.total', 'Total Cost')}</span>
                  <span className="unna text-4xl font-black">${total.toFixed(2)}</span>
                </div>

                {!isAuthenticated && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('cart.email_label', 'Enter Email for Confirmation')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-black focus:bg-white outline-none transition-all unna text-lg font-bold"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-tight animate-pulse">{error}</p>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className={`w-full py-5 bg-black text-white unna-bold text-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-black border-4 border-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPurchasing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Confirmation Email...</span>
                    </div>
                  ) : (
                    <>
                      {t('cart.purchase', 'Complete Purchase')} <CreditCard size={24} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
