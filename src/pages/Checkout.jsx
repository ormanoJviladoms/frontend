import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Checkout() {
    const navigate = useNavigate();
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
        cognom: '',
        email: '',
        telefon: '',
        adreca: '',
        ciutat: '',
        codiPostal: '',
        provincia: '',
        metodePagament: 'targeta',
        numTargeta: '',
        caducitat: '',
        cvv: '',
        titular: '',
    });

    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }

        const loadCart = async () => {
            try {
                const resComandes = await fetch('/api/comandes');
                const comandesData = await resComandes.json();

                if (comandesData.status === 'success') {
                    const pendingComanda = comandesData.data.find(c =>
                        c.estat === 'pendent' &&
                        (c.usuari === userId || (c.usuari && c.usuari._id === userId))
                    );

                    if (!pendingComanda) {
                        navigate('/');
                        return;
                    }

                    setComandaId(pendingComanda._id);

                    const resDetalls = await fetch('/api/detallscomanda');
                    const detallsData = await resDetalls.json();

                    if (detallsData.status === 'success') {
                        const cartItems = detallsData.data
                            .filter(d => d.comanda && (d.comanda._id === pendingComanda._id || d.comanda === pendingComanda._id))
                            .map(d => ({
                                producte: d.producte?.nom || 'Producte',
                                quantitat: d.quantitat,
                                preu: d.producte?.preu || 0,
                                image: getProductImage(d.producte?.nom),
                            }));
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
        loadCart();
    }, [navigate]);

    const getProductImage = (nom) => {
        const images = {
            'Samarreta True Facts Basic': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            'Edició Limitada Estiu': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            'True Facts Vintage': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            'Samarreta Gràfica': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            'Col·lecció Urbana': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            'True Facts Premium': 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        };
        return images[nom] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.preu * item.quantitat), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantitat, 0);

    const validateStep1 = () => {
        if (!formData.nom || !formData.cognom || !formData.email || !formData.telefon) {
            setError('Omple tots els camps personals');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        if (!formData.adreca || !formData.ciutat || !formData.codiPostal || !formData.provincia) {
            setError("Omple tots els camps d'enviament");
            return false;
        }
        setError('');
        return true;
    };

    const validateStep3 = () => {
        if (formData.metodePagament === 'targeta') {
            if (!formData.numTargeta || !formData.caducitat || !formData.cvv || !formData.titular) {
                setError('Omple tots els camps de pagament');
                return false;
            }
        }
        setError('');
        return true;
    };

    const nextStep = () => {
        if (currentStep === 1 && validateStep1()) setCurrentStep(2);
        else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    };

    const prevStep = () => {
        setError('');
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;
        if (!comandaId) return;

        setProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comandaId,
                    pagament: {
                        metode: formData.metodePagament,
                    },
                    enviament: {
                        empresa_transport: 'SEUR',
                    },
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
            setError('Error de connexió amb el servidor');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Carregant...</p>
                </div>
            </div>
        );
    }

    // ─── Success Screen ────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center transform animate-fade-in-up">
                    {/* Checkmark animat */}
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Compra realitzada!</h1>
                    <p className="text-lg text-gray-500 mb-8">
                        La teva comanda ha estat processada correctament.
                    </p>

                    {orderResult && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Import Total</span>
                                <span className="font-bold text-gray-900">{orderResult.comanda.import_total.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estat</span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Processant
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Codi de seguiment</span>
                                <span className="font-mono text-sm font-bold text-gray-700">{orderResult.enviament.codi_seguiment}</span>
                            </div>
                            <div className="h-px bg-gray-200"></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Productes:</p>
                                {orderResult.detalls.map((d, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-600">{d.producte} × {d.quantitat}</span>
                                        <span className="text-gray-900 font-medium">{d.subtotal.toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Link
                        to="/"
                        className="inline-block w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        Tornar a la botiga
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Step Indicators ───────────────────────────────────────────
    const steps = [
        { num: 1, label: 'Dades Personals' },
        { num: 2, label: 'Enviament' },
        { num: 3, label: 'Pagament' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">TRUE FACTS</Link>
                    <Link to="/" className="text-gray-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Tornar a la botiga
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-10 max-w-6xl">
                {/* Step Progress */}
                <div className="flex items-center justify-center mb-12">
                    {steps.map((step, i) => (
                        <React.Fragment key={step.num}>
                            <div className="flex flex-col items-center">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md
                                    ${currentStep >= step.num
                                        ? 'bg-blue-600 text-white shadow-blue-500/40'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {currentStep > step.num ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step.num
                                    )}
                                </div>
                                <span className={`text-xs mt-2 font-semibold transition-colors ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-20 sm:w-32 h-1 mx-2 rounded-full transition-colors duration-300 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-red-700 font-medium text-sm">{error}</p>
                                </div>
                            )}

                            {/* Step 1: Dades Personals */}
                            {currentStep === 1 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Dades Personals</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Nom *</label>
                                            <input type="text" name="nom" value={formData.nom} onChange={handleChange}
                                                placeholder="Joan" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Cognom *</label>
                                            <input type="text" name="cognom" value={formData.cognom} onChange={handleChange}
                                                placeholder="Garcia" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Correu electrònic *</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                placeholder="joan@exemple.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Telèfon *</label>
                                            <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange}
                                                placeholder="+34 600 000 000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button type="button" onClick={nextStep}
                                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                            Continuar
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Enviament */}
                            {currentStep === 2 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Adreça d&apos;Enviament</h2>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Adreça *</label>
                                            <input type="text" name="adreca" value={formData.adreca} onChange={handleChange}
                                                placeholder="Carrer Principal 123, 2n 1a" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-2">Ciutat *</label>
                                                <input type="text" name="ciutat" value={formData.ciutat} onChange={handleChange}
                                                    placeholder="Barcelona" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-2">Codi Postal *</label>
                                                <input type="text" name="codiPostal" value={formData.codiPostal} onChange={handleChange}
                                                    placeholder="08001" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-2">Província *</label>
                                                <input type="text" name="provincia" value={formData.provincia} onChange={handleChange}
                                                    placeholder="Barcelona" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info enviament */}
                                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <p className="text-green-700 text-sm font-medium">Enviament gratuït amb SEUR · Lliurament en 2-4 dies laborables</p>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button type="button" onClick={prevStep}
                                            className="text-gray-500 hover:text-gray-700 font-bold py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Enrere
                                        </button>
                                        <button type="button" onClick={nextStep}
                                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                            Continuar
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Pagament */}
                            {currentStep === 3 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Mètode de Pagament</h2>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {[
                                            { id: 'targeta', label: 'Targeta', icon: '💳' },
                                            { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                                            { id: 'transferencia', label: 'Transferència', icon: '🏦' },
                                        ].map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, metodePagament: method.id }))}
                                                className={`p-4 rounded-xl border-2 text-center transition-all font-semibold text-sm
                                                    ${formData.metodePagament === method.id
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-2xl block mb-1">{method.icon}</span>
                                                {method.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Card Details */}
                                    {formData.metodePagament === 'targeta' && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-2">Titular de la targeta *</label>
                                                <input type="text" name="titular" value={formData.titular} onChange={handleChange}
                                                    placeholder="JOAN GARCIA" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white uppercase" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-600 mb-2">Número de targeta *</label>
                                                <input type="text" name="numTargeta" value={formData.numTargeta} onChange={handleChange}
                                                    placeholder="1234 5678 9012 3456" maxLength={19} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white font-mono tracking-wider" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Data de caducitat *</label>
                                                    <input type="text" name="caducitat" value={formData.caducitat} onChange={handleChange}
                                                        placeholder="MM/AA" maxLength={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white font-mono" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-600 mb-2">CVV *</label>
                                                    <input type="text" name="cvv" value={formData.cvv} onChange={handleChange}
                                                        placeholder="123" maxLength={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white font-mono" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.metodePagament === 'paypal' && (
                                        <div className="p-6 bg-blue-50 rounded-xl text-center">
                                            <p className="text-blue-700 font-medium">Seràs redirigit a PayPal per completar el pagament.</p>
                                        </div>
                                    )}

                                    {formData.metodePagament === 'transferencia' && (
                                        <div className="p-6 bg-amber-50 rounded-xl text-center">
                                            <p className="text-amber-700 font-medium">Rebràs les dades bancàries per correu electrònic després de confirmar.</p>
                                        </div>
                                    )}

                                    {/* Security Badge */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">Pagament segur amb encriptació SSL de 256 bits</p>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button type="button" onClick={prevStep}
                                            className="text-gray-500 hover:text-gray-700 font-bold py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Enrere
                                        </button>
                                        <button type="submit" disabled={processing}
                                            className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform flex items-center gap-2
                                                ${processing
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-500/30 hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Processant...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Pagar {totalPrice.toFixed(2)}€
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Resum de la Comanda</h3>

                            <div className="space-y-4 mb-6">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.producte} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{item.producte}</p>
                                            <p className="text-gray-400 text-xs">Quantitat: {item.quantitat}</p>
                                            <p className="text-blue-600 font-bold text-sm mt-1">{(item.preu * item.quantitat).toFixed(2)}€</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-gray-100 mb-4"></div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal ({totalItems} articles)</span>
                                    <span className="font-medium">{totalPrice.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Enviament</span>
                                    <span className="text-green-600 font-medium">Gratuït</span>
                                </div>
                                <div className="h-px bg-gray-100"></div>
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{totalPrice.toFixed(2)}€</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                                {[
                                    { icon: '🔒', text: 'Pagament 100% segur' },
                                    { icon: '🚚', text: 'Enviament gratuït' },
                                    { icon: '↩️', text: 'Devolucions en 30 dies' },
                                ].map((badge, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{badge.icon}</span>
                                        <span>{badge.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
