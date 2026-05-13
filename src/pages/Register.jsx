import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefon: '',
        direccio: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Les contrasenyes no coincideixen');
        }

        setIsLoading(true);

        const result = await register({
            nom: formData.nom,
            email: formData.email,
            password: formData.password,
            telefon: formData.telefon,
            direccio: formData.direccio
        });

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full glass-dark rounded-3xl shadow-2xl p-8 md:p-12 relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6 shadow-lg shadow-indigo-600/30"
                    >
                        <UserPlus className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Crea el teu compte</h2>
                    <p className="text-slate-400 text-lg">Uneix-te a la comunitat True Facts</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Nom complet</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    name="nom"
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    placeholder="Joan Garcia"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="joan@exemple.com"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Contrasenya</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Confirma</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Teléfon */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Telèfon</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    name="telefon"
                                    type="tel"
                                    value={formData.telefon}
                                    onChange={handleChange}
                                    placeholder="600 000 000"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Direcció */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Direcció</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <input
                                    name="direccio"
                                    type="text"
                                    value={formData.direccio}
                                    onChange={handleChange}
                                    placeholder="Carrer Exemple, 123"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 py-4 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span className="text-lg">Crear el meu compte</span>
                                <ArrowRight className="w-6 h-6" />
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="mt-10 text-center text-sm text-slate-400">
                    Ja tens un compte?{' '}
                    <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Inicia sessió
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
