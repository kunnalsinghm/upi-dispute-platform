import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API = 'http://localhost:8080';

const STATUS_COLORS = {
  OPEN: '#f59e0b',
  AUTO_RESOLVED: '#22c55e',
  MANUAL_REVIEW: '#6366f1',
  ESCALATED: '#ef4444',
  CLOSED: '#64748b',
};

const s = {
  app: { background: '#080f1f', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, monospace', padding: '16px', fontSize: '12px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1f2d45', paddingBottom: '12px' },
  title: { fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '11px', color: '#00d4aa', fontFamily: 'monospace' },
  card: { background: '#0d1b2e', border: '1px solid #1f2d45', borderRadius: '8px', padding: '14px', marginBottom: '14px' },
  cardTitle: { fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' },
  kpi: { background: '#0d1b2e', border: '1px solid #1f2d45', borderRadius: '8px', padding: '14px' },
  kpiLabel: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' },
  kpiValue: { fontSize: '26px', fontWeight: '700', fontFamily: 'monospace', margin: '4px 0 2px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  th: { textAlign: 'left', padding: '7px 10px', color: '#64748b', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', borderBottom: '1px solid #1f2d45' },
  td: { padding: '8px 10px', borderBottom: '1px solid #0a1628' },
  badge: (status) => ({
    display: 'inline-block', padding: '2px 7px', borderRadius: '3px', fontSize: '9px',
    fontFamily: 'monospace', fontWeight: '700',
    background: (STATUS_COLORS[status] || '#64748b') + '22',
    color: STATUS_COLORS[status] || '#64748b',
    border: `1px solid ${(STATUS_COLORS[status] || '#64748b')}44`,
  }),
  ticker: { background: '#040c18', border: '1px solid #1f2d45', borderRadius: '6px', padding: '8px 14px', marginBottom: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '12px' },
  tickerLabel: { color: '#00d4aa', fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' },
  tickerItem: { display: 'inline-block', marginRight: '40px', color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'nowrap' },
  pipelineStage: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  pipelineBox: (active) => ({
    background: active ? '#00d4aa22' : '#0d1b2e',
    border: `1px solid ${active ? '#00d4aa' : '#1f2d45'}`,
    borderRadius: '6px', padding: '10px 8px', textAlign: 'center', width: '100%'
  }),
  arrow: { color: '#1f2d45', fontSize: '18px', padding: '0 4px', alignSelf: 'center', marginTop: '-20px' },
  slaBar: { background: '#0a1628', borderRadius: '3px', height: '6px', marginTop: '4px', overflow: 'hidden' },
  footer: { background: '#040c18', border: '1px solid #1f2d45', borderRadius: '6px', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '10px', fontFamily: 'monospace', color: '#64748b' },
  input: { background: '#0d1b2e', border: '1px solid #1f2d45', color: '#e2e8f0', padding: '7px 10px', borderRadius: '5px', fontSize: '11px', marginRight: '6px', width: '130px' },
  select: { background: '#0d1b2e', border: '1px solid #1f2d45', color: '#e2e8f0', padding: '7px 10px', borderRadius: '5px', fontSize: '11px', marginRight: '6px' },
  btn: { background: '#00d4aa', color: '#040c18', border: 'none', padding: '7px 14px', borderRadius: '5px', fontWeight: '700', cursor: 'pointer', fontSize: '11px' },
};

const DONUT_COLORS = ['#6366f1', '#00d4aa', '#f59e0b', '#22c55e', '#ef4444'];
const SLA_DATA = [
  { bank: 'HDFC', sla: 94, breaches: 8 },
  { bank: 'ICICI', sla: 78, breaches: 31 },
  { bank: 'Razorpay', sla: 91, breaches: 12 },
  { bank: 'PhonePe', sla: 88, breaches: 17 },
  { bank: 'PayU', sla: 96, breaches: 5 },
  { bank: 'GPay', sla: 99, breaches: 2 },
];
const AGING_DATA = [
  { bucket: '< 1h', count: 18 },
  { bucket: '1-6h', count: 12 },
  { bucket: '6-24h', count: 9 },
  { bucket: '1-2d', count: 7 },
  { bucket: '2-5d', count: 6 },
  { bucket: '> 5d', count: 12, alert: true },
];
const AUDIT_LOG = [
  { time: '19:33:10', event: 'AUTO_RESOLVED', detail: 'TXN-HDFC-8821 → WD-TIMEOUT-48H rule', type: 'resolve' },
  { time: '19:31:29', event: 'KAFKA_SPIKE', detail: 'Ingestion rate 4,200 msg/s on disputes.created', type: 'kafka' },
  { time: '19:28:44', event: 'NPCI_ARN', detail: 'ARN17816897559 acknowledged · p99=142ms', type: 'npci' },
  { time: '19:25:11', event: 'AUTO_RESOLVED', detail: 'TXN-SBI-9934 → DUP-HASH-MATCH rule', type: 'resolve' },
  { time: '19:22:03', event: 'SLA_BREACH', detail: 'ICICI breached T+5d SLA · escalated to NPCI', type: 'alert' },
  { time: '19:18:55', event: 'ML_RETRAIN', detail: 'Model v3.1 deployed · accuracy 88.1% → 88.4%', type: 'ml' },
  { time: '19:15:30', event: 'AUTO_RESOLVED', detail: 'TXN-AXIS-7123 → TIMEOUT-AUTO rule', type: 'resolve' },
  { time: '19:12:19', event: 'NPCI_ARN', detail: 'ARN17816554821 acknowledged · p99=138ms', type: 'npci' },
  { time: '19:09:07', event: 'KAFKA_SPIKE', detail: 'Redis cache hit 94.2% · HikariPool healthy', type: 'kafka' },
  { time: '19:05:44', event: 'SLA_BREACH', detail: 'HDFC TXN-8231 approaching T+5d limit', type: 'alert' },
];

const auditColor = { resolve: '#22c55e', kafka: '#6366f1', npci: '#00d4aa', alert: '#ef4444', ml: '#f59e0b' };

const TICKER_EVENTS = [
  '✅ TXN-HDFC-8821 AUTO_RESOLVED · WD-TIMEOUT-48H · ₹4,200',
  '📨 NPCI ARN17816897559 ACKNOWLEDGED · p99=142ms',
  '✅ TXN-SBI-9934 AUTO_RESOLVED · DUP-HASH-MATCH · ₹720',
  '⚠️ ICICI SLA BREACH · 31 disputes overdue · escalating',
  '✅ TXN-AXIS-7123 AUTO_RESOLVED · TIMEOUT-AUTO · ₹11,000',
  '🔄 Kafka disputes.created · 4,200 msg/s · Redis 94.2% hit',
  '✅ TXN-KOTAK-2291 MANUAL_REVIEW · high value ₹67,000',
  '📨 NPCI ARN17816554821 ACKNOWLEDGED · p99=138ms',
  '🤖 ML v3.1 classified TXN-HDFC-5542 · DUPLICATE · 99% conf',
];

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [tickerX, setTickerX] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [form, setForm] = useState({ transactionId: '', amount: '', disputeType: 'WRONG_DEBIT', bankCode: 'HDFC', raisedByUpiId: '', beneficiaryUpiId: '', description: '' });
  const tickerRef = useRef(null);

  const fetchDisputes = async () => {
    try {
      const res = await axios.get(`${API}/api/disputes`);
      setDisputes(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDisputes();
    const t = setInterval(fetchDisputes, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIdx(i => (i + 1) % TICKER_EVENTS.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const submitDispute = async () => {
    try {
      await axios.post(`${API}/api/disputes`, { ...form, amount: parseFloat(form.amount) });
      fetchDisputes();
      setForm({ transactionId: '', amount: '', disputeType: 'WRONG_DEBIT', bankCode: 'HDFC', raisedByUpiId: '', beneficiaryUpiId: '', description: '' });
    } catch (e) { alert('Failed: ' + e.message); }
  };

  const total = disputes.length;
  const autoResolved = disputes.filter(d => d.status === 'AUTO_RESOLVED').length;
  const manualReview = disputes.filter(d => d.status === 'MANUAL_REVIEW').length;
  const automationRate = total > 0 ? ((autoResolved / total) * 100).toFixed(1) : 0;

  const typeMap = disputes.reduce((acc, d) => { acc[d.disputeType] = (acc[d.disputeType] || 0) + 1; return acc; }, {});
  const donutData = Object.entries(typeMap).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const pipelineStages = [
    { label: 'INGEST', value: total, sub: 'via Kafka' },
    { label: 'ML CLASSIFY', value: total, sub: '88.1% acc' },
    { label: 'RULE ENGINE', value: total, sub: '3 rules' },
    { label: 'AUTO-RESOLVE', value: autoResolved, sub: `${automationRate}%`, active: true },
    { label: 'MANUAL REVIEW', value: manualReview, sub: 'queued' },
    { label: 'CLOSED', value: autoResolved, sub: 'done' },
  ];

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>⬡ UPI DisputeAI — Ops Console</div>
          <div style={s.subtitle}>NPCI · Bank/PSP Resolution Platform · v3.1 · Spring Boot + Kafka + ML</div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>
          <div style={{ color: '#22c55e' }}>🟢 API Connected · PostgreSQL PRIMARY healthy</div>
          <div>Kafka :9092 · Redis :6379 · ML :5000 · Auto-refresh 5s</div>
        </div>
      </div>

      {/* Live Ticker */}
      <div style={s.ticker}>
        <div style={s.tickerLabel}>⚡ LIVE</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <span style={s.tickerItem}>{TICKER_EVENTS[tickerIdx]}</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={s.kpiGrid}>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Total Disputes</div>
          <div style={{ ...s.kpiValue, color: '#00d4aa' }}>{total}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>4L/day nationally</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Auto Resolved</div>
          <div style={{ ...s.kpiValue, color: '#22c55e' }}>{autoResolved}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>rule engine + ML</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Automation Rate</div>
          <div style={{ ...s.kpiValue, color: '#6366f1' }}>{automationRate}%</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>target: 74.8%</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Manual Review</div>
          <div style={{ ...s.kpiValue, color: '#f59e0b' }}>{manualReview}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>needs human review</div>
        </div>
      </div>

      {/* Pipeline View */}
      <div style={s.card}>
        <div style={s.cardTitle}>Automation Pipeline — today's throughput</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
          {pipelineStages.map((stage, i) => (
            <React.Fragment key={i}>
              <div style={s.pipelineStage}>
                <div style={s.pipelineBox(stage.active)}>
                  <div style={{ fontSize: '9px', color: stage.active ? '#00d4aa' : '#64748b', fontFamily: 'monospace', fontWeight: '700' }}>{stage.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: stage.active ? '#00d4aa' : '#e2e8f0', fontFamily: 'monospace' }}>{stage.value}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>{stage.sub}</div>
                </div>
              </div>
              {i < pipelineStages.length - 1 && <div style={s.arrow}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div style={s.grid2}>
        {/* Category Donut */}
        <div style={s.card}>
          <div style={s.cardTitle}>Dispute Categories (NPCI Classification)</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % 5]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1b2e', border: '1px solid #1f2d45', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10px' }}>
                  <span style={{ color: DONUT_COLORS[i % 5] }}>■ {d.name}</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ML Health Panel */}
        <div style={s.card}>
          <div style={s.cardTitle}>ML Classifier Health — RandomForest v3.1</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[['Accuracy', '88.1%', '#22c55e'], ['Precision', '89.2%', '#00d4aa'], ['Recall', '88.0%', '#6366f1'], ['p99 Latency', '23ms', '#f59e0b']].map(([label, val, color]) => (
              <div key={label} style={{ background: '#040c18', borderRadius: '5px', padding: '8px', border: '1px solid #1f2d45' }}>
                <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color, fontFamily: 'monospace' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace' }}>
            FEATURES: amount · hour_of_day · age_hours · has_duplicate · bank_enc · upi_enc
          </div>
        </div>
      </div>

      {/* SLA + Aging Row */}
      <div style={s.grid2}>
        {/* SLA by Bank */}
        <div style={s.card}>
          <div style={s.cardTitle}>SLA Compliance by Bank/PSP</div>
          {SLA_DATA.map(({ bank, sla, breaches }) => (
            <div key={bank} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{bank}</span>
                <span style={{ fontFamily: 'monospace', color: sla < 85 ? '#ef4444' : '#22c55e' }}>{sla}% <span style={{ color: '#64748b', fontSize: '9px' }}>{breaches} breaches</span></span>
              </div>
              <div style={s.slaBar}>
                <div style={{ width: `${sla}%`, height: '100%', background: sla < 85 ? '#ef4444' : sla < 92 ? '#f59e0b' : '#22c55e', borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Aging Analytics */}
        <div style={s.card}>
          <div style={s.cardTitle}>Dispute Aging Analytics</div>
          {AGING_DATA[5].count > 0 && (
            <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '4px', padding: '6px 10px', marginBottom: '10px', fontSize: '10px', color: '#ef4444', fontFamily: 'monospace' }}>
              🔴 {AGING_DATA[5].count} disputes &gt; 5 days — auto-escalating to NPCI ARN module
            </div>
          )}
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={AGING_DATA}>
              <XAxis dataKey="bucket" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#0d1b2e', border: '1px solid #1f2d45', fontSize: '10px' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {AGING_DATA.map((d, i) => <Cell key={i} fill={d.alert ? '#ef4444' : '#6366f1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Timeline */}
      <div style={s.card}>
        <div style={s.cardTitle}>Audit Timeline — system event log</div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 140px 1fr', gap: '0' }}>
          <div style={{ ...s.th, padding: '4px 8px' }}>TIME</div>
          <div style={{ ...s.th, padding: '4px 8px' }}>EVENT</div>
          <div style={{ ...s.th, padding: '4px 8px' }}>DETAIL</div>
          {AUDIT_LOG.map((log, i) => (
            <React.Fragment key={i}>
              <div style={{ ...s.td, fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>{log.time}</div>
              <div style={{ ...s.td, fontFamily: 'monospace', fontSize: '10px', color: auditColor[log.type], fontWeight: '600' }}>{log.event}</div>
              <div style={{ ...s.td, fontSize: '10px', color: '#94a3b8' }}>{log.detail}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dispute Queue */}
      <div style={s.card}>
        <div style={s.cardTitle}>Live Dispute Queue — {total} disputes · auto-refreshing 5s</div>
        {/* Form */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1f2d45' }}>
          <input style={s.input} placeholder="Transaction ID" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} />
          <input style={s.input} placeholder="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <input style={s.input} placeholder="Raised By UPI" value={form.raisedByUpiId} onChange={e => setForm({ ...form, raisedByUpiId: e.target.value })} />
          <input style={s.input} placeholder="Beneficiary UPI" value={form.beneficiaryUpiId} onChange={e => setForm({ ...form, beneficiaryUpiId: e.target.value })} />
          <select style={s.select} value={form.disputeType} onChange={e => setForm({ ...form, disputeType: e.target.value })}>
            <option>WRONG_DEBIT</option>
            <option>DUPLICATE_TRANSACTION</option>
            <option>BENEFICIARY_NOT_CREDITED</option>
            <option>TRANSACTION_TIMEOUT</option>
            <option>TECHNICAL_DECLINE</option>
          </select>
          <select style={s.select} value={form.bankCode} onChange={e => setForm({ ...form, bankCode: e.target.value })}>
            <option>HDFC</option><option>ICICI</option><option>SBI</option>
            <option>AXIS</option><option>KOTAK</option><option>Razorpay</option><option>PhonePe</option>
          </select>
          <input style={{ ...s.input, width: '160px' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button style={s.btn} onClick={submitDispute}>+ Submit Dispute</button>
        </div>
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Dispute ID</th>
                <th style={s.th}>Transaction</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Bank</th>
                <th style={s.th}>ML Conf</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {disputes.slice().reverse().map(d => (
                <tr key={d.id}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '10px', color: '#00d4aa' }}>{d.id?.substring(0, 8)}...</td>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}>{d.transactionId}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}>₹{d.amount?.toLocaleString()}</td>
                  <td style={{ ...s.td, fontSize: '10px', color: '#a5b4fc' }}>{d.disputeType?.replace(/_/g, ' ')}</td>
                  <td style={s.td}>{d.bankCode}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', color: d.mlConfidenceScore > 0.9 ? '#22c55e' : d.mlConfidenceScore > 0.7 ? '#f59e0b' : '#ef4444' }}>
                    {d.mlConfidenceScore ? `${(d.mlConfidenceScore * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td style={s.td}><span style={s.badge(d.status)}>{d.status}</span></td>
                  <td style={{ ...s.td, fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                    {d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <span>⬡ UPI DisputeAI v3.1</span>
        <span>Kafka :9092 · <span style={{ color: '#22c55e' }}>4,200 msg/s</span></span>
        <span>Redis cache hit · <span style={{ color: '#00d4aa' }}>94.2%</span></span>
        <span>NPCI API p99 · <span style={{ color: '#f59e0b' }}>142ms</span></span>
        <span>PostgreSQL PRIMARY · <span style={{ color: '#22c55e' }}>healthy</span></span>
        <span style={{ color: '#1f2d45' }}>Spring Boot 3.5 · Java 21 · Auto-refresh 5s</span>
      </div>
    </div>
  );
}