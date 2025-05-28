// pages/AirQuality.jsx
import React, { useState } from 'react';
import AirQualityWidget from '../components/AirQualityWidget';

export default function AirQuality() {
    const [city, setCity] = useState('');
    const [searchCity, setSearchCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city.trim()) {
            setSearchCity(city.trim());
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    🌬️ Jakość powietrza
                </h1>
                <p className="text-blue-200 mb-6">
                    Sprawdź jakość powietrza w wybranym mieście. Indeks AQI informuje o poziomie zanieczyszczenia powietrza.
                </p>

                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Wprowadź nazwę miasta..."
                        className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                    >
                        Sprawdź
                    </button>
                </form>
            </div>

            {searchCity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AirQualityWidget city={searchCity} />

                    <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Skala AQI</h3>
                        <div className="space-y-3">
                            {[
                                { level: 1, desc: 'Bardzo dobra', color: 'bg-green-500', range: '0-50' },
                                { level: 2, desc: 'Dobra', color: 'bg-yellow-500', range: '51-100' },
                                { level: 3, desc: 'Umiarkowana', color: 'bg-orange-500', range: '101-150' },
                                { level: 4, desc: 'Zła', color: 'bg-red-500', range: '151-200' },
                                { level: 5, desc: 'Bardzo zła', color: 'bg-purple-500', range: '201+' }
                            ].map((item) => (
                                <div key={item.level} className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-sm`}>
                                        {item.level}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.desc}</p>
                                        <p className="text-sm text-gray-400">Zakres: {item.range}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
