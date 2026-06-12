/* global window, localStorage */
/* ============================================
   KASPA STORE — Cart + Session (client-side only)
   Exposes window.KaspaCart, window.KaspaSession,
   window.cartAdd(). Persists to localStorage and
   broadcasts CustomEvents so any page (each rendered
   in its own React root) can stay in sync:
     "ks:cart"      — cart contents changed
     "ks:cart-add"  — an item was just added (detail = line)
     "ks:session"   — login state / user data changed
   ============================================ */
(function () {
  const CART_KEY = "ks_cart_v1";
  const SESSION_KEY = "ks_session_v1";
  const USER_KEY = "ks_user_data_v1";

  function read(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function emit(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch (e) {}
  }
  const rp = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

  /* ============ CART ============ */
  const KaspaCart = {
    items() { return read(CART_KEY, []); },
    count() { return this.items().reduce((n, i) => n + i.qty, 0); },
    subtotal() { return this.items().reduce((s, i) => s + i.price * i.qty, 0); },
    adminFee() { return this.items().reduce((s, i) => s + (i.adminFee || 0), 0); },
    save(items) { write(CART_KEY, items); emit("ks:cart", { items }); },
    add(line) {
      const items = this.items();
      const key = JSON.stringify(line.descriptor) + "|" + line.variant.id;
      const found = items.find(i => (JSON.stringify(i.descriptor) + "|" + i.variant.id) === key);
      if (found) { found.qty += line.qty || 1; }
      else { items.push({ uid: "L" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...line, qty: line.qty || 1 }); }
      this.save(items);
      return found || items[items.length - 1];
    },
    setQty(uid, qty) {
      const items = this.items();
      const it = items.find(i => i.uid === uid);
      if (it) { it.qty = Math.max(1, qty); this.save(items); }
    },
    remove(uid) { this.save(this.items().filter(i => i.uid !== uid)); },
    clear() { this.save([]); },
  };

  /* Build a normalized cart line from a product (from buildProduct) */
  function lineFromProduct(descriptor, product, variant, qty) {
    return {
      descriptor: descriptor || null,
      kind: product.kind,
      product: {
        id: product.id,
        cat: product.catForCheckout || product.cat,
        title: product.titleEm ? `${product.title} — ${product.titleEm}` : product.title,
        loc: product.loc || null,
        img: product.heroImg || null,
        kind: product.kind,
      },
      variant: { id: variant.id, name: variant.name, desc: variant.desc || "", price: variant.price, unit: variant.unit || null },
      price: variant.price,
      qty: qty || 1,
      adminFee: product.adminFee || 0,
      depositPct: product.depositPct != null ? product.depositPct : 0.5,
    };
  }

  /* Add to cart. Cards call cartAdd(descriptor). Detail passes variant+qty+product. */
  function cartAdd(descriptor, variant, qty, product) {
    product = product || (window.buildProduct && window.buildProduct(descriptor));
    if (!product) return null;
    variant = variant || (product.variants || []).find(v => v.popular) || (product.variants || [])[0];
    if (!variant) return null;
    const line = lineFromProduct(descriptor, product, variant, qty || 1);
    const stored = KaspaCart.add(line);
    emit("ks:cart-add", line);
    return stored;
  }

  /* ============ SESSION / USER ============ */

  function demoUser() {
    return {
      id: "KSM-204815",
      name: "Adit Pratama",
      email: "adit@demo.com",
      phone: "+62 812-3456-7890",
      nik: "",
      address: "Jl. Adi Sucipto No. 24, Manahan, Solo",
      joined: "2025-01-12",
      member: { tier: "Gold", points: 1280 },
      discounts: [
        {
          code: "LOYAL15", label: "Diskon Loyalitas", percent: 15,
          scope: "all", scopeLabel: "Semua layanan",
          source: "Hadiah dari Admin Kaspa", kind: "personal",
          desc: "Apresiasi untuk member setia sejak 2025. Otomatis bisa dipakai di checkout.",
          validUntil: "2026-07-31", status: "active",
        },
        {
          code: "FNB20", label: "Diskon F&B Member", percent: 20,
          scope: "fnb", scopeLabel: "Food & Beverage",
          source: "Benefit member Gold", kind: "member",
          desc: "Potongan 20% untuk semua menu kafe internal Kaspa Space.",
          validUntil: "2026-12-31", status: "active",
        },
        {
          code: "KASPA10", label: "Kupon Sambutan", percent: 10,
          scope: "all", scopeLabel: "Semua layanan",
          source: "Promo pendaftaran", kind: "voucher",
          desc: "Kupon umum untuk semua pesanan pertama.",
          validUntil: "2026-08-31", status: "active",
        },
        {
          code: "WELCOME25", label: "Welcome Voucher", percent: 25,
          scope: "coworking", scopeLabel: "Coworking Space",
          source: "Promo member baru", kind: "voucher",
          desc: "Voucher coworking yang sudah Anda gunakan.",
          validUntil: "2025-03-31", status: "used",
          usedOn: "2025-02-03", usedOrder: "KS-10293847",
        },
      ],
      orders: [
        {
          id: "KS-91002837", createdAt: "2026-05-20T09:12:00", method: "BCA Virtual Account",
          items: [{ cat: "Legalitas Usaha", title: "Legalitas Usaha — Kaspa Space Solo", variantName: "CV", qty: 1, price: 225000 }],
          subtotal: 225000, discount: 33750, discountCode: "LOYAL15", total: 193750,
          payNow: 96875, statusStep: 2, statusLabel: "Sedang diproses notaris",
        },
        {
          id: "KS-90881245", createdAt: "2026-05-08T14:40:00", method: "QRIS",
          items: [
            { cat: "Coworking Space", title: "Share Desk", variantName: "Harian", qty: 2, price: 25000 },
            { cat: "Food & Beverage", title: "Es Kopi Susu Aren", variantName: "Reguler", qty: 2, price: 28000 },
          ],
          subtotal: 106000, discount: 5600, discountCode: "FNB20", total: 100400,
          payNow: 100400, statusStep: 3, statusLabel: "Selesai",
        },
        {
          id: "KS-90773310", createdAt: "2026-04-26T08:05:00", method: "GoPay",
          items: [{ cat: "Coworking Space", title: "Meeting Room Solo", variantName: "Per Jam", qty: 3, price: 80000 }],
          subtotal: 240000, discount: 0, discountCode: null, total: 240000,
          payNow: 120000, statusStep: 4, statusLabel: "Dibatalkan",
        },
      ],
    };
  }

  const KaspaSession = {
    isLoggedIn() { return !!read(SESSION_KEY, null); },
    user() {
      if (!this.isLoggedIn()) return null;
      let u = read(USER_KEY, null);
      if (!u) { u = demoUser(); write(USER_KEY, u); }
      return u;
    },
    login(partial) {
      let u = read(USER_KEY, null) || demoUser();
      if (partial) {
        if (partial.name) u.name = partial.name;
        if (partial.email) u.email = partial.email;
        if (partial.phone) u.phone = partial.phone;
      }
      write(USER_KEY, u);
      write(SESSION_KEY, { at: Date.now() });
      emit("ks:session", { user: u });
      return u;
    },
    logout() {
      try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
      emit("ks:session", { user: null });
    },
    saveUser(u) { write(USER_KEY, u); emit("ks:session", { user: u }); },
    recordOrder(order) {
      const u = this.user();
      if (!u) return;
      if ((u.orders || []).some(o => o.id === order.id)) return;
      const summary = {
        id: order.id,
        createdAt: order.paidAt || order.createdAt || new Date().toISOString(),
        method: (order.method && order.method.name) || "—",
        items: (order.items || []).map(i => ({
          cat: i.product.cat, title: i.product.title,
          variantName: i.variant.name, qty: i.qty, price: i.price,
        })),
        subtotal: order.subtotal, discount: order.discount || 0,
        discountCode: order.discountCode || null, total: order.total,
        payNow: order.payNow || order.total,
        statusStep: 2, statusLabel: "Sedang diproses",
      };
      u.orders = [summary, ...(u.orders || [])];
      this.saveUser(u);
    },
  };

  window.KaspaCart = KaspaCart;
  window.KaspaSession = KaspaSession;
  window.cartAdd = cartAdd;
  window.ksRp = rp;
})();
