import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    ChevronLeft, 
    CreditCard, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck, 
    Package,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

export default function Checkout() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [cart, setCart] = useState([]);
    const [comandaId, setComandaId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [orderResult, setOrderResult] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telefon: '',
        adreca: '',
        metodePagament: 'targeta',
        numTargeta: '',
        caducitat: '',
        cvv: '',
        titular: '',
    });

    // Populate form data once user is loaded
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nom: user.nom || '',
                email: user.correu || '',
                telefon: user.telefon || '',
                adreca: user.direccio || '',
                titular: user.nom || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            const loadContent = async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    // Fetch current products first to match images
                    const resProducts = await fetch('/api/products', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const productsData = await resProducts.json();
                    let productsList = [];
                    if (productsData.status === 'success') {
                        productsList = productsData.data;
                    }

                    // Fetch orders
                    const resComandes = await fetch('/api/comandes', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const comandesData = await resComandes.json();

                    if (comandesData.status === 'success') {
                        const pendingComanda = comandesData.data.find(c =>
                            c.estat === 'pendent' &&
                            (c.usuari === user._id || (c.usuari && c.usuari._id === user._id))
                        );

                        if (!pendingComanda) {
                            navigate('/');
                            return;
                        }

                        setComandaId(pendingComanda._id);

                        const resDetalls = await fetch('/api/detallscomanda', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const detallsData = await resDetalls.json();

                        if (detallsData.status === 'success') {
                            const cartItems = detallsData.data
                                .filter(d => d.comanda && (d.comanda._id === pendingComanda._id || d.comanda === pendingComanda._id))
                                .map(d => {
                                    const prodId = d.producte && (d.producte._id || d.producte);
                                    const dbProd = productsList.find(p => p._id === prodId);
                                    
                                    return {
                                        producte: d.nom_producte || (dbProd ? dbProd.nom : 'Producte'),
                                        quantitat: d.quantitat,
                                        preu: d.preu_unitari || (dbProd ? dbProd.preu : 0),
                                        image: dbProd ? dbProd.imatge : 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80'
                                    };
                                });
                            setCart(cartItems);

                            if (cartItems.length === 0) {
                                navigate('/');
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error carregant checkout', err);
                    setError('Error carregant les dades');
                } finally {
                    setLoading(false);
                }
            };
            loadContent();
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.preu * item.quantitat), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comandaId) return;

        setProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comandaId,
                    pagament: { metode: formData.metodePagament },
                    enviament: { empresa_transport: 'TRUE FACTS EXPRESS' },
                }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                setSuccess(true);
                setOrderResult(data.data);
            } else {
                setError(data.message || 'Error processant el checkout');
            }
        } catch (err) {
            setError('Error de connexió');
        } finally {
            setProcessing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full glass-dark rounded-[2.5rem] p-12 text-center shadow-2xl"
                >
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Fets Confirmats!</h1>
                    <p className="text-slate-400 mb-10 text-lg">La teva comanda ja està en camí. Rebràs els detalls per correu aviat.</p>
                    
                    {orderResult && (
                        <div className="bg-slate-800/50 rounded-3xl p-6 mb-10 text-left border border-slate-700">
                            <div className="flex justify-between mb-4">
                                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">ID Seguiment</span>
                                <span className="text-white font-mono font-bold">{orderResult.enviament.codi_seguiment}</span>
                            </div>
                            <div className="h-px bg-slate-700 my-4" />
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs font-bold">Total Pagat</span>
                                <span className="text-2xl font-black text-blue-400">{orderResult.comanda.import_total.toFixed(2)}€</span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                    >
                        TORNAR A LA BOTIGA
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans">
            {/* Nav Slim */}
            <nav className="border-b border-slate-800 py-6">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black tracking-tighter text-white">TRUE FACTS</Link>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">
                        <ChevronLeft size={20} />
                        Seguir Comprant
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">Check out.</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Form */}
                    <div className="space-y-12">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
                            >
                                <AlertCircle size={20} />
                                <p className="text-sm">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">1</div>
                                    <h2 className="text-xl font-black uppercase tracking-widest">Informació d'Enviament</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Nom Complet</label>
                                        <input 
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
                                        <input 
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Adreça</label>
                                        <input 
                                            name="adreca"
                                            value={formData.adreca}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8 pt-8 border-t border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">2</div>
                                    <h2 className="text-xl font-black uppercase tracking-widest">Mètode de Pagament</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-800/30 border border-blue-600/30 rounded-3xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-600 rounded-xl">
                                                <CreditCard className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Targeta de Crèdit</h4>
                                                <p className="text-xs text-slate-500">Pagament segur encriptat</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="text-blue-500" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Número de Targeta</label>
                                            <input 
                                                name="numTargeta"
                                                value={formData.numTargeta}
                                                onChange={handleChange}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Caducitat</label>
                                            <input 
                                                name="caducitat"
                                                value={formData.caducitat}
                                                onChange={handleChange}
                                                placeholder="MM/AA"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">CVV</label>
                                            <input 
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleChange}
                                                placeholder="123"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono" 
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>PAGAR ARA {totalPrice.toFixed(2)}€</span>
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:pl-12">
                        <div className="glass-dark rounded-[2.5rem] p-8 md:p-12 sticky top-32">
                            <h3 className="text-xl font-black uppercase tracking-widest mb-8">La teva Comanda</h3>
                            
                            <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-16 h-16 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.producte} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-sm text-slate-100 line-clamp-1">{item.producte}</h5>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-slate-500 text-xs">x{item.quantitat}</span>
                                                <span className="text-blue-400 font-bold text-sm">{(item.preu * item.quantitat).toFixed(2)}€</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-slate-800 mb-8" />
                            
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Subtotal</span>
                                    <span>{totalPrice.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Enviament</span>
                                    <span className="text-green-500">Gratuït</span>
                                </div>
                                <div className="flex justify-between text-white text-3xl font-black pt-4">
                                    <span>Total</span>
                                    <span>{totalPrice.toFixed(2)}€</span>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-800/50 rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <ShieldCheck className="text-green-500" size={18} />
                                    <span>Xifratge SSL segur de 256 bits</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <Package className="text-blue-500" size={18} />
                                    <span>Lliurament garantit per SEUR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
