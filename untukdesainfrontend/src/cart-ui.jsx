/* global React, window */
/* ============================================
   CART UI — CartButton, UserMenu, CartDrawer, Toast
   Consumed by Nav (components-1.jsx). Talks to
   window.KaspaCart / KaspaSession and listens to
   the ks:* CustomEvents for cross-root sync.
   ============================================ */
const { useState: useCUState, useEffect: useCUEffect, useRef: useCURef } = React;

const KCartIcon = {
  Bag: (p) => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  X: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  ChevDown: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  Grid: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Receipt: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>,
  Ticket: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><line x1="13" y1="7" x2="13" y2="17" strokeDasharray="2 2"/></svg>,
  Settings: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout: (p) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Crown: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M2 7l4 4 6-7 6 7 4-4-2 12H4L2 7z"/></svg>,
};

/* ---- hooks ---- */
function useCart() {
  const [items, setItems] = useCUState(() => window.KaspaCart.items());
  useCUEffect(() => {
    const h = () => setItems(window.KaspaCart.items());
    window.addEventListener("ks:cart", h);
    return () => window.removeEventListener("ks:cart", h);
  }, []);
  return items;
}
function useSession() {
  const [user, setUser] = useCUState(() => window.KaspaSession.user());
  useCUEffect(() => {
    const h = () => setUser(window.KaspaSession.user());
    window.addEventListener("ks:session", h);
    return () => window.removeEventListener("ks:session", h);
  }, []);
  return user;
}

/* ---- Cart button (nav) ---- */
function CartButton({ onOpen }) {
  const items = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <button className="nav-cart" onClick={onOpen} aria-label="Keranjang">
      <KCartIcon.Bag />
      {count > 0 && <span className="nav-cart-badge">{count}</span>}
    </button>
  );
}

/* ---- User menu (nav) ---- */
function UserMenu() {
  const user = useSession();
  const [open, setOpen] = useCUState(false);
  const ref = useCURef(null);
  useCUEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) {
    return (
      <>
        <a className="btn btn-ghost" href="#/auth">Masuk</a>
        <a className="btn btn-primary" href="#/auth">Daftar <Icon.Arrow /></a>
      </>
    );
  }

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const activeDisc = (user.discounts || []).filter(d => d.status === "active").length;

  return (
    <div className="nav-user" ref={ref}>
      <button className="nav-user-btn" onClick={() => setOpen(!open)}>
        <span className="nav-user-avatar">{initials}</span>
        <span className="nav-user-name">{user.name.split(" ")[0]}</span>
        <KCartIcon.ChevDown />
      </button>
      <div className={`nav-menu ${open ? "open" : ""}`}>
        <div className="nav-menu-head">
          <span className="av">{initials}</span>
          <div>
            <div className="nm">{user.name}</div>
            <div className="em">{user.email}</div>
            <div className="nav-menu-tier"><KCartIcon.Crown /> Member {user.member.tier}</div>
          </div>
        </div>
        <a className="nav-menu-item" href="#/dashboard" onClick={() => setOpen(false)}>
          <KCartIcon.Grid /> Dashboard
        </a>
        <a className="nav-menu-item" href="#/dashboard?tab=orders" onClick={() => setOpen(false)}>
          <KCartIcon.Receipt /> Pesanan Saya
        </a>
        <a className="nav-menu-item" href="#/dashboard?tab=vouchers" onClick={() => setOpen(false)}>
          <KCartIcon.Ticket /> Diskon &amp; Voucher
          {activeDisc > 0 && <span className="badge">{activeDisc}</span>}
        </a>
        <a className="nav-menu-item" href="#/dashboard?tab=settings" onClick={() => setOpen(false)}>
          <KCartIcon.Settings /> Pengaturan
        </a>
        <div className="nav-menu-sep"></div>
        <button
          className="nav-menu-item danger"
          onClick={() => { window.KaspaSession.logout(); setOpen(false); window.location.href = "#/home"; }}
        >
          <KCartIcon.Logout /> Keluar
        </button>
      </div>
    </div>
  );
}

/* ---- Cart line ---- */
function CartLine({ item }) {
  const sub = item.price * item.qty;
  const hasImg = !!item.product.img;
  return (
    <div className="cart-item">
      <div
        className={`cart-item-img ${hasImg ? "" : "ph"}`}
        style={hasImg ? { backgroundImage: `url(${item.product.img})` } : null}
      ></div>
      <div className="cart-item-main">
        <div className="cart-item-cat">{item.product.cat}</div>
        <div className="cart-item-title">{item.product.title}</div>
        <div className="cart-item-var">
          {item.variant.name}{item.variant.unit ? ` · /${item.variant.unit}` : ""}
        </div>
        <div className="cart-item-row">
          <div className="cart-qty">
            <button onClick={() => window.KaspaCart.setQty(item.uid, item.qty - 1)} aria-label="Kurangi">−</button>
            <span>{item.qty}</span>
            <button onClick={() => window.KaspaCart.setQty(item.uid, item.qty + 1)} aria-label="Tambah">+</button>
          </div>
          <div className="cart-item-price">
            {item.price === 0 ? "Gratis" : window.ksRp(sub)}
          </div>
        </div>
        <button className="cart-item-remove" onClick={() => window.KaspaCart.remove(item.uid)}>
          <KCartIcon.Trash /> Hapus
        </button>
      </div>
    </div>
  );
}

/* ---- Cart drawer ---- */
function CartDrawer({ open, onClose }) {
  const items = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  useCUEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const goCheckout = () => { onClose(); window.location.href = "#/checkout"; };

  return (
    <>
      <div className={`cart-overlay ${open ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="cart-head">
          <h3>Keranjang <em>Anda</em>{count > 0 && <span className="count">{count} item</span>}</h3>
          <button className="cart-close" onClick={onClose} aria-label="Tutup"><KCartIcon.X /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-body">
            <div className="cart-empty">
              <div className="cart-empty-ic"><KCartIcon.Bag /></div>
              <h4>Keranjang masih kosong</h4>
              <p>Tambahkan ruang kerja, menu kafe, atau layanan bisnis untuk mulai memesan.</p>
              <a className="btn btn-primary" href="#/coworking" onClick={onClose}>Jelajahi Produk <Icon.Arrow /></a>
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
                <span>{window.ksRp(subtotal)}</span>
              </div>
              <div className="cart-foot-total">
                <span className="l">Total</span>
                <span className="v">{window.ksRp(subtotal)}</span>
              </div>
              <button className="btn btn-primary" onClick={goCheckout}>
                Lanjut ke Checkout <Icon.Arrow />
              </button>
              <button className="cart-cont" onClick={onClose}>Lanjut belanja</button>
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

/* ---- Toast ---- */
function KsToast({ onOpenCart }) {
  const [toasts, setToasts] = useCUState([]);
  useCUEffect(() => {
    const h = (e) => {
      const line = e.detail;
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, title: line.product.title }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
    };
    window.addEventListener("ks:cart-add", h);
    return () => window.removeEventListener("ks:cart-add", h);
  }, []);
  if (!toasts.length) return null;
  return (
    <div className="ks-toast-wrap">
      {toasts.map(t => (
        <div className="ks-toast" key={t.id}>
          <span className="ic"><KCartIcon.Check /></span>
          <span><strong>Ditambahkan</strong> ke keranjang</span>
          <button onClick={onOpenCart}>Lihat</button>
        </div>
      ))}
    </div>
  );
}

window.CartButton = CartButton;
window.UserMenu = UserMenu;
window.CartDrawer = CartDrawer;
window.KsToast = KsToast;
window.KCartIcon = KCartIcon;
window.useKsSession = useSession;
window.useKsCart = useCart;
window.openCart = () => { try { window.dispatchEvent(new CustomEvent("ks:open-cart")); } catch (e) {} };
