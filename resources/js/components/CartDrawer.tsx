import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '../contexts/CartContext';
import { Icon } from './icons';

/* ---- Icons ---- */
type SvgProps = React.SVGProps<SVGSVGElement>;
function BagIcon(p: SvgProps) { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>; }
function XIcon(p: SvgProps) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function TrashIcon(p: SvgProps) { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>; }

function fmt(n: number) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }

function CartLine({ item }: { item: CartItem }) {
  const { remove, setQty } = useCart();
  const sub = item.price * item.qty;
  return (
    <div className="cart-item">
      <div
        className={`cart-item-img${item.product.img ? '' : ' ph'}`}
        style={item.product.img ? { backgroundImage: `url(${item.product.img})` } : undefined}
      />
      <div className="cart-item-main">
        <div className="cart-item-cat">{item.product.cat}</div>
        <div className="cart-item-title">{item.product.title}</div>
        <div className="cart-item-var">
          {item.variant.name}{item.variant.unit ? ` · /${item.variant.unit}` : ''}
        </div>
        <div className="cart-item-row">
          <div className="cart-qty">
            <button type="button" onClick={() => setQty(item.uid, item.qty - 1)} aria-label="Kurangi">−</button>
            <span>{item.qty}</span>
            <button type="button" onClick={() => setQty(item.uid, item.qty + 1)} aria-label="Tambah">+</button>
          </div>
          <div className="cart-item-price">{item.price === 0 ? 'Gratis' : fmt(sub)}</div>
        </div>
        <button type="button" className="cart-item-remove" onClick={() => remove(item.uid)}>
          <TrashIcon /> Hapus
        </button>
      </div>
    </div>
  );
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, count, subtotal } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const goCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="cart-head">
          <h3>
            Keranjang <em>Anda</em>
            {count > 0 && <span className="count">{count} item</span>}
          </h3>
          <button type="button" className="cart-close" onClick={onClose} aria-label="Tutup">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-body">
            <div className="cart-empty">
              <div className="cart-empty-ic"><BagIcon /></div>
              <h4>Keranjang masih kosong</h4>
              <p>Tambahkan ruang kerja, menu kafe, atau layanan bisnis untuk mulai memesan.</p>
              <button type="button" className="btn btn-primary" onClick={() => { onClose(); navigate('/coworking'); }}>
                Jelajahi Produk <Icon.Arrow />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-body">
              {items.map(it => <CartLine key={it.uid} item={it} />)}
            </div>
            <div className="cart-foot">
              <div className="cart-foot-row">
                <span>Subtotal ({count} item)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="cart-foot-total">
                <span className="l">Total</span>
                <span className="v">{fmt(subtotal)}</span>
              </div>
              <button type="button" className="btn btn-primary" onClick={goCheckout}>
                Lanjut ke Checkout <Icon.Arrow />
              </button>
              <button type="button" className="cart-cont" onClick={onClose}>Lanjut belanja</button>
              <div className="cart-foot-note">
                Pajak, biaya admin & diskon dihitung saat checkout. Bisa bayar sebagian (DP) untuk layanan tertentu.
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ---- Toast notification ---- */
function CheckIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>; }

interface ToastItem { id: number; title: string; }

export function KsToast({ onOpenCart }: { onOpenCart: () => void }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const h = (e: Event) => {
      const line = (e as CustomEvent).detail as { product: { title: string } };
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, title: line.product.title }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
    };
    window.addEventListener('ks:cart-add', h);
    return () => window.removeEventListener('ks:cart-add', h);
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="ks-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="ks-toast">
          <span className="ic"><CheckIcon /></span>
          <span><strong>Ditambahkan</strong> ke keranjang</span>
          <button type="button" onClick={onOpenCart}>Lihat</button>
        </div>
      ))}
    </div>
  );
}
