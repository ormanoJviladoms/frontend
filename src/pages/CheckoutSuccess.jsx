import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-12 text-center shadow-2xl"
            >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                    Pagament Completat!
                </h1>
                <p className="text-slate-400 mb-10 text-lg">
                    La teva comanda ha estat processada correctament. Rebràs un correu de confirmació amb els detalls de l'enviament.
                </p>

                <div className="bg-slate-800/50 rounded-3xl p-6 mb-10 text-left border border-slate-700">
                    <div className="flex items-center gap-3 text-green-400 mb-4">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-sm">Pagament verificat per Stripe</span>
                    </div>
                    <p className="text-slate-500 text-xs">
                        El teu pagament s'ha processat de forma segura. L'estat de la comanda s'actualitzarà automàticament.
                    </p>
                </div>

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
