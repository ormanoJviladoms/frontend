import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import {
  ArrowLeft,
  BadgeEuro,
  Boxes,
  Loader2,
  Package,
  ShieldCheck,
  ShoppingCart,
  UsersRound
} from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { boxWidth: 10, color: '#334155' } }
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/comandes', { headers }),
          fetch('/api/products', { headers })
        ]);
        const [usersData, ordersData, productsData] = await Promise.all([
          usersRes.json(),
          ordersRes.json(),
          productsRes.json()
        ]);

        if (usersData.status === 'success') setUsers(usersData.data);
        if (ordersData.status === 'success') setOrders(ordersData.data);
        if (productsData.status === 'success') setProducts(productsData.data);
      } catch (error) {
        console.error('Error carregant dashboard admin', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalRevenue = orders
    .filter((order) => order.estat !== 'pendent' && order.estat !== 'cancel·lat')
    .reduce((sum, order) => sum + (order.import_total || 0), 0);

  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.estat] = (acc[order.estat] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.categoria] = (acc[product.categoria] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-brand-dark">
      <nav className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
            Botiga
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-300">
            <ShieldCheck size={18} />
            Admin
          </span>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Dashboard administrador</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-3">Control de la botiga</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <Metric icon={UsersRound} label="Usuaris" value={users.length} />
          <Metric icon={Package} label="Productes" value={products.length} />
          <Metric icon={ShoppingCart} label="Comandes" value={orders.length} />
          <Metric icon={BadgeEuro} label="Ingressos" value={`${totalRevenue.toFixed(2)} EUR`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-6">Comandes per estat</h2>
            <div className="h-72">
              <Bar
                options={chartOptions}
                data={{
                  labels: Object.keys(ordersByStatus),
                  datasets: [{
                    label: 'Comandes',
                    data: Object.values(ordersByStatus),
                    backgroundColor: '#2563eb'
                  }]
                }}
              />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-6">Productes per categoria</h2>
            <div className="h-72">
              <Doughnut
                options={chartOptions}
                data={{
                  labels: Object.keys(productsByCategory),
                  datasets: [{
                    label: 'Productes',
                    data: Object.values(productsByCategory),
                    backgroundColor: ['#0f172a', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444']
                  }]
                }}
              />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <UsersRound className="text-brand-blue" />
              <h2 className="text-xl font-black">Gestio d'usuaris</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="p-4">Usuari</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((item) => (
                    <tr key={item._id}>
                      <td className="p-4">
                        <p className="font-black">{item.nom}</p>
                        <p className="text-sm text-slate-500">{item.correu}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${item.rol === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {item.rol}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString('ca-ES')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="bg-slate-950 text-white rounded-2xl p-6">
            <Boxes className="text-brand-blue mb-6" size={34} />
            <h2 className="text-2xl font-black mb-6">Estoc baix</h2>
            <div className="space-y-4">
              {products.filter((product) => product.estoc <= 5).slice(0, 6).map((product) => (
                <div key={product._id} className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <p className="font-black">{product.nom}</p>
                    <p className="text-sm text-slate-400">{product.categoria}</p>
                  </div>
                  <span className="text-amber-300 font-black">{product.estoc}</span>
                </div>
              ))}
              {products.every((product) => product.estoc > 5) && (
                <p className="text-slate-400">No hi ha alertes d'estoc.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      {React.createElement(Icon, { className: 'text-brand-blue mb-5', size: 30 })}
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}
