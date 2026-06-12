import { useState } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { fetchStats, fetchRecentTransactions, RecentTransaction } from '../../lib/adminApi';

const fmt = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

function RevenueChart() {
  const [tab, setTab] = useState(0);
  const TABS = ['6 Bulan', '3 Bulan', '30 Hari'];
  /* Chart shown as placeholder until time-series endpoint is added */
  const data = [
    { label: 'Jan', h: 42 }, { label: 'Feb', h: 55 }, { label: 'Mar', h: 38 },
    { label: 'Apr', h: 65 }, { label: 'Mei', h: 72 }, { label: 'Jun', h: 50 },
  ];
  const max = Math.max(...data.map(d => d.h));
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Revenue <em>Overview</em></h3>
          <p className="panel-sub">Pendapatan booking per bulan</p>
        </div>
        <div className="panel-tab-bar">
          {TABS.map((t, i) => (
            <button key={t} type="button" className={`panel-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="chart">
        {data.map(d => (
          <div key={d.label} className="chart-col">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: `${(d.h / max) * 100}%` }} />
            </div>
            <span className="chart-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TYPE_LABEL: Record<string, string> = { coworking: 'Coworking', fnb: 'F&B', biz: 'Bisnis' };
const TYPE_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled',
  'checked-in': 'Checked In', 'checked-out': 'Checked Out',
  selesai: 'Selesai', proses: 'Proses',
};

function RecentTransactionsPanel({ txns }: { txns: RecentTransaction[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Transaksi <em>Terbaru</em></h3>
          <p className="panel-sub">8 transaksi terakhir (semua jenis)</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Kode</th><th>Jenis</th><th>Produk</th><th>Akun</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {txns.map(t => (
              <tr key={t.code}>
                <td className="col-title col-num">{t.code}</td>
                <td><span className="badge-type">{TYPE_LABEL[t.type] ?? t.type}</span></td>
                <td>{t.label}</td>
                <td>{t.name}</td>
                <td className="col-price">{fmt(t.total)}</td>
                <td><span className={`status ${t.status}`}>{TYPE_STATUS_LABEL[t.status] ?? t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const stats  = useApiGet(() => fetchStats());
  const recent = useApiGet(() => fetchRecentTransactions());
  const recentTxns = recent.data ?? [];

  const revenue = stats.data?.revenue ?? 0;
  const totalBookings = stats.data?.total ?? 0;
  const pending = stats.data?.pending ?? 0;

  const KPI = [
    { label: 'Total Pendapatan', value: fmt(revenue), delta: '+12,4%', type: 'up', sub: 'vs bulan lalu', icon: 'Chart' },
    { label: 'Total Booking',    value: String(totalBookings),                     delta: '+8',     type: 'up', sub: 'minggu ini',   icon: 'Ticket' },
    { label: 'Menunggu Konfirmasi', value: String(pending),                        delta: '',       type: 'up', sub: 'saat ini',    icon: 'Door' },
  ];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Admin <em>Dashboard</em></h1>
          <p className="admin-page-sub">Ringkasan aktivitas terkini</p>
        </div>
        <div className="admin-page-actions">
          <span className="live-link">Live</span>
        </div>
      </div>

      <div className="kpi-grid">
        {KPI.map(k => {
          const Icon = AdminIcon[k.icon as keyof typeof AdminIcon];
          return (
            <div key={k.label} className="kpi-card">
              <div className="kpi-head">
                <span className="kpi-label">{k.label}</span>
                <span className="kpi-icon"><Icon /></span>
              </div>
              <div className="kpi-value">
                {stats.loading ? '—' : k.value}
              </div>
              {k.delta && (
                <div className="kpi-delta up">
                  <AdminIcon.TrendUp />
                  <strong>{k.delta}</strong>
                  <span className="kpi-delta-sub">{k.sub}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="admin-grid-2">
        <RevenueChart />
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Status <em>Booking</em></h3>
              <p className="panel-sub">Distribusi status saat ini</p>
            </div>
          </div>
          {stats.loading ? (
            <p className="panel-sub">Memuat...</p>
          ) : (
            <div style={{ display: 'grid', gap: 12, padding: '4px 0' }}>
              {[
                { label: 'Paid',        value: stats.data?.paid ?? 0,      cls: 'paid'       },
                { label: 'Pending',     value: stats.data?.pending ?? 0,   cls: 'pending'    },
                { label: 'Checked-in',  value: stats.data?.checkedin ?? 0,  cls: 'checked-in'  },
                { label: 'Checked-out', value: stats.data?.checkedout ?? 0, cls: 'checked-out' },
                { label: 'Cancelled',   value: stats.data?.cancelled ?? 0,  cls: 'cancelled'   },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`status ${s.cls}`}>{s.label}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recent.loading
        ? <p className="panel-sub">Memuat transaksi...</p>
        : <RecentTransactionsPanel txns={recentTxns} />}
    </>
  );
}
