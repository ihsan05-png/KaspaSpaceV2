import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/icons';
import { trackBooking, BookingTrack } from '../lib/publicApi';
import logoImg from '../../img/kaspa-space-logo.png';

type SvgProps = React.SVGProps<SVGSVGElement>;
const PrintIcon  = (p: SvgProps) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const SealIcon   = (p: SvgProps) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.8-1 2.8 1 2.8-2.4 1.8-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15l1-2.8-1-2.8 2.4-1.8 1-2.8 3-.1z"/><polyline points="8.5 12 11 14.5 15.5 9.5"/></svg>;

const rpInv = (n: number) => 'Rp' + Math.round(n || 0).toLocaleString('id-ID');
const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtDateTime = (d: Date) => d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_LABEL: Record<string, string> = { paid: 'Lunas', partial: 'DP / Sebagian', pending: 'Menunggu Bayar', cancel: 'Dibatalkan' };
const STAMP_LABEL:  Record<string, string> = { paid: 'Lunas', partial: 'DP Diterima',   pending: 'Belum Lunas',    cancel: 'Batal'      };

interface InvoiceLine { cat: string; title: string; variant: string; qty: number; price: number; discount: number; amount: number; }
interface InvoiceModel {
  invoiceNo: string; code: string; issued: Date; paidAt: Date | null; due: Date;
  lines: InvoiceLine[]; subtotal: number; adminFee: number; discount: number; discountCode: string;
  ppnRate: number; ppnAmount: number;
  total: number; paid: number; remaining: number; status: string; methodName: string;
  buyer: { name: string; email: string; phone: string; company: string; address: string; };
}

type OtherItem = { cat: string; title: string; variantName: string; price: number; discount: number; discountCode: string };

function parseBundledFromNotes(notes: string): OtherItem[] {
  const m = notes.match(/\[BundledItems:([A-Za-z0-9+/=]+)\]/);
  if (!m) return [];
  try { return JSON.parse(atob(m[1])) as OtherItem[]; } catch { return []; }
}

function otherItemLines(raw: Record<string, unknown>): InvoiceLine[] {
  // Prefer explicit otherItems (checkout flow); fall back to notes tag (admin/dashboard)
  const items: OtherItem[] = (raw.otherItems as OtherItem[] | undefined)?.length
    ? (raw.otherItems as OtherItem[])
    : parseBundledFromNotes(String(raw.notes ?? ''));
  if (!items.length) return [];
  return items.map(i => ({
    cat:      i.cat === 'fnb' ? 'Food & Beverage' : i.cat === 'business' ? 'Business Service' : i.cat,
    title:    i.title,
    variant:  i.variantName,
    qty:      1,
    price:    i.price,
    discount: i.discount ?? 0,
    amount:   i.price - (i.discount ?? 0),
  }));
}

function buildFromBookingResult(raw: Record<string, unknown>): InvoiceModel {
  const code = String(raw.code ?? '');
  const invoiceNo = String(raw.invoiceNo ?? raw.invoice_no ?? code);

  const issued = new Date(String(raw.createdAt ?? Date.now()));
  const paidAt = raw.paidAt ? new Date(String(raw.paidAt)) : null;
  const due = new Date(issued.getTime() + 24 * 60 * 60 * 1000);

  const totalPrice = Number(raw.totalPrice ?? 0);
  const adminFee = Number(raw.adminFee ?? 0);

  const extraLines = otherItemLines(raw);
  const extraTotal = extraLines.reduce((s, l) => s + l.amount, 0);

  const lines: InvoiceLine[] = [
    {
      cat: String(raw.productType ?? 'Coworking'),
      title: String(raw.productName ?? raw.productType ?? 'Booking'),
      variant: raw.room ? `${(raw.room as { title: string }).title}${raw.startTime ? ` · ${String(raw.startTime).slice(0,5)}–${String(raw.endTime).slice(0,5)}` : ''}${String(raw.productType) === 'Share Desk' ? ` · ${Number(raw.qty ?? 1)} meja` : ''}` : '',
      qty: Number(raw.qty ?? 1),
      price: totalPrice,
      discount: 0,
      amount: totalPrice,
    },
    ...extraLines,
  ];

  const total = totalPrice + adminFee + extraTotal;
  const rawSt = String(raw.status ?? '');
  const isPaid    = ['paid', 'checked-in', 'checked-out', 'selesai'].includes(rawSt);
  const isPartial = rawSt === 'proses';
  const isCancel  = ['cancelled', 'batal', 'cancel'].includes(rawSt);
  const status = isPaid ? 'paid' : isPartial ? 'partial' : isCancel ? 'cancel' : 'pending';
  const paid = (isPaid || isPartial) ? total : 0;
  const remaining = Math.max(0, total - paid);

  const buyer = raw.buyer as Record<string, string> | undefined;
  const methodNotes = String(raw.notes ?? '');
  const methodMatch = methodNotes.match(/\[Pembayaran:\s*([^\]]+)\]/);

  return {
    invoiceNo, code, issued, paidAt, due,
    lines, subtotal: totalPrice + extraTotal, adminFee, discount: 0, discountCode: '',
    ppnRate: Number(raw.ppnRate ?? 0), ppnAmount: Number(raw.ppnAmount ?? 0),
    total, paid, remaining, status,
    methodName: methodMatch ? methodMatch[1].trim() : (raw.paymentMethod ? String(raw.paymentMethod) : '—'),
    buyer: {
      name: buyer?.name ?? String(raw.guestName ?? 'Pelanggan Kaspa'),
      email: buyer?.email ?? String(raw.guestEmail ?? ''),
      phone: buyer?.phone ?? String(raw.guestPhone ?? ''),
      company: '',
      address: '',
    },
  };
}

type OrderLineItem = { cat: string; title: string; variantName: string; qty: number; price: number; discount: number };

function buildFromOrder(raw: Record<string, unknown>): InvoiceModel {
  const id = String(raw.id ?? '');
  const digits = id.replace(/\D/g, '').slice(-8).padStart(8, '0');
  const invoiceNo = `INV/${digits.slice(0, 4)}/${digits.slice(4)}`;
  const code = id;

  const issued = new Date(String(raw.createdAt ?? Date.now()));
  const paidAt = raw.paidAt ? new Date(String(raw.paidAt)) : null;
  const due = raw.expireAt ? new Date(Number(raw.expireAt)) : new Date(issued.getTime() + 24 * 60 * 60 * 1000);

  const adminFee = Number(raw.adminFee ?? 0);
  const orderDiscount = Number(raw.discount ?? 0);

  let lines: InvoiceLine[];
  let subtotal: number;

  const rawOrderItems = raw.orderItems as OrderLineItem[] | undefined;
  if (rawOrderItems?.length) {
    lines = rawOrderItems.map(i => ({
      cat: i.cat,
      title: i.title,
      variant: i.variantName || (i.qty > 1 ? `× ${i.qty}` : ''),
      qty: i.qty,
      price: i.price,
      discount: i.discount ?? 0,
      amount: i.price - (i.discount ?? 0),
    }));
    subtotal = lines.reduce((s, l) => s + l.amount, 0);
  } else {
    const product = raw.product as Record<string, string> | undefined;
    const variant = raw.variant as Record<string, unknown> | undefined;
    subtotal = Number(raw.subtotal ?? 0);
    const qty = Number(raw.qty ?? 1);
    const variantName = String(variant?.name ?? '');
    lines = [{
      cat: product?.cat ?? 'Layanan',
      title: product?.title ?? 'Pesanan',
      variant: variantName || (qty > 1 ? `× ${qty}` : ''),
      qty,
      price: subtotal,
      discount: 0,
      amount: subtotal,
    }];
  }

  const total = Number(raw.total ?? subtotal + adminFee - orderDiscount);
  const ps = String(raw.paymentStatus ?? '');
  const isPaid   = ps === 'paid';
  const isCancel = ps === 'cancelled' || ps === 'cancel';
  const status = isPaid ? 'paid' : isCancel ? 'cancel' : 'pending';
  const paid = isPaid ? total : 0;
  const remaining = Math.max(0, total - paid);

  const buyer = raw.buyer as Record<string, string> | undefined;
  const method = raw.method as Record<string, string> | undefined;

  return {
    invoiceNo, code, issued, paidAt, due,
    lines, subtotal, adminFee,
    discount: orderDiscount, discountCode: String(raw.coupon ?? ''),
    ppnRate: Number(raw.ppnRate ?? 0), ppnAmount: Number(raw.ppnAmount ?? 0),
    total, paid, remaining, status,
    methodName: method?.name ?? '—',
    buyer: {
      name: buyer?.name ?? 'Pelanggan Kaspa',
      email: buyer?.email ?? '',
      phone: buyer?.phone ?? '',
      company: '',
      address: '',
    },
  };
}

function buildFromTrack(live: BookingTrack, stored: Record<string, unknown>): InvoiceModel {
  const code = live.code;
  const invoiceNo = live.invoice_no ?? String(stored.invoiceNo ?? code);
  const issued = new Date(live.created_at);
  const paidAt = live.paid_at ? new Date(live.paid_at)
    : (stored.paidAt ? new Date(String(stored.paidAt)) : null);
  const due = live.expires_at ? new Date(live.expires_at) : new Date(issued.getTime() + 24 * 3600000);

  const room = live.room;
  const extraLines = otherItemLines(stored);
  const extraTotal = extraLines.reduce((s, l) => s + l.amount, 0);
  const lines: InvoiceLine[] = [
    {
      cat: live.product_type_key,
      title: room ? room.title : live.product_type_key,
      variant: room
        ? `${room.location}${live.start_time ? ` · ${live.start_time.slice(0,5)}–${live.end_time?.slice(0,5)}` : ''}${live.product_type_key === 'Share Desk' ? ` · ${live.qty_desks} meja` : (live.qty_desks > 1 ? ` · ${live.qty_desks} meja` : '')}`
        : '',
      qty: live.qty_desks ?? 1,
      price: live.total_price,
      discount: 0,
      amount: live.total_price,
    },
    ...extraLines,
  ];

  const total = live.total_price + (live.admin_fee ?? 0) + extraTotal;
  const isPaid    = ['paid', 'checked-in', 'checked-out', 'selesai'].includes(live.status);
  const isPartial = live.status === 'proses';
  const isCancel  = ['cancelled', 'batal', 'cancel'].includes(live.status);
  const status = isPaid ? 'paid' : isPartial ? 'partial' : isCancel ? 'cancel' : 'pending';

  const notes = String(live.notes ?? stored.notes ?? '');
  const methodMatch = notes.match(/\[Pembayaran:\s*([^\]]+)\]/);

  return {
    invoiceNo, code, issued, paidAt, due, lines,
    subtotal: live.total_price + extraTotal, adminFee: live.admin_fee ?? 0,
    discount: 0, discountCode: '',
    ppnRate: Number(stored.ppnRate ?? 0), ppnAmount: Number(stored.ppnAmount ?? 0),
    total, paid: (isPaid || isPartial) ? total : 0,
    remaining: (isPaid || isPartial) ? 0 : total,
    status,
    methodName: methodMatch ? methodMatch[1].trim() : (stored.paymentMethod ? String(stored.paymentMethod) : '—'),
    buyer: {
      name: String(stored.guestName ?? stored.buyerName ?? 'Pelanggan Kaspa'),
      email: String(stored.guestEmail ?? stored.buyerEmail ?? ''),
      phone: String(stored.guestPhone ?? stored.buyerPhone ?? ''),
      company: '', address: '',
    },
  };
}

export default function InvoicePage() {
  const navigate = useNavigate();
  const [inv,    setInv]    = useState<InvoiceModel | null>(null);
  const [backTo, setBackTo] = useState('/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const brRaw = localStorage.getItem('ks_booking_result');
        if (brRaw) {
          const stored = JSON.parse(brRaw) as Record<string, unknown>;
          const code = String(stored.code ?? '');
          if (code) {
            try {
              const live = await trackBooking(code);
              setInv(buildFromTrack(live, stored));
            } catch {
              setInv(buildFromBookingResult(stored));
            }
          } else {
            setInv(buildFromBookingResult(stored));
          }
          setBackTo('/pesan-sukses');
          return;
        }
        const orRaw = localStorage.getItem('ks_order');
        if (orRaw) {
          const parsed = JSON.parse(orRaw) as Record<string, unknown>;
          setInv(buildFromOrder(parsed));
          setBackTo('/sukses');
          return;
        }
      } catch { /* ignore */ }
      navigate('/', { replace: true });
    })().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="inv-stage">
        <div className="container inv-loading">Memuat invoice...</div>
      </section>
    );
  }

  if (!inv) {
    return (
      <section className="inv-stage">
        <div className="container">
          <div className="inv-empty">
            <h2 className="section-title">Invoice <em>tidak ditemukan</em></h2>
            <p className="inv-empty-sub">Belum ada pesanan untuk ditagihkan.</p>
            <Link className="btn btn-primary" to="/bisnis">Lihat Layanan <Icon.Arrow /></Link>
          </div>
        </div>
      </section>
    );
  }

  const settled = inv.remaining <= 0 && inv.status !== 'cancel';

  return (
    <section className="inv-stage">
        <div className="container">

          {/* Toolbar */}
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <span className="inv-toolbar-eyebrow">Invoice · {inv.invoiceNo}</span>
              <h1 className="inv-toolbar-title">Tagihan <em>Pesanan</em></h1>
            </div>
            <div className="inv-toolbar-actions">
              <Link className="btn btn-ghost" to={backTo}><Icon.ChevLeft /> Kembali</Link>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <PrintIcon /> Cetak / Simpan PDF
              </button>
            </div>
          </div>

          {/* Sheet */}
          <div className={`inv-sheet${settled ? ' is-paid' : ''}`}>
            {settled && <div className="inv-watermark" aria-hidden="true">LUNAS</div>}

            {/* Header band */}
            <div className="inv-band">
              <div className="inv-band-left">
                <img src={logoImg} alt="Kaspa Space" className="inv-logo-img" />
                <div className="inv-brand-tag">Ruang Kerja Masa Depan</div>
                <div className="inv-brand-contact">
                  Jl. Adi Sucipto No. 24, Manahan, Solo<br />
                  cs@kaspaspace.com · +62 812-3456-7890<br />
                  NPWP 09.254.881.7-526.000
                </div>
              </div>
              <div className="inv-band-right">
                <div className="inv-word">INVOICE</div>
                <div className="inv-no"><span>No.</span> {inv.invoiceNo}</div>
                <span className={`inv-status ${inv.status}`}>
                  <span className="dot" />{STATUS_LABEL[inv.status]}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="inv-body">
              {settled && (
                <div className="inv-paid-banner">
                  <div className="inv-paid-seal"><SealIcon /></div>
                  <div className="inv-paid-text">
                    <div className="inv-paid-title">Pembayaran Lunas</div>
                    <div className="inv-paid-sub">
                      Telah dibayar penuh{inv.paidAt ? ` pada ${fmtDateTime(inv.paidAt)}` : ''} · {inv.methodName}
                    </div>
                  </div>
                  <div className="inv-paid-amount">
                    <div className="l">Total Dibayar</div>
                    <div className="v">{rpInv(inv.total)}</div>
                  </div>
                </div>
              )}

              {/* Parties */}
              <div className="inv-parties">
                <div>
                  <div className="inv-party-label">Ditagihkan kepada</div>
                  <p className="inv-party-name">{inv.buyer.name}</p>
                  <div className="inv-party-line">
                    {inv.buyer.company && <>{inv.buyer.company}<br /></>}
                    {inv.buyer.email && <>{inv.buyer.email}<br /></>}
                    {inv.buyer.phone && <>{inv.buyer.phone}<br /></>}
                    {inv.buyer.address && <>{inv.buyer.address}</>}
                  </div>
                </div>
                <div>
                  <div className="inv-party-label">Diterbitkan oleh</div>
                  <p className="inv-party-name">Kaspa Space</p>
                  <div className="inv-party-line">
                    Kaspa Space — Coworking &amp; Layanan Bisnis
                  </div>
                </div>
                <div className="inv-dates">
                  <div className="inv-date-row">
                    <span className="l">Order ID</span>
                    <span className="v inv-order-id">{inv.code}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">Tgl Terbit</span>
                    <span className="v">{fmtDate(inv.issued)}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">{inv.paidAt ? 'Tgl Bayar' : 'Jatuh Tempo'}</span>
                    <span className="v">{fmtDate(inv.paidAt ?? inv.due)}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">Metode</span>
                    <span className="v">{inv.methodName}</span>
                  </div>
                </div>
              </div>

              {/* Items table */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th className="l inv-row-num">#</th>
                    <th className="l">Deskripsi</th>
                    <th className="inv-qty-col">Qty</th>
                    <th className="inv-price-col">Harga</th>
                    <th className="inv-amount-col">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="l inv-row-num">{String(i + 1).padStart(2, '0')}</td>
                      <td className="l">
                        <div className="inv-item-cat">{l.cat}</div>
                        <div className="inv-item-title">{l.title}</div>
                        {l.variant && <div className="inv-item-variant">{l.variant}</div>}
                        {l.discount > 0 && (
                          <div className="inv-item-discount">Diskon −{rpInv(l.discount)}</div>
                        )}
                      </td>
                      <td className="inv-cell-num">{l.qty}</td>
                      <td className="inv-cell-num">
                        {l.discount > 0
                          ? <><s style={{ opacity: 0.45 }}>{rpInv(l.price)}</s></>
                          : (l.price === 0 ? 'Gratis' : rpInv(l.price))}
                      </td>
                      <td className="inv-cell-num inv-cell-amount">{l.amount === 0 ? 'Gratis' : rpInv(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="inv-totals-wrap">
                <div className="inv-totals">
                  <div className="inv-total-row">
                    <span className="l">Subtotal</span>
                    <span className="v">{rpInv(inv.subtotal)}</span>
                  </div>
                  {inv.adminFee > 0 && (
                    <div className="inv-total-row">
                      <span className="l">Admin &amp; layanan</span>
                      <span className="v">{rpInv(inv.adminFee)}</span>
                    </div>
                  )}
                  {inv.discount > 0 && (
                    <div className="inv-total-row discount">
                      <span className="l">Diskon{inv.discountCode ? ` (${inv.discountCode})` : ''}</span>
                      <span className="v">−{rpInv(inv.discount)}</span>
                    </div>
                  )}
                  {inv.ppnAmount > 0 && (
                    <div className="inv-total-row">
                      <span className="l">PPN {inv.ppnRate}%</span>
                      <span className="v">{rpInv(inv.ppnAmount)}</span>
                    </div>
                  )}
                  <div className="inv-total-row grand">
                    <span className="l">Total</span>
                    <span className="v">{rpInv(inv.total)}</span>
                  </div>
                  {inv.paid > 0 && (
                    <div className="inv-total-row paid">
                      <span className="l">Sudah dibayar</span>
                      <span className="v">−{rpInv(inv.paid)}</span>
                    </div>
                  )}
                  <div className={`inv-total-row due${settled ? ' settled' : ''}`}>
                    <span className="l">{settled ? 'Status' : 'Sisa Tagihan'}</span>
                    <span className="v">{settled ? 'LUNAS' : rpInv(inv.remaining)}</span>
                  </div>
                </div>
              </div>

              {/* Payment band + stamp */}
              <div className="inv-payband">
                <div className="inv-pay-meta">
                  <div className="inv-pay-item">
                    <div className="l">Metode Bayar</div>
                    <div className="v">{inv.methodName}</div>
                  </div>
                  <div className="inv-pay-item">
                    <div className="l">Status</div>
                    <div className="v">{STATUS_LABEL[inv.status]}</div>
                  </div>
                  {inv.paidAt && (
                    <div className="inv-pay-item">
                      <div className="l">Waktu Bayar</div>
                      <div className="v">{fmtDateTime(inv.paidAt)}</div>
                    </div>
                  )}
                </div>
                <div className={`inv-stamp ${inv.status}`}>{STAMP_LABEL[inv.status]}</div>
              </div>

              {/* Notes */}
              <div className="inv-notes">
                <div>
                  <h4>Catatan</h4>
                  <p>
                    {settled
                      ? 'Pembayaran telah kami terima penuh. Invoice ini sah sebagai bukti pembayaran tanpa memerlukan tanda tangan basah.'
                      : `Mohon selesaikan sisa tagihan ${rpInv(inv.remaining)} saat proses pesanan selesai. Tim kami akan menghubungi Anda maksimal 1×24 jam kerja.`}
                  </p>
                </div>
                <div>
                  <h4>Syarat &amp; Ketentuan</h4>
                  <ul>
                    <li>Pembayaran diproses aman melalui metode yang dipilih saat checkout.</li>
                    <li>Simpan invoice ini sebagai bukti transaksi resmi.</li>
                    <li>Pertanyaan? Hubungi cs@kaspaspace.com.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="inv-foot">
              <div className="inv-foot-main">
                <div className="inv-thanks">Terima kasih telah memilih <span>Kaspa Space</span>.</div>
                <p className="inv-foot-sub">
                  Dokumen ini dihasilkan secara elektronik dan sah tanpa tanda tangan basah.
                  Pantau status pesanan kapan saja melalui dashboard Anda.
                </p>
              </div>
              <div className="inv-sign">
                <div className="inv-sign-mark">Kaspa Space</div>
                <div className="inv-sign-label">Authorized · Solo</div>
              </div>
            </div>
          </div>

        </div>
      </section>
  );
}
