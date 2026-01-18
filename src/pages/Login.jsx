import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Benvingut de nou</h2>
                    <p className="text-gray-500">Inicia sessió per continuar al teu compte</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adreça electrònica
                        </label>
                        <input
                            type="email"
                            placeholder="tu@exemple.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contrasenya
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Recorda'm
                            </label>
                        </div>
                        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Has oblidat la contrasenya?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Inicia sessió
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    No tens compte?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Registra't
                    </Link>
                </p>
            </div>
        </div>
    );
}
