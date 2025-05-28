// pages/About.jsx
import React, { useState, useEffect } from 'react';

export default function About() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Błąd pobierania statystyk:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    ℹ️ O aplikacji QuickWeather
                </h1>
                <p className="text-blue-200 text-lg">
                    Nowoczesna aplikacja pogodowa stworzona z wykorzystaniem React i Flask.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">🚀 Funkcjonalności</h2>
                    <ul className="space-y-2 text-blue-200">
                        <li>• Aktualna pogoda i prognoza 5-dniowa</li>
                        <li>• Jakość powietrza (AQI)</li>
                        <li>• Indeks UV z rekomendacjami</li>
                        <li>• Ostrzeżenia meteorologiczne</li>
                        <li>• Porównywanie miast</li>
                        <li>• Wyszukiwanie lokalizacji</li>
                        <li>• Responsywny design</li>
                        <li>• Geolokalizacja</li>
                    </ul>
                </div>

                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">⚙️ Technologie</h2>
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-blue-200">Frontend:</h3>
                            <p className="text-sm text-gray-300">React, React Router, Tailwind CSS</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-200">Backend:</h3>
                            <p className="text-sm text-gray-300">Python, Flask, Flask-CORS</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-200">API:</h3>
                            <p className="text-sm text-gray-300">OpenWeatherMap, Nominatim</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-200">Inne:</h3>
                            <p className="text-sm text-gray-300">Geolocation API, Cache, Error Handling</p>
                        </div>
                    </div>
                </div>
            </div>

            {stats && (
                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">📊 Statystyki serwera</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{stats.cache_entries}</p>
                            <p className="text-sm text-gray-400">Wpisy w cache</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{Math.round(stats.uptime_hours)}h</p>
                            <p className="text-sm text-gray-400">Czas działania</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">{stats.endpoints.length}</p>
                            <p className="text-sm text-gray-400">Endpointy API</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-400">{stats.version}</p>
                            <p className="text-sm text-gray-400">Wersja</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">👥 Zespół</h2>
                <p className="text-blue-200">
                    Projekt stworzony przez zespół 3-osobowy jako część kursu programowania.
                    Aplikacja demonstruje integrację nowoczesnych technologii webowych
                    z zewnętrznymi API pogodowymi.
                </p>
            </div>
        </div>
    );
}
