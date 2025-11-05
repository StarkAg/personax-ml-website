import React, { useEffect, useState } from 'react';
// This single-file React component is a production-ready starting dashboard for
// "E-commerce Customer Persona Development". It uses Tailwind CSS for styling
// and Recharts for charts. Replace the fetch URL with your backend endpoint.

// Dependencies (add to package.json):
// "react", "react-dom", "recharts", "lucide-react" (optional icons)

export default function EcommercePersonaDashboard() {
  const [data, setData] = useState([]); // customers with rfm + cluster + pca_x + pca_y
  const [centroids, setCentroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cluster: 'all', minRecency: 0, maxRecency: 9999 });
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    // Expecting endpoint /api/rfm that returns JSON: { customers: [...], centroids: [...]} 
    // each customer: { customer_id, recency_days, frequency_orders, monetary_total_sales, cluster, pca_x, pca_y }
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/rfm_with_clusters.json');
        const json = await res.json();
        setData(json.customers || []);
        setCentroids(json.centroids || []);
        const uniq = Array.from(new Set((json.customers||[]).map(c=>c.cluster))).sort();
        setClusters(uniq);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // derived metrics
  const filtered = data.filter(d => (filters.cluster === 'all' || d.cluster === filters.cluster) && d.recency_days >= filters.minRecency && d.recency_days <= filters.maxRecency);
  const summary = {
    totalCustomers: new Set(filtered.map(d => d.customer_id)).size,
    totalOrders: filtered.reduce((s, r) => s + (r.frequency_orders||0), 0),
    totalRevenue: filtered.reduce((s, r) => s + (r.monetary_total_sales||0), 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">E-commerce Personas — Dashboard</h1>
        <p className="text-sm text-slate-600">RFM segmentation visualizer & customer explorer</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Summary cards */}
        <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Customers" value={summary.totalCustomers} />
          <Card title="Orders (sum)" value={summary.totalOrders} />
          <Card title="Revenue (sum)" value={formatCurrency(summary.totalRevenue)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* PCA scatter + cluster selector */}
          <Panel title="PCA scatter (2D) — clusters">
            <PCAChart data={filtered} centroids={centroids} />
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel title="Recency distribution">
              <MiniHistogram data={filtered} field="recency_days" />
            </Panel>
            <Panel title="Frequency distribution">
              <MiniHistogram data={filtered} field="frequency_orders" />
            </Panel>
            <Panel title="Monetary distribution">
              <MiniHistogram data={filtered} field="monetary_total_sales" logScale />
            </Panel>
          </div>
        </div>

        <aside className="space-y-4">
          <Panel title="Filters & Clusters">
            <div className="space-y-3">
              <label className="block text-sm font-medium">Cluster</label>
              <select value={filters.cluster} onChange={e=>setFilters({...filters, cluster: e.target.value})} className="w-full p-2 border rounded">
                <option value="all">All</option>
                {clusters.map(c=> <option key={c} value={c}>Cluster {c}</option>)}
              </select>

              <label className="block text-sm font-medium">Recency range (days)</label>
              <div className="flex gap-2">
                <input type="number" value={filters.minRecency} onChange={e=>setFilters({...filters, minRecency: Number(e.target.value)})} className="w-1/2 p-2 border rounded" />
                <input type="number" value={filters.maxRecency} onChange={e=>setFilters({...filters, maxRecency: Number(e.target.value)})} className="w-1/2 p-2 border rounded" />
              </div>

              <div className="pt-3">
                <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={()=>{setFilters({cluster:'all', minRecency:0, maxRecency:9999})}}>Reset filters</button>
              </div>
            </div>
          </Panel>

          <Panel title="Cluster summary">
            <div className="space-y-2">
              {centroids.map((c, i) => (
                <div key={i} className="p-2 border rounded">
                  <div className="font-semibold">Cluster {c.cluster}</div>
                  <div className="text-sm text-slate-600">R: {round(c.recency,1)} · F: {round(c.frequency,1)} · M: {formatCurrency(c.monetary)}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Actions">
            <div className="flex flex-col gap-2">
              <a href="/download/rfm_with_clusters.csv" className="text-sm underline">Download CSV (rfm_with_clusters.csv)</a>
              <a href="/download/centroids.csv" className="text-sm underline">Download centroids.csv</a>
              <button className="mt-2 px-3 py-2 border rounded" onClick={()=>window.print()}>Print report</button>
            </div>
          </Panel>
        </aside>
      </div>

      <div className="mt-6">
        <Panel title="Customer table">
          <CustomerTable data={filtered.slice(0,200)} />
          <div className="text-xs text-slate-500 mt-2">Showing first 200 rows. Implement server-side pagination for full dataset.</div>
        </Panel>
      </div>

      {loading && <div className="fixed inset-0 flex items-end justify-center p-6 pointer-events-none"><div className="bg-white px-4 py-2 rounded shadow">Loading…</div></div>}
    </div>
  );
}

/* ---------------------------- Helper components --------------------------- */
function Card({ title, value }){
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? '-'}</div>
    </div>
  );
}

function Panel({ title, children }){
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function formatCurrency(n){
  if (n == null) return '-';
  return new Intl.NumberFormat('en-IN',{ maximumFractionDigits:0, style:'currency', currency:'INR' }).format(n);
}
function round(n,d=2){return Math.round((n+Number.EPSILON)*Math.pow(10,d))/Math.pow(10,d);} 

/* ---------------------------- Charts (Recharts) --------------------------- */
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function PCAChart({ data, centroids }){
  // data points: { pca_x, pca_y, cluster }
  const points = data.map(d=>({ x: d.pca_x, y: d.pca_y, cluster: d.cluster, id: d.customer_id }));
  const centroidPoints = (centroids||[]).map(c=>({ x: c.pca_x, y: c.pca_y, cluster: c.cluster }));

  return (
    <div style={{height:360}}>
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="PCA1" />
          <YAxis type="number" dataKey="y" name="PCA2" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="customers" data={points} fill="#8884d8" />
          {centroidPoints.map((c,i)=>(<Scatter key={i} name={`centroid-${c.cluster}`} data={[c]} fill="#ff7f0e" />))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniHistogram({ data, field, logScale }){
  // create simple buckets
  const values = data.map(d=>Number(d[field]||0)).filter(v=>!isNaN(v));
  if (values.length === 0) return <div className="text-sm text-slate-500">No data</div>;
  const min = Math.min(...values), max = Math.max(...values);
  const buckets = 10;
  const size = (max - min) / buckets || 1;
  const hist = new Array(buckets).fill(0);
  values.forEach(v => {
    let idx = Math.floor((v - min) / size);
    if (idx >= buckets) idx = buckets-1;
    hist[idx]++;
  });
  const chartData = hist.map((count,i)=>({ name: `${Math.round(min + i*size)}`, count }));
  return (
    <div style={{height:120}}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <Bar dataKey="count" />
          <XAxis dataKey="name" hide />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomerTable({ data }){
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 text-left">Customer ID</th>
            <th className="p-2 text-left">Cluster</th>
            <th className="p-2 text-right">Recency</th>
            <th className="p-2 text-right">Frequency</th>
            <th className="p-2 text-right">Monetary</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r,i)=> (
            <tr key={i} className={i%2? 'bg-white' : 'bg-slate-50'}>
              <td className="p-2">{r.customer_id}</td>
              <td className="p-2">{r.cluster}</td>
              <td className="p-2 text-right">{r.recency_days}</td>
              <td className="p-2 text-right">{r.frequency_orders}</td>
              <td className="p-2 text-right">{formatCurrency(r.monetary_total_sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------- Notes for backend --------------------------- */
/*
Server expectations (you can implement with Flask, FastAPI, Node/Express):
GET /api/rfm -> { customers: [...], centroids: [...] }
- customers: array of objects with keys: customer_id, recency_days, frequency_orders, monetary_total_sales, cluster, pca_x, pca_y
- centroids: array of objects with keys: cluster, recency, frequency, monetary, pca_x, pca_y

If you already have CSVs (rfm_with_clusters.csv, centroids.csv) you can create an endpoint that reads them and serves JSON.

Quick dev run:
- Create React app or Vite app
- Add Tailwind (follow Tailwind docs)
- npm install recharts lucide-react
- Add this file and import into App.jsx

Enhancements you may want:
- Server-side pagination and search for customer table
- Drill-down view per cluster with sample customers
- Exportable PNG/PDF charts (use html2canvas or server-side rendering)
- Authentication and role-based view (marketing vs analyst)
*/