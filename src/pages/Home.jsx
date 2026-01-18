import React from 'react';
import { Link } from 'react-router-dom';

const products = [
    {
        id: 1,
        name: 'Samarreta True Facts Basic',
        price: '19.99€',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 2,
        name: 'Edició Limitada Estiu',
        price: '24.99€',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 3,
        name: 'True Facts Vintage',
        price: '29.99€',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 4,
        name: 'Samarreta Gràfica',
        price: '22.99€',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 5,
        name: 'Col·lecció Urbana',
        price: '27.99€',
        image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    },
    {
        id: 6,
        name: 'True Facts Premium',
        price: '34.99€',
        image: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    }
];

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar Simple */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-blue-600 tracking-tighter">TRUE FACTS</h1>
                    <div className="space-x-4">
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Iniciar sessió</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                            Registre
                        </Link>
                    </div>
                </div>
            </nav>

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
                                <p className="text-gray-500 text-lg font-medium mb-6">{product.price}</p>
                                <button className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2">
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
