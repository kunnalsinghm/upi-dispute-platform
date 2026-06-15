import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = 'http://localhost:8080';

const STATUS_COLORS = {
  OPEN: '#f59e0b',
  AUTO_RESOLVED: '#22c55e',
  MANUAL_REVIEW: '#6366f1',
  ESCALATED: '#ef4444',
  CLOSED: '#64748b',
};

const styles = {
  app: { background: '#0a1628', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: '12px', color: '#00d4aa', fontFamily: 'monospace' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  kpi: { background: '#111827', border: '1px solid #1f2d45', borderRadius: '10px', padding: '16px' },
  kpiLabel: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' },
  kpiValue: { fontSize: '28px', fontWeight: '700', fontFamily: 'monospace', margin: '6px 0 2px' },
  card: { background: '#111827', border: '1px solid #1f2d45', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
  cardTitle: { fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', padding: '8px 12px', color: '#64748b', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', borderBottom: '1px solid #1f2d45' },
  td: { padding: '10px 12px', borderBottom: '1px solid #111' },
  badge: (status) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
    fontFamily: 'monospace', fontWeight: '600',
    background: STATUS_COLORS[status] + '22',
    color: STATUS_COLORS[status],
    border: `1px solid ${STATUS_COLORS[status]}44`,
  }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  btn: { background: '#00d4aa', color: '#0a1628', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' },
  input: { background: '#1a2235', border: '1px solid #1f2d45', color: '#e2e8f0', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginRight: '8px', width: '140px' },
  select: { background: '#1a2235', border: '1px solid #1f2d45', color: '#e2e8f0', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginRight: '8px' },
};

const COLORS = ['#00d4aa', '#6366f1', '#f59e0b', '#ef4444', '#64748b'];

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ transactionId: '', amount: '', disputeType: 'WRONG_DEBIT', bankCode: 'HDFC', raisedByUpiId: '', beneficiaryUpiId: '', description: '' });

  const fetchDisputes = async () => {
    try {
      const res = await axios.get(`${API}/api/disputes`);
      setDisputes(res.data);
    } catch (e) {
      console.error('Failed to fetch disputes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDisputes(); const t = setInterval(fetchDisputes, 5000); return () => clearInterval(t); }, []);

  const submitDispute = async () => {
    try {
      await axios.post(`${API}/api/disputes`, { ...form, amount: parseFloat(form.amount) });
      fetchDisputes();
      setForm({ transactionId: '', amount: '', disputeType: 'WRONG_DEBIT', bankCode: 'HDFC', raisedByUpiId: '', beneficiaryUpiId: '', description: '' });
    } catch (e) { alert('Failed to create dispute: ' + e.message); }
  };

  // KPI calculations
  const total = disputes.length;
  const autoResolved = disputes.filter(d => d.status === 'AUTO_RESOLVED').length;
  const manualReview = disputes.filter(d => d.status === 'MANUAL_REVIEW').length;
  const automationRate = total > 0 ? ((autoResolved / total) * 100).toFixed(1) : 0;

  // Chart data
  const statusData = Object.entries(
    disputes.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const typeData = Object.entries(
    disputes.reduce((acc, d) => { acc[d.disputeType] = (acc[d.disputeType] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' ').substring(0, 12), value }));

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>⬡ UPI DisputeAI Dashboard</div>
          <div style={styles.subtitle}>NPCI · Real-time Resolution Platform · v2.4</div>
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
          🟢 API Connected · Auto-refresh 5s
        </div>
      </div>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>Total Disputes</div>
          <div style={{ ...styles.kpiValue, color: '#00d4aa' }}>{total}</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>Auto Resolved</div>
          <div style={{ ...styles.kpiValue, color: '#22c55e' }}>{autoResolved}</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>Automation Rate</div>
          <div style={{ ...styles.kpiValue, color: '#6366f1' }}>{automationRate}%</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>Manual Review</div>
          <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{manualReview}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Disputes by Status</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={Object.values(STATUS_COLORS)[i % 5]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2d45', color: '#e2e8f0', fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Disputes by Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2d45', color: '#e2e8f0', fontSize: '11px' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Create Dispute Form */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>+ Raise New Dispute</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input style={styles.input} placeholder="Transaction ID" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} />
          <input style={styles.input} placeholder="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <input style={styles.input} placeholder="Raised By UPI" value={form.raisedByUpiId} onChange={e => setForm({ ...form, raisedByUpiId: e.target.value })} />
          <input style={styles.input} placeholder="Beneficiary UPI" value={form.beneficiaryUpiId} onChange={e => setForm({ ...form, beneficiaryUpiId: e.target.value })} />
          <select style={styles.select} value={form.disputeType} onChange={e => setForm({ ...form, disputeType: e.target.value })}>
            <option>WRONG_DEBIT</option>
            <option>DUPLICATE_TRANSACTION</option>
            <option>BENEFICIARY_NOT_CREDITED</option>
            <option>TRANSACTION_TIMEOUT</option>
            <option>TECHNICAL_DECLINE</option>
          </select>
          <select style={styles.select} value={form.bankCode} onChange={e => setForm({ ...form, bankCode: e.target.value })}>
            <option>HDFC</option><option>ICICI</option><option>SBI</option>
            <option>AXIS</option><option>KOTAK</option><option>Razorpay</option><option>PhonePe</option>
          </select>
          <input style={{ ...styles.input, width: '180px' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button style={styles.btn} onClick={submitDispute}>Submit Dispute</button>
        </div>
      </div>

      {/* Dispute Table */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Live Dispute Queue — {total} disputes · auto-refreshing every 5s</div>
        {loading ? <div style={{ color: '#64748b', fontFamily: 'monospace' }}>Loading disputes...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Dispute ID</th>
                  <th style={styles.th}>Transaction</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Bank</th>
                  <th style={styles.th}>Confidence</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {disputes.slice().reverse().map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }}>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '10px', color: '#00d4aa' }}>{d.id?.substring(0, 8)}...</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '11px' }}>{d.transactionId}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>₹{d.amount?.toLocaleString()}</td>
                    <td style={{ ...styles.td, fontSize: '10px', color: '#a5b4fc' }}>{d.disputeType?.replace('_', ' ')}</td>
                    <td style={styles.td}>{d.bankCode}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', color: d.mlConfidenceScore > 0.9 ? '#22c55e' : '#f59e0b' }}>
                      {d.mlConfidenceScore ? `${(d.mlConfidenceScore * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td style={styles.td}><span style={styles.badge(d.status)}>{d.status}</span></td>
                    <td style={{ ...styles.td, fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}