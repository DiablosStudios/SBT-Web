/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { TeamSection } from './components/TeamSection';
import { ProductPageView } from './components/ProductPageView';
import { CheckoutModal } from './components/CheckoutModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPortal } from './components/AdminPortal';
import { DiscordAuthModal } from './components/DiscordAuthModal';
import { Footer } from './components/Footer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const {
    currentView,
    selectedProduct,
    setSelectedProduct,
    setCurrentView,
    theme,
    isAuthorizedAdmin,
    setIsAdminOpen,
    openDiscordLoginFlow
  } = useStore();

  const isLight = theme === 'light';

  // Listen for #admin or /admin in URL
  React.useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        if (isAuthorizedAdmin) {
          setIsAdminOpen(true);
        } else {
          openDiscordLoginFlow();
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAuthorizedAdmin, setIsAdminOpen, openDiscordLoginFlow]);

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
      isLight
        ? 'bg-[#f6f8fb] text-[#0f172a] selection:bg-neutral-300 selection:text-black'
        : 'bg-[#08090d] text-[#e5e7eb] selection:bg-neutral-800 selection:text-white'
    }`}>
      {/* Intro Welcome Screen on load */}
      <WelcomeScreen />

      <Navbar />

      {/* When entering an item for sale, opens as a completely distinct, standalone page */}
      {currentView === 'product' && selectedProduct ? (
        <ProductPageView
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            setCurrentView('store');
          }}
        />
      ) : (
        <main className="flex-1">
          <Hero />
          <CatalogSection />
          <TeamSection />
        </main>
      )}

      <Footer />

      {/* Interactive Modals & Slide-overs */}
      <CheckoutModal />
      <CartDrawer />
      <AdminPortal />
      <DiscordAuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}
