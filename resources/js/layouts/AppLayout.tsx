import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { CartDrawer, KsToast } from '../components/CartDrawer';

export default function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const h = () => setCartOpen(true);
    window.addEventListener('ks:open-cart', h);
    return () => window.removeEventListener('ks:open-cart', h);
  }, []);

  return (
    <CartProvider>
      <Outlet />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <KsToast onOpenCart={() => setCartOpen(true)} />
    </CartProvider>
  );
}
