import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const products = [
    {
        id: 1,
        name: 'Samarreta True Facts Basic',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 2,
        name: 'Edició Limitada Estiu',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 3,
        name: 'True Facts Vintage',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 4,
        name: 'Samarreta Gràfica',
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 5,
        name: 'Col·lecció Urbana',
        price: 27.99,
        image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 6,
        name: 'True Facts Premium',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    }
];

export default function Home() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCart(currentCart => currentCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setCart(currentCart => currentCart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative">
            {/* Navbar Simple */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-blue-600 tracking-tighter">TRUE FACTS</h1>
                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden sm:block">
                            Iniciar sessió
                        </Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hidden sm:block">
                            Registre
                        </Link>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                    <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                        <div className="w-full h-full bg-white shadow-2xl flex flex-col transform transition-transform animate-slide-in-right">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900">La teva Cistella</h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-lg font-medium">La cistella és buida</p>
                                        <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold hover:underline">
                                            Començar a comprar
                                        </button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <p className="text-blue-600 font-bold mt-1">{item.price.toFixed(2)}€</p>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 w-max rounded-lg p-1 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 bg-white border-t border-gray-100 shadow-negative">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{totalPrice.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Enviament</span>
                                            <span className="text-green-600 font-medium">Gratuït</span>
                                        </div>
                                        <div className="h-px bg-gray-100"></div>
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>{totalPrice.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                        Finalitzar Compra
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight animate-fade-in-up">
                        Benvinguts a la nostra botiga
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto font-light">
                        Descobreix els millors productes al millor preu. Qualitat garantida en cada samarreta.
                    </p>
                    <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg">
                        Veure Productes
                    </button>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="container mx-auto py-20 px-4">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Productes Destacats</h2>
                    <div className="h-1 flex-1 bg-gray-200 ml-8 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100">
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                <p className="text-gray-500 text-lg font-medium mb-6">{product.price.toFixed(2)}€</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95 transform"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Afegir al Cistell
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2026 True Facts. Tots els drets reservats.</p>
                </div>
            </footer>
        </div>
    );
}
