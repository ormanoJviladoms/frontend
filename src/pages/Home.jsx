import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    LogOut,
    X,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    Star,
    CheckCircle2,
    Loader2
} from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [comandaId, setComandaId] = useState(null);
    const [dbProducts, setDbProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isNavScrolled, setIsNavScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsNavScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchCart = async (userId, productsList) => {
        try {
            const token = localStorage.getItem('accessToken');
            const resComandes = await fetch('/api/comandes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const comandesData = await resComandes.json();

            if (comandesData.status === 'success') {
                const pendingComanda = comandesData.data.find(c =>
                    c.estat === 'pendent' &&
                    (c.usuari === userId || (c.usuari && c.usuari._id === userId))
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
                                    detallId: d._id
                                };
                            });
                        setCart(cartItems);
                    }
                }
            }
        } catch (err) {
            console.error('Error recuperant la cistella', err);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            const loadContent = async () => {
                setIsLoadingProducts(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    const resProducts = await fetch('/api/products', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const productsData = await resProducts.json();
                    let productsList = [];
                    if (productsData.status === 'success') {
                        setDbProducts(productsData.data);
                        productsList = productsData.data;
                    }

                    await fetchCart(user._id, productsList);
                } catch (err) {
                    console.error('Error carregant contingut', err);
                } finally {
                    setIsLoadingProducts(false);
                }
            };
            loadContent();
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    const addToCart = async (product) => {
        setIsCartOpen(true);
        try {
            const token = localStorage.getItem('accessToken');
            let currentComandaId = comandaId;
            if (!currentComandaId) {
                const orderRes = await fetch('/api/comandes', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ usuari: user._id, import_total: 0, estat: 'pendent' })
                });
                const orderData = await orderRes.json();
                if (orderData.status === 'success') {
                    currentComandaId = orderData.data._id;
                    setComandaId(currentComandaId);
                }
            }

            const existingItem = cart.find(item => item._id === product._id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                await fetch(`/api/detallscomanda/${existingItem.detallId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ quantitat: newQuantity })
                });
                setCart(cart.map(item => item._id === product._id ? { ...item, quantity: newQuantity } : item));
            } else {
                const detailRes = await fetch('/api/detallscomanda', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        comanda: currentComandaId,
                        producte: product._id,
                        quantitat: 1
                    })
                });
                const detailData = await detailRes.json();
                if (detailData.status === 'success') {
                    setCart([...cart, {
                        _id: product._id,
                        name: product.nom,
                        price: product.preu,
                        image: product.imatge,
                        quantity: 1,
                        detallId: detailData.data._id
                    }]);
                }
            }
        } catch (error) {
            console.error('Error adding to cart', error);
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
            } else {
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
            }
        } catch (error) {
            console.error('Error updating cart', error);
        }
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Mega Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isNavScrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                            <Star className="text-white w-6 h-6 fill-current" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-brand-dark">TRUE FACTS</h1>
                    </motion.div>

                    <div className="flex items-center space-x-8">
                        <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-slate-600">
                            <a href="#" className="hover:text-brand-blue transition-colors">Shop</a>
                            <a href="#" className="hover:text-brand-blue transition-colors">Collections</a>
                            <a href="#" className="hover:text-brand-blue transition-colors">Our Story</a>
                        </div>

                        <div className="flex items-center space-x-4 border-l pl-8 border-slate-200">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-slate-700 hover:text-brand-blue transition-colors"
                            >
                                <ShoppingBag className="w-6 h-6" />
                                {totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-500 hidden lg:block">Hola, {user?.nom || 'Usuari'}</span>
                                <button
                                    onClick={logout}
                                    className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                                    title="Tancar sessió"
                                >
                                    <LogOut className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar Cart logic */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-black text-brand-dark uppercase tracking-wide">La teva Selecció</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                        <ShoppingBag size={64} strokeWidth={1} className="opacity-20" />
                                        <p className="text-lg font-medium">Cistella buida</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.detallId} className="flex gap-4 group">
                                            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            </div>
                                            <div className="flex-1 flex flex-col py-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item.detallId)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-slate-400 mt-1">{item.price.toFixed(2)}€</p>
                                                <div className="flex items-center gap-3 bg-slate-100 w-max rounded-xl px-2 py-1 mt-auto scale-90 -ml-2">
                                                    <button onClick={() => updateQuantity(item.detallId, -1)} className="hover:text-brand-blue"><Minus size={14} /></button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.detallId, 1)} className="hover:text-brand-blue"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>{totalPrice.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between text-brand-dark text-xl font-black">
                                            <span>Total</span>
                                            <span>{totalPrice.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-brand-dark text-white font-black py-5 rounded-2xl shadow-xl hover:bg-brand-blue transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <span>Check out ARA</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section Redesigned */}
            <div className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-brand-dark">
                <img
                    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1920&q=90"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt="Brand Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark/80" />

                <div className="relative container mx-auto px-6 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 bg-brand-blue text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6"
                    >
                        Nova Col·lecció 2026
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black text-white leading-none mb-8 tracking-tighter"
                    >
                        TRUE FACTS <br />
                        <span className="text-brand-blue italic">URBAN WEAR.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium"
                    >
                        No només vestim cossos, expliquem fets. Descobreix la revolució del minimalisme urbà d'alta qualitat.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button className="px-10 py-5 bg-white text-brand-dark font-black rounded-2xl hover:bg-brand-blue hover:text-white transition-all shadow-2xl">
                            Explora la Botiga
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Feature Bar */}
            <div className="bg-white border-y border-slate-100 py-10">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Qualitat Certificada</h4>
                            <p className="text-xs text-slate-500">Materials orgànics Premium</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Enviament Exprés</h4>
                            <p className="text-xs text-slate-500">24/48h a tot el territori</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Suport Personalitzat</h4>
                            <p className="text-xs text-slate-500">Contacte directe 24/7</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div className="container mx-auto py-32 px-6">
                <div className="flex items-end justify-between mb-16">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter mb-4 uppercase">Productes Destacats</h2>
                        <div className="w-24 h-2 bg-brand-blue rounded-full" />
                    </div>
                    <Link to="#" className="text-sm font-black text-brand-blue border-b-2 border-brand-blue pb-1 hover:text-brand-dark hover:border-brand-dark transition-all">VEURE TOTS</Link>
                </div>

                {isLoadingProducts ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {dbProducts.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="relative aspect-[3/4] bg-slate-200 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                    <img src={product.imatge} alt={product.nom} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-brand-dark/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md text-brand-dark font-black py-4 rounded-2xl translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hover:bg-brand-blue hover:text-white"
                                    >
                                        AFEGIR A LA CISTELLA
                                    </button>
                                </div>
                                <div className="flex justify-between items-start px-2">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{product.categoria}</span>
                                        <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-blue transition-colors line-clamp-1">{product.nom}</h3>
                                    </div>
                                    <p className="text-lg font-black text-brand-dark">{product.preu.toFixed(2)}€</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Brand Footer */}
            <footer className="bg-brand-dark text-white py-24 mt-20">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-4xl font-black mb-6">TRUE FACTS.</h2>
                        <p className="text-slate-400 max-w-sm text-lg">La veritat es vesteix amb minimalisme. Fabricat amb passió per aquells que no segueixen les masses.</p>
                    </div>
                    <div>
                        <h5 className="font-bold mb-6 text-slate-200">Enllaços</h5>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Politica de privadesa</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Termes i condicions</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Enviament i devolucions</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold mb-6 text-slate-200">Subscriu-te</h5>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="La teva adreça"
                                className="w-full bg-slate-800 border-none rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                            />
                            <button className="absolute right-2 top-2 bg-brand-blue p-2 rounded-lg">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-xs">
                    <p>&copy; {new Date().getFullYear()} TRUE FACTS CLOTHING. TOTS ELS DRETS RESERVATS.</p>
                </div>
            </footer>
        </div>
    );
}
