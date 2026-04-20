import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight } from 'lucide-react';

export default function CheckoutCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-12 text-center shadow-2xl"
            >
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/20">
                    <XCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                    Pagament Cancel·lat
                </h1>
                <p className="text-slate-400 mb-10 text-lg">
                    El pagament ha estat cancel·lat. No s'ha fet cap càrrec. La teva cistella es manté intacta.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 group"
                    >
                        <span>TORNAR AL CHECKOUT</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-800 text-slate-300 font-black py-5 rounded-2xl hover:bg-slate-700 transition-all"
                    >
                        TORNAR A LA BOTIGA
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
