import { useState, useMemo } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import {
  fetchStats, fetchAdminBookings, ApiBooking,
  fetchFnbOrders, ApiFnbOrder,
  fetchBizOrders, ApiBizOrder,
} from '../../lib/adminApi';

const fmt = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

const CW_STATUS: Record<string, string>  = { paid: 'Paid', pending: 'Pending', 'checked-in': 'Checked In', 'checked-out': 'Checked Out', cancelled: 'Cancelled' };
const FNB_STATUS: Record<string, string> = { paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled' };
const BIZ_STATUS: Record<string, string> = { pending: 'Pending', proses: 'Diproses', selesai: 'Selesai', cancelled: 'Cancelled' };

interface TxRow {
  id: string;
  code: string;
  type: 'Coworking' | 'F&B' | 'Bisnis';
  name: string;
  product: string;
  date: string;
  total: number;
  status: string;
  statusLabel: string;
  statusCss: string;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
}

function toBizStatusCss(s: string) {
  if (s === 'selesai') return 'paid';
  if (s === 'proses')  return 'checked-in';
  return s;
}

function buildRows(cw: ApiBooking[], fnb: ApiFnbOrder[], biz: ApiBizOrder[]): TxRow[] {
  const cwRows: TxRow[] = cw.map(b => ({
    id: `cw-${b.id}`,
    code: b.code,
    type: 'Coworking',
    name: b.user?.name ?? b.guest_name ?? '—',
    product: b.product_type_key + (b.room ? ` · ${b.room.title}` : ''),
    date: b.booking_date,
    total: b.total_price,
    status: b.status,
    statusLabel: CW_STATUS[b.status] ?? b.status,
    statusCss: b.status,
  }));

  const fnbRows: TxRow[] = fnb.map(o => ({
    id: `fnb-${o.id}`,
    code: o.code,
    type: 'F&B',
    name: o.member_name,
    product: 'Food & Beverage',
    date: o.booking_date ?? o.created_at,
    total: o.total,
    status: o.status,
    statusLabel: FNB_STATUS[o.status] ?? o.status,
    statusCss: o.status,
  }));

  const bizRows: TxRow[] = biz.map(o => ({
    id: `biz-${o.id}`,
    code: o.code,
    type: 'Bisnis',
    name: o.user?.name ?? o.member_name,
    product: o.service?.name ?? 'Layanan Bisnis',
    date: o.created_at,
    total: o.price - o.discount_amount,
    status: o.status,
    statusLabel: BIZ_STATUS[o.status] ?? o.status,
    statusCss: toBizStatusCss(o.status),
  }));

  return [...cwRows, ...fnbRows, ...bizRows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function fmtDateCsv(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function exportCsv(rows: TxRow[], dateFrom: string, dateTo: string) {
  const SEP = ';'; // Excel Indonesia pakai semicolon
  const BOM = '﻿';
  const headers = ['No','Kode','Tipe','Nama','Produk','Tanggal','Total (Rp)','Status'];
  const data = rows.map((r, i) => [
    i + 1,
    r.code,
    r.type,
    r.name,
    r.product,
    fmtDateCsv(r.date),
    r.total,
    r.statusLabel,
  ]);
  const esc = (v: unknown) => {
    const s = String(v);
    return s.includes(SEP) || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = BOM + [headers, ...data].map(r => r.map(esc).join(SEP)).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `laporan-kaspaspace-${dateFrom}-sd-${dateTo}.csv`;
  a.click();
}

function printLaporan(rows: TxRow[], dateFrom: string, dateTo: string, revenue: number) {
  const fmtD = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }); };
  const trs = rows.map((r, i) => `<tr><td>${i+1}</td><td>${r.code}</td><td>${r.type}</td><td>${r.name}</td><td>${r.product}</td><td>${fmtD(r.date)}</td><td style="text-align:right">${fmt(r.total)}</td><td>${r.statusLabel}</td></tr>`).join('');
  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan KaspaSpace</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px}h2{margin:0 0 4px;font-size:18px}p{margin:0 0 16px;color:#555}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f0f0f0;font-weight:600}tr:nth-child(even)td{background:#fafafa}.tf td{font-weight:700;border-top:2px solid #333}@media print{body{margin:0}}</style></head>
<body><h2>Laporan Keuangan — KaspaSpace</h2>
<p>Periode: ${fmtD(dateFrom)} s/d ${fmtD(dateTo)} · ${rows.length} transaksi · Dicetak: ${new Date().toLocaleString('id-ID')}</p>
<table><thead><tr><th>No</th><th>Kode</th><th>Tipe</th><th>Nama</th><th>Produk</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead>
<tbody>${trs}</tbody>
<tfoot><tr class="tf"><td colspan="6" style="text-align:right">Total Pendapatan (lunas):</td><td style="text-align:right">${fmt(revenue)}</td><td></td></tr></tfoot>
</table><script>window.onload=()=>window.print()<\/script></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8;' }));
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default function AdminLaporan() {
  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo,   setDateTo]   = useState(todayStr());

  const params = { date_from: dateFrom, date_to: dateTo, per_page: 'all' };

  const { data: stats,   loading: loadStats } = useApiGet(() => fetchStats());
  const { data: cwRes,   loading: loadCw }    = useApiGet(() => fetchAdminBookings(params), [dateFrom, dateTo]);
  const { data: fnbRes,  loading: loadFnb }   = useApiGet(() => fetchFnbOrders(params),     [dateFrom, dateTo]);
  const { data: bizRes,  loading: loadBiz }   = useApiGet(() => fetchBizOrders(params),     [dateFrom, dateTo]);

  const loading = loadCw || loadFnb || loadBiz;

  const rows = useMemo(() => buildRows(
    cwRes?.data  ?? [],
    fnbRes?.data ?? [],
    bizRes?.data ?? [],
  ), [cwRes, fnbRes, bizRes]);

  const revenue = useMemo(() => rows
    .filter(r => ['paid', 'checked-in', 'checked-out', 'selesai'].includes(r.status))
    .reduce((s, r) => s + r.total, 0),
  [rows]);

  const statsRevenue = stats?.revenue ?? 0;
  const statsTotal   = stats?.total   ?? 0;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Laporan <em>Keuangan</em></h1>
          <p className="admin-page-sub">Ringkasan pendapatan dan aktivitas booking</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-ghost" onClick={() => printLaporan(rows, dateFrom, dateTo, revenue)} disabled={loading || rows.length === 0}>
            <AdminIcon.Upload /> Cetak / PDF
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => exportCsv(rows, dateFrom, dateTo)} disabled={loading || rows.length === 0}>
            <AdminIcon.Upload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><h3 className="panel-title">Filter <em>Periode</em></h3></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 4 }}>
          <div className="co-field" style={{ flex: 1, minWidth: 160 }}>
            <label>Dari Tanggal</label>
            <input type="date" value={dateFrom} max={dateTo} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="co-field" style={{ flex: 1, minWidth: 160 }}>
            <label>Sampai Tanggal</label>
            <input type="date" value={dateTo} min={dateFrom} max={todayStr()} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div style={{ paddingBottom: 2, color: 'var(--text-secondary)', fontSize: 13 }}>
            {loading ? 'Memuat...' : `${rows.length} transaksi · ${fmt(revenue)}`}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head"><span className="kpi-label">Total Pendapatan</span><span className="kpi-icon"><AdminIcon.Chart /></span></div>
          <div className="kpi-value" style={{ fontSize: 'clamp(18px, 2vw, 26px)' }}>{loadStats ? '—' : fmt(statsRevenue)}</div>
          <div className="kpi-delta up"><AdminIcon.TrendUp /><strong>dari {statsTotal} transaksi</strong></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span className="kpi-label">Total Booking</span><span className="kpi-icon"><AdminIcon.Ticket /></span></div>
          <div className="kpi-value">{loadStats ? '—' : statsTotal}</div>
          <div className="kpi-delta up"><AdminIcon.TrendUp /><strong>{stats?.paid ?? 0} lunas</strong><span className="kpi-delta-sub">· {stats?.pending ?? 0} pending</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span className="kpi-label">Dibatalkan</span><span className="kpi-icon"><AdminIcon.Door /></span></div>
          <div className="kpi-value">{loadStats ? '—' : stats?.cancelled ?? 0}</div>
          <div className="kpi-delta down"><AdminIcon.TrendDown /><strong>pesanan dibatalkan</strong></div>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Detail <em>Transaksi</em></h3>
            <p className="panel-sub">{dateFrom === firstOfMonth() && dateTo === todayStr() ? 'Bulan ini' : `${dateFrom} s/d ${dateTo}`} — semua tipe (CW, F&B, Bisnis)</p>
          </div>
        </div>
        {loading ? <p className="panel-sub">Memuat data...</p> : rows.length === 0 ? (
          <p className="panel-sub">Tidak ada transaksi pada periode ini.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>No</th><th>Kode</th><th>Tipe</th><th>Nama</th><th>Produk</th><th>Tanggal</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="col-num">{i + 1}</td>
                    <td className="col-title col-num">{r.code}</td>
                    <td><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>{r.type}</span></td>
                    <td>{r.name}</td>
                    <td><div className="cell-media-meta"><span className="t">{r.product}</span></div></td>
                    <td>{fmtDate(r.date)}</td>
                    <td className="col-price">{fmt(r.total)}</td>
                    <td><span className={`status ${r.statusCss}`}>{r.statusLabel}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', fontWeight: 600, padding: '10px 12px' }}>Total Pendapatan (lunas):</td>
                  <td className="col-price" style={{ fontWeight: 700 }}>{fmt(revenue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
