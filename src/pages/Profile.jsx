import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    telefon: user?.telefon || '',
    direccio: user?.direccio || ''
  });

  const dashboardPath = user?.rol === 'admin' ? '/admin/dashboard' : '/dashboard';

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.status === 'success') {
        updateUser(data.data);
        setMessage('Perfil actualitzat correctament.');
      } else {
        setMessage(data.message || 'No s\'han pogut guardar els canvis.');
      }
    } catch {
      setMessage('Error de connexio amb el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-100 text-brand-dark">
      <nav className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue">
            <ArrowLeft size={18} />
            Botiga
          </Link>
          <span className="text-xl font-black tracking-tighter">TRUE FACTS</span>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-6">
          <aside className="bg-brand-dark text-white rounded-2xl p-8 h-max">
            <div className="w-20 h-20 rounded-2xl bg-brand-blue flex items-center justify-center mb-6">
              <UserRound size={42} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">El meu perfil</p>
            <h1 className="text-4xl font-black tracking-tighter mt-3 break-words">{user?.nom}</h1>
            <p className="mt-3 text-slate-300 break-words">{user?.correu}</p>

            <div className="mt-8 space-y-3">
              <Badge icon={ShieldCheck} label={`Rol: ${user?.rol}`} />
              <Badge icon={Mail} label={user?.correu} />
              <Badge icon={Phone} label={user?.telefon || 'Telefon no informat'} />
              <Badge icon={MapPin} label={user?.direccio || 'Direccio no informada'} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3">
              <Link
                to={dashboardPath}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-dark px-5 py-3 font-black hover:bg-blue-50"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 font-black text-red-200 hover:bg-red-500/20"
              >
                <LogOut size={18} />
                Tancar sessio
              </button>
            </div>
          </aside>

          <section className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Dades personals</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mt-3">Edita el compte</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileField
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
              <ProfileField label="Correu" value={user?.correu || ''} disabled />
              <ProfileField
                label="Telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
              />
              <ProfileField
                label="Direccio"
                name="direccio"
                value={formData.direccio}
                onChange={handleChange}
              />

              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-6 py-4 font-black text-white hover:bg-brand-blue disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar canvis
                </button>
                {message && <p className="font-bold text-slate-600">{message}</p>}
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">
      {React.createElement(Icon, { size: 18, className: 'text-blue-300 flex-shrink-0' })}
      <span className="break-words">{label}</span>
    </div>
  );
}

function ProfileField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-brand-dark outline-none focus:border-brand-blue focus:bg-white disabled:text-slate-400"
      />
    </label>
  );
}
