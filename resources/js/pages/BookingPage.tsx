import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { waLink } from '../lib/config';
import { useAuth } from '../contexts/AuthContext';
import { useApiGet } from '../hooks/useApiGet';
import {
  fetchPublicRooms, RoomApi,
  OvertimeScheduleApi, AvailabilityResult,
  fetchOvertimeSchedules, checkRoomAvailability, createBooking,
} from '../lib/publicApi';

/* ============================================================
   CONFIG PER PRODUCT TYPE
   ============================================================ */
const TYPE_LABELS: Record<string, string> = {
  'Share Desk':     'Share Desk',
  'Private Room':   'Private Room',
  'Private Office': 'Private Office',
  'Meeting Room':   'Meeting Room',
  'Overtime':       'Overtime Access',
};

const TYPE_DESCS: Record<string, string> = {
  'Share Desk':     'Meja di area komunal. Bisa booking per jam, pilih jumlah meja sesuai kebutuhan.',
  'Private Room':   'Ruang tertutup untuk fokus atau diskusi kecil. Booking per jam, satu sesi eksklusif.',
  'Private Office': 'Kantor privat siap pakai. Booking per hari — pilih tanggal dan ruangan.',
  'Meeting Room':   'Ruang rapat dengan proyektor/TV. Booking per jam, eksklusif selama sesi.',
  'Overtime':       'Akses ruang di luar jam operasional. Jadwal dan ruangan ditentukan admin.',
};

const NEEDS_TIME = new Set(['Share Desk', 'Private Room', 'Meeting Room', 'Overtime']);
const NEEDS_QTY  = new Set(['Share Desk']);

const DAY_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const fmt   = (n: number) => 'Rp' + n.toLocaleString('id-ID');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}

/* ============================================================
   PRICE CALCULATION
   ============================================================ */
function calcPrice(room: RoomApi, start: string, end: string, qty: number): number {
  if (room.unit === 'jam' && start && end) {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const hours = Math.max(0, toMin(end) - toMin(start)) / 60;
    return Math.round(room.price * hours * qty);
  }
  return room.price * qty;
}

/* ============================================================
   AVAILABILITY BADGE
   ============================================================ */
function AvailBadge({
  result, productType, qty,
}: { result: AvailabilityResult; productType: string; qty: number }) {
  if (productType === 'Share Desk') {
    const avail = result.available_desks ?? 0;
    const ok = avail >= qty;
    return (
      <span className={`status ${ok ? 'active' : 'archived'}`} style={{ fontSize: 12 }}>
        {avail === 0 ? 'Penuh' : ok ? `${avail} meja tersedia` : `Hanya ${avail} meja (kurang)`}
      </span>
    );
  }
  return (
    <span className={`status ${result.available ? 'active' : 'archived'}`} style={{ fontSize: 12 }}>
      {result.available ? 'Tersedia' : (result.reason ?? 'Tidak tersedia')}
    </span>
  );
}

/* ============================================================
   ROOM CARD (selectable)
   ============================================================ */
interface RoomCardProps {
  room: RoomApi;
  selected: boolean;
  productType: string;
  qty: number;
  avail: AvailabilityResult | null;
  checking: boolean;
  hasDateAndTime: boolean;
  onSelect: () => void;
}

function RoomCard({ room, selected, productType, qty, avail, checking, hasDateAndTime, onSelect }: RoomCardProps) {
  return (
    <div
      className={`co-pay${selected ? ' active' : ''}`}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16 }}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="co-pay-radio" style={{ marginTop: 3, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{room.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {room.location}
          {room.capacity ? ` · ${room.capacity}` : ''}
          {room.amenity ? ` · ${room.amenity}` : ''}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          {fmt(room.price)} / {room.unit}
          {room.desks_total > 0 && (
            <> · <span style={{ color: room.desks_avail > 0 ? 'var(--success)' : 'var(--error)' }}>
              {room.desks_avail}/{room.desks_total} meja
            </span></>
          )}
        </div>
        {selected && (
          <div style={{ marginTop: 8 }}>
            {checking && (
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Mengecek ketersediaan...</span>
            )}
            {!checking && avail && (
              <AvailBadge result={avail} productType={productType} qty={qty} />
            )}
            {!checking && !avail && hasDateAndTime && (
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Tidak dapat cek ketersediaan</span>
            )}
            {!checking && !avail && !hasDateAndTime && (
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Isi tanggal{NEEDS_TIME.has(productType) ? ' & jam' : ''} untuk cek ketersediaan
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BOOKING PAGE
   ============================================================ */
export default function BookingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const productType = searchParams.get('type') || 'Share Desk';
  const preRoomId   = searchParams.get('roomId');

  const needsTime  = NEEDS_TIME.has(productType);
  const needsQty   = NEEDS_QTY.has(productType);
  const isOvertime = productType === 'Overtime';

  /* ---- Form state ---- */
  const [date,  setDate]  = useState('');
  const [start, setStart] = useState('08:00');
  const [end,   setEnd]   = useState('09:00');
  const [room,  setRoom]  = useState<RoomApi | null>(null);
  const [qty,   setQty]   = useState(1);
  const [notes, setNotes] = useState('');

  /* ---- Guest contact (shown when not logged in) ---- */
  const [guestName,  setGuestName]  = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  /* ---- Rooms from API ---- */
  const { data: rooms } = useApiGet<RoomApi[]>(
    () => fetchPublicRooms({ product_type: productType }),
    [productType]
  );

  /* Pre-select room from URL param */
  useEffect(() => {
    if (!preRoomId || !rooms) return;
    const found = rooms.find(r => r.id === Number(preRoomId));
    if (found) setRoom(found);
  }, [rooms, preRoomId]);

  /* ---- Overtime schedule for selected room + date ---- */
  const [schedule, setSchedule] = useState<OvertimeScheduleApi | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    if (!isOvertime || !room || !date) { setSchedule(null); return; }
    setLoadingSchedule(true);
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    fetchOvertimeSchedules(room.id)
      .then(list => {
        const s = list.find(x => x.day_of_week === dayOfWeek && x.active) ?? null;
        setSchedule(s);
        if (s) {
          setStart(s.start_time.slice(0, 5));
          setEnd(s.end_time.slice(0, 5));
        }
      })
      .catch(() => setSchedule(null))
      .finally(() => setLoadingSchedule(false));
  }, [isOvertime, room?.id, date]);

  /* ---- Availability check ---- */
  const [avail, setAvail]   = useState<AvailabilityResult | null>(null);
  const [checking, setCheck] = useState(false);

  const hasDateAndTime = !!date && (!needsTime || (!!start && !!end && start < end));

  useEffect(() => {
    if (!room || !hasDateAndTime) { setAvail(null); return; }
    setCheck(true);
    setAvail(null);
    checkRoomAvailability(room.id, {
      product_type: productType,
      date,
      ...(needsTime ? { start_time: start, end_time: end } : {}),
    })
      .then(r => setAvail(r))
      .catch(() => setAvail(null))
      .finally(() => setCheck(false));
  }, [room?.id, date, start, end, productType, hasDateAndTime]);

  /* Reset availability when room changes */
  const selectRoom = (r: RoomApi) => {
    setRoom(r);
    setAvail(null);
    setSchedule(null);
  };

  /* ---- Price calc ---- */
  const price    = useMemo(() => room ? calcPrice(room, start, end, qty) : 0, [room, start, end, qty]);
  const adminFee = 15000;
  const total    = price + adminFee;

  /* ---- Validation ---- */
  const isAvailOk = useMemo(() => {
    if (!avail) return false;
    if (productType === 'Share Desk') return (avail.available_desks ?? 0) >= qty;
    return avail.available === true;
  }, [avail, productType, qty]);

  const validationMsg = useMemo(() => {
    if (!date) return 'Pilih tanggal booking';
    if (needsTime && start >= end) return 'Jam selesai harus lebih besar dari jam mulai';
    if (isOvertime && date && room && !loadingSchedule && !schedule)
      return 'Tidak ada jadwal overtime untuk hari ini di ruangan ini';
    if (!room) return 'Pilih ruangan';
    if (checking) return 'Mengecek ketersediaan...';
    if (!avail) return 'Ketersediaan belum dicek';
    if (!isAvailOk) {
      if (productType === 'Share Desk') return `Hanya tersedia ${avail.available_desks} meja (butuh ${qty})`;
      return avail.reason ?? 'Ruangan tidak tersedia di waktu ini';
    }
    return null;
  }, [date, needsTime, start, end, room, avail, isAvailOk, checking, productType, qty, isOvertime, schedule, loadingSchedule]);

  const isValid = !validationMsg && !!room;

  /* ---- Submit ---- */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    if (!user && (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim())) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const unitPrice = calcPrice(room!, needsTime ? start : '', needsTime ? end : '', 1);

      const result = await createBooking({
        room_id:          room!.id,
        product_type_key: productType,
        booking_date:     date,
        start_time:       needsTime ? start : null,
        end_time:         needsTime ? end   : null,
        qty_desks:        qty,
        unit_price:       unitPrice,
        notes:            notes || null,
        ...(!user && { guest_name: guestName.trim(), guest_email: guestEmail.trim(), guest_phone: guestPhone.trim() }),
      });

      const totalPrice = calcPrice(room!, needsTime ? start : '', needsTime ? end : '', qty);
      const dateDisplay = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

      try {
        localStorage.setItem('ks_cw_payment', JSON.stringify({
          bookingCode:  result.code,
          productType,
          productName:  TYPE_LABELS[productType] ?? productType,
          room:         { title: room!.title, location: room!.location },
          date,
          dateDisplay,
          startTime:    needsTime ? start : null,
          endTime:      needsTime ? end   : null,
          qty,
          totalPrice,
          adminFee:     result.admin_fee,
          expiresAt:    Date.now() + 12 * 60 * 60 * 1000,
          status:       result.status,
          paymentMethod: '',
          qrisImageUrl:  null,
          rekening:      null,
        }));
      } catch { /* ignore */ }

      navigate('/payment', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Gagal membuat pesanan. Coba lagi.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = today();

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <Link to="/coworking" className="com-back">
            <Icon.ChevLeft /> Kembali ke Coworking
          </Link>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="com-eyebrow">Booking</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>
              Pesan <em>{TYPE_LABELS[productType] ?? productType}</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '10px auto 0' }}>
              {TYPE_DESCS[productType] ?? ''}
            </p>
          </div>

          <form className="co-grid" onSubmit={handleSubmit}>
            {/* ── Left column ── */}
            <div>

              {/* 1. PILIH TANGGAL */}
              <div className="co-card">
                <h3>1. Pilih <em>Tanggal</em></h3>
                <div className="sub">Tentukan tanggal booking Anda</div>
                <div className="co-field" style={{ marginTop: 16 }}>
                  <label htmlFor="bk-date">Tanggal</label>
                  <input
                    id="bk-date"
                    type="date"
                    min={minDate}
                    value={date}
                    onChange={e => { setDate(e.target.value); setAvail(null); setSchedule(null); }}
                    required
                  />
                </div>
                {date && isOvertime && (
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Hari: <strong>{DAY_ID[new Date(date + 'T00:00:00').getDay()]}</strong>
                    {' '}— jadwal overtime akan ditampilkan setelah pilih ruangan.
                  </p>
                )}
              </div>

              {/* 2. PILIH JAM (Share Desk, Private Room, Meeting Room, Overtime) */}
              {needsTime && (
                <div className="co-card">
                  <h3>2. Pilih <em>Jam</em></h3>
                  {isOvertime ? (
                    <div className="sub">
                      {loadingSchedule ? 'Memuat jadwal...' :
                       schedule ? (
                         <>Jadwal overtime: <strong>{schedule.start_time.slice(0, 5)}–{schedule.end_time.slice(0, 5)}</strong>. Pilih jam dalam rentang ini.</>
                       ) : room && date ? 'Tidak ada jadwal overtime hari ini untuk ruangan ini.'
                         : 'Pilih ruangan dan tanggal untuk melihat jadwal overtime.'}
                    </div>
                  ) : (
                    <div className="sub">Tentukan jam mulai dan selesai</div>
                  )}
                  <div className="co-form-grid" style={{ marginTop: 16 }}>
                    <div className="co-field">
                      <label htmlFor="bk-start">Jam Mulai</label>
                      <input
                        id="bk-start"
                        type="time"
                        value={start}
                        min={isOvertime && schedule ? schedule.start_time.slice(0, 5) : undefined}
                        max={isOvertime && schedule ? schedule.end_time.slice(0, 5) : undefined}
                        onChange={e => { setStart(e.target.value); setAvail(null); }}
                        disabled={isOvertime && !schedule}
                        required={needsTime}
                      />
                    </div>
                    <div className="co-field">
                      <label htmlFor="bk-end">Jam Selesai</label>
                      <input
                        id="bk-end"
                        type="time"
                        value={end}
                        min={start || undefined}
                        max={isOvertime && schedule ? schedule.end_time.slice(0, 5) : undefined}
                        onChange={e => { setEnd(e.target.value); setAvail(null); }}
                        disabled={isOvertime && !schedule}
                        required={needsTime}
                      />
                    </div>
                  </div>
                  {needsTime && start && end && start >= end && (
                    <p style={{ color: 'var(--error)', fontSize: 13, marginTop: 6 }}>
                      Jam selesai harus lebih besar dari jam mulai.
                    </p>
                  )}
                </div>
              )}

              {/* 3. JUMLAH MEJA (Share Desk only) */}
              {needsQty && (
                <div className="co-card">
                  <h3>{needsTime ? '3.' : '2.'} Jumlah <em>Meja</em></h3>
                  <div className="sub">Berapa meja yang Anda butuhkan?</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ width: 40, height: 40, border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Kurangi meja"
                    >−</button>
                    <span style={{ fontWeight: 700, fontSize: 24, minWidth: 32, textAlign: 'center' }}>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(q => q + 1)}
                      style={{ width: 40, height: 40, border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Tambah meja"
                    >+</button>
                    <span style={{ color: 'var(--text-tertiary)' }}>meja</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                    Ketersediaan meja tergantung booking lain di ruangan yang sama.
                  </p>
                </div>
              )}

              {/* 4. PILIH RUANGAN */}
              <div className="co-card">
                <h3>
                  {needsTime && needsQty ? '4.' : needsTime || needsQty ? '3.' : '2.'}
                  {' '}Pilih <em>Ruangan</em>
                </h3>
                <div className="sub">
                  Pilih ruangan yang sesuai. Ketersediaan dicek otomatis setelah Anda memilih tanggal
                  {needsTime ? ' & jam' : ''}.
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                  {!rooms && <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Memuat ruangan...</p>}
                  {rooms?.length === 0 && (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                      Tidak ada ruangan untuk tipe ini.
                    </p>
                  )}
                  {rooms?.map(r => (
                    <RoomCard
                      key={r.id}
                      room={r}
                      selected={room?.id === r.id}
                      productType={productType}
                      qty={qty}
                      avail={room?.id === r.id ? avail : null}
                      checking={room?.id === r.id ? checking : false}
                      hasDateAndTime={hasDateAndTime}
                      onSelect={() => selectRoom(r)}
                    />
                  ))}
                </div>
              </div>

              {/* 5. DATA KONTAK (guest only) */}
              {!user && (
                <div className="co-card">
                  <h3>Data <em>Kontak</em></h3>
                  <div className="sub">Isi data Anda untuk konfirmasi booking. Sudah punya akun? <Link to={`/masuk?redirect=${encodeURIComponent('/pesan?type=' + encodeURIComponent(productType))}`}>Masuk sekarang</Link>.</div>
                  <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                    <div className="co-field">
                      <label htmlFor="bk-guest-name">Nama Lengkap</label>
                      <input
                        id="bk-guest-name"
                        type="text"
                        placeholder="Nama Anda"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="co-field">
                      <label htmlFor="bk-guest-email">Email</label>
                      <input
                        id="bk-guest-email"
                        type="email"
                        placeholder="email@contoh.com"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="co-field">
                      <label htmlFor="bk-guest-phone">Nomor HP / WhatsApp</label>
                      <input
                        id="bk-guest-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. CATATAN */}
              <div className="co-card">
                <h3>Catatan <em>Tambahan</em></h3>
                <div className="co-field" style={{ marginTop: 12 }}>
                  <label htmlFor="bk-notes">Catatan (opsional)</label>
                  <textarea
                    id="bk-notes"
                    placeholder="Permintaan khusus, kebutuhan tambahan, dll."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* ── Right column: summary ── */}
            <div>
              <div className="co-summary" style={{ position: 'sticky', top: 100 }}>
                <div className="co-summary-head">
                  <h3>Ringkasan <em>Booking</em></h3>
                </div>

                <div className="co-summary-body">
                  {room ? (
                    <>
                      <div className="co-line" style={{ marginBottom: 16 }}>
                        <div className="co-line-info">
                          <div className="co-line-cat">{TYPE_LABELS[productType] ?? productType}</div>
                          <div className="co-line-title">{room.title}</div>
                          {date && (
                            <div className="co-line-var">
                              {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                          {needsTime && start && end && start < end && (
                            <div className="co-line-var">{start} – {end}</div>
                          )}
                          {needsQty && <div className="co-line-var">{qty} meja</div>}
                        </div>
                      </div>

                      <div className="co-row"><span>Harga</span><span className="v">{fmt(price)}</span></div>
                      <div className="co-row muted"><span>Admin & layanan</span><span>{fmt(adminFee)}</span></div>
                      <div className="co-row total" style={{ marginTop: 16 }}>
                        <span className="l">Total</span>
                        <span className="v">{fmt(total)}</span>
                      </div>

                      {avail && !checking && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: isAvailOk ? 'rgba(52,211,153,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${isAvailOk ? 'rgba(52,211,153,.25)' : 'rgba(239,68,68,.25)'}`, borderRadius: 10, fontSize: 13 }}>
                          {isAvailOk
                            ? <span style={{ color: 'var(--success)' }}><CheckIcon /> Ruangan tersedia untuk waktu ini</span>
                            : <span style={{ color: 'var(--error)' }}>Ruangan tidak tersedia — coba waktu lain</span>
                          }
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: '8px 0' }}>
                      Pilih ruangan untuk melihat ringkasan.
                    </p>
                  )}

                  {submitError && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, fontSize: 13, color: 'var(--error)' }}>
                      {submitError}
                    </div>
                  )}
                </div>

                <div className="co-foot">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={!isValid || submitting}
                  >
                    {submitting ? 'Memproses...' : <>Buat Pesanan <Icon.Arrow /></>}
                  </button>

                  {validationMsg && (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>
                      {validationMsg}
                    </p>
                  )}

                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                    Booking langsung tersimpan ke sistem. Status awal: <strong>Pending</strong>.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </div>
  );
}
