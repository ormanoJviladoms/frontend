import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, Loader2, Star
} from 'lucide-react';

export default function Cart() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [cart, setCart] = useState([]);
    const [comandaId, setComandaId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }
        if (user) {
            loadCart();
        }
    }, [user, authLoading, navigate]);

    const loadCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const resProducts = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const productsData = await resProducts.json();
            const productsList = productsData.status === 'success' ? productsData.data : [];

            const resComandes = await fetch('/api/comandes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const comandesData = await resComandes.json();

            if (comandesData.status === 'success') {
                const pendingComanda = comandesData.data.find(c =>
                    c.estat === 'pendent' &&
                    (c.usuari === user._id || (c.usuari && c.usuari._id === user._id))
                );

                if (pendingComanda) {
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
                                    _id: prodId,
                                    name: d.nom_producte || (dbProd ? dbProd.nom : ''),
                                    price: d.preu_unitari || (dbProd ? dbProd.preu : 0),
                                    image: dbProd ? dbProd.imatge : '',
                                    quantity: d.quantitat,
                                    detallId: d._id,
                                    estoc: dbProd ? dbProd.estoc : 0,
                                };
                            });
                        setCart(cartItems);
                    }
                }
            }
        } catch (err) {
            console.error('Error recuperant la cistella', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (detallId) => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/detallscomanda/${detallId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCart(cart.filter(item => item.detallId !== detallId));
        } catch (error) {
            console.error('Error removing from cart', error);
        }
    };

    const updateQuantity = async (detallId, change) => {
        try {
            const item = cart.find(i => i.detallId === detallId);
            if (!item) return;
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                await removeFromCart(detallId);
                return;
            }
            if (newQuantity > item.estoc) return;

            const token = localStorage.getItem('accessToken');
            await fetch(`/api/detallscomanda/${detallId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantitat: newQuantity })
            });
            setCart(cart.map(i => i.detallId === detallId ? { ...i, quantity: newQuantity } : i));
        } catch (error) {
            console.error('Error updating cart', error);
        }
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans">
            {/* Nav */}
            <nav className="border-b border-slate-800 py-6">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Star className="text-[#0f172a] w-6 h-6 fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">TRUE FACTS</span>
                    </Link>
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">
                        <ChevronLeft size={20} />
                        Seguir Comprant
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">La teva Cistella.</h1>

                {cart.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 space-y-6"
                    >
                        <ShoppingBag size={80} strokeWidth={1} className="mx-auto text-slate-700" />
                        <p className="text-2xl font-bold text-slate-500">La cistella està buida</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all"
                        >
                            EXPLORAR PRODUCTES
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {cart.map((item, idx) => (
                            <motion.div
                                key={item.detallId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex gap-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 group"
                            >
                                <div className="w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                            <p className="text-slate-400 text-sm mt-1">{item.price.toFixed(2)}€ / unitat</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.detallId)}
                                            className="text-slate-500 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-4 bg-slate-800 rounded-2xl px-4 py-2">
                                            <button onClick={() => updateQuantity(item.detallId, -1)} className="hover:text-blue-500 transition-colors">
                                                <Minus size={16} />
                                            </button>
                                            <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.detallId, 1)} className="hover:text-blue-500 transition-colors">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <span className="text-lg font-black text-blue-400">{(item.price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Summary */}
                        <div className="mt-12 bg-slate-800/30 border border-slate-700/50 rounded-3xl p-8 space-y-6">
                            <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                                <span>Productes ({totalItems})</span>
                                <span>{totalPrice.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                                <span>Enviament</span>
                                <span className="text-green-500">Gratuït</span>
                            </div>
                            <div className="h-px bg-slate-700" />
                            <div className="flex justify-between text-white text-3xl font-black">
                                <span>Total</span>
                                <span>{totalPrice.toFixed(2)}€</span>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group"
                            >
                                <span>CONTINUAR AL CHECKOUT</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
