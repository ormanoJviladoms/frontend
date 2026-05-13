import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeEuro,
  Boxes,
  CalendarDays,
  Loader2,
  PackageCheck,
  ReceiptText,
  Settings,
  ShoppingBag,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  pendent: 'bg-amber-100 text-amber-700',
  processant: 'bg-blue-100 text-blue-700',
  enviat: 'bg-indigo-100 text-indigo-700',
  lliurat: 'bg-emerald-100 text-emerald-700',
  'cancel·lat': 'bg-red-100 text-red-700'
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [ordersRes, detailsRes] = await Promise.all([
          fetch('/api/comandes', { headers }),
          fetch('/api/detallscomanda', { headers })
        ]);
        const [ordersData, detailsData] = await Promise.all([ordersRes.json(), detailsRes.json()]);

        if (ordersData.status === 'success') setOrders(ordersData.data);
        if (detailsData.status === 'success') setDetails(detailsData.data);
      } catch (error) {
        console.error('Error carregant dashboard usuari', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completedOrders = orders.filter((order) => order.estat !== 'pendent');
  const pendingOrder = orders.find((order) => order.estat === 'pendent');
  const totalSpent = completedOrders.reduce((sum, order) => sum + (order.import_total || 0), 0);
  const pendingItems = pendingOrder
    ? details.filter((detail) => detail.comanda?._id === pendingOrder._id || detail.comanda === pendingOrder._id)
    : [];

  const lastOrders = useMemo(() => {
    return [...orders]
      .filter((order) => order.estat !== 'pendent')
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-brand-dark">
      <nav className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue">
            <ArrowLeft size={18} />
            Botiga
          </Link>
          <span className="text-xl font-black tracking-tighter">TRUE FACTS</span>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Dashboard usuari</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-3">Hola, {user?.nom}</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/checkout" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-blue">
              <ShoppingBag size={18} />
              Finalitzar compra
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:border-brand-blue hover:text-brand-blue"
            >
              <Settings size={18} />
              Perfil
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Metric icon={ReceiptText} label="Compres fetes" value={completedOrders.length} />
          <Metric icon={BadgeEuro} label="Import gastat" value={`${totalSpent.toFixed(2)} EUR`} />
          <Metric icon={Boxes} label="Productes al carret" value={pendingItems.reduce((sum, item) => sum + item.quantitat, 0)} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <PackageCheck className="text-brand-blue" />
              <h2 className="text-xl font-black">Compres recents</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {lastOrders.length === 0 ? (
                <p className="p-6 text-slate-500">Encara no tens compres completades.</p>
              ) : (
                lastOrders.map((order) => (
                  <div key={order._id} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-black">Comanda #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <CalendarDays size={15} />
                        {new Date(order.data).toLocaleDateString('ca-ES')}
                      </p>
                    </div>
                    <span className={`w-max px-3 py-1 rounded-full text-xs font-black ${statusStyles[order.estat] || 'bg-slate-100 text-slate-700'}`}>
                      {order.estat}
                    </span>
                    <p className="font-black md:text-right">{(order.import_total || 0).toFixed(2)} EUR</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="bg-brand-dark text-white rounded-2xl p-6">
            <UserRound className="text-brand-blue mb-6" size={34} />
            <h2 className="text-2xl font-black mb-6">Gestio de compte</h2>
            <div className="space-y-4 text-sm">
              <Info label="Nom" value={user?.nom} />
              <Info label="Correu" value={user?.correu} />
              <Info label="Telefon" value={user?.telefon || 'No informat'} />
              <Info label="Direccio" value={user?.direccio || 'No informada'} />
              <Link to="/profile" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white font-black hover:bg-blue-500">
                <Settings size={18} />
                Editar perfil
              </Link>
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

function Info({ label, value }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="text-slate-400 font-bold">{label}</p>
      <p className="font-black mt-1 break-words">{value}</p>
    </div>
  );
}
