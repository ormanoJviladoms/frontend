import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function CheckoutSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verification, setVerification] = useState({
        status: 'checking',
        message: 'Verificant el pagament amb Stripe...'
    });

    useEffect(() => {
        const confirmPayment = async () => {
            const sessionId = searchParams.get('session_id');

            if (!sessionId) {
                setVerification({
                    status: 'error',
                    message: 'No s\'ha trobat la sessio de Stripe.'
                });
                return;
            }

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/checkout/session/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.status === 'success') {
                    setVerification({
                        status: 'success',
                        message: 'Pagament verificat i comanda actualitzada.'
                    });
                    return;
                }

                setVerification({
                    status: 'error',
                    message: data.message || 'Stripe encara no ha confirmat el pagament.'
                });
            } catch {
                setVerification({
                    status: 'error',
                    message: 'No s\'ha pogut connectar amb el servidor.'
                });
            }
        };

        confirmPayment();
    }, [searchParams]);

    const isChecking = verification.status === 'checking';
    const isSuccess = verification.status === 'success';

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-12 text-center shadow-2xl"
            >
                <div className={`w-24 h-24 ${isSuccess ? 'bg-green-500 shadow-green-500/20' : 'bg-amber-500 shadow-amber-500/20'} rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                    {isChecking && <Loader2 className="w-12 h-12 text-white animate-spin" />}
                    {!isChecking && isSuccess && <CheckCircle2 className="w-12 h-12 text-white" />}
                    {!isChecking && !isSuccess && <AlertCircle className="w-12 h-12 text-white" />}
                </div>
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                    {isSuccess ? 'Pagament completat!' : 'Revisant pagament'}
                </h1>
                <p className="text-slate-400 mb-10 text-lg">
                    {isSuccess
                        ? "La teva comanda ha estat processada correctament. Rebras un correu de confirmacio amb els detalls de l'enviament."
                        : verification.message}
                </p>

                <div className="bg-slate-800/50 rounded-3xl p-6 mb-10 text-left border border-slate-700">
                    <div className={`flex items-center gap-3 ${isSuccess ? 'text-green-400' : 'text-amber-300'} mb-4`}>
                        {isChecking ? <Loader2 size={20} className="animate-spin" /> : isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm">{verification.message}</span>
                    </div>
                    <p className="text-slate-500 text-xs">
                        Ara la pagina comprova la sessio de Stripe al backend i actualitza l'estat de la comanda abans de donar-la per bona.
                    </p>
                </div>

                <button
                    onClick={() => navigate(isSuccess ? '/dashboard' : '/checkout')}
                    className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                >
                    {isSuccess ? 'VEURE EL DASHBOARD' : 'TORNAR AL CHECKOUT'}
                </button>
            </motion.div>
        </div>
    );
}
